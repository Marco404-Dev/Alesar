import type { Pool } from "pg";
import type { KitchenSite } from "./kitchen";

type Queryable = Pick<Pool, "query">;
export type DispatchOrder = {
  id: string; customer: string; confirmedAt: string; state: "RECIBIDO" | "PREPARANDO" | "LISTO_RECOJO";
  pickupCode: string; preparationFinishedAt: string | null;
  products: { name: string; quantity: number }[];
};
export type DispatchSnapshot = { siteName: string; orders: DispatchOrder[] };
export type ControlSnapshot = { siteName: string; orders: { id: string; preparationFinishedAt: string | null; products: { name: string; quantity: number }[] }[] };
export type OperationResult = "ok" | "duplicate" | "not-found" | "invalid-state" | "no-notice" | "invalid-code";

export async function listDispatchOrders(db: Queryable, site: KitchenSite): Promise<DispatchSnapshot> {
  const result = await db.query<{
    pedido_id: string; nombre_cliente: string; confirmado_en: Date; estado_codigo: DispatchOrder["state"];
    codigo_recojo: string; terminado_en: Date | null; productos: { name: string; quantity: number }[];
  }>(`SELECT p.pedido_id, p.nombre_cliente, p.confirmado_en, e.codigo AS estado_codigo,
       p.codigo_recojo, a.terminado_en,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('name', pr.nombre, 'quantity', d.cantidad)
                        ORDER BY d.detalle_id)
                 FROM detalle_pedido d JOIN productos pr ON pr.producto_id = d.producto_id
                 WHERE d.pedido_id = p.pedido_id), '[]'::jsonb) AS productos
     FROM pedidos p JOIN estados_pedido e ON e.estado_id = p.estado_id
     LEFT JOIN avisos_preparacion a ON a.pedido_id = p.pedido_id AND a.confirmado_en IS NULL
     WHERE p.sede_id = $1 AND p.estado_id IN (1, 2, 3) AND p.pago_confirmado = TRUE
     ORDER BY p.confirmado_en ASC, p.pedido_id ASC`, [site.id]);
  return { siteName: site.name, orders: result.rows.map(row => ({
    id: String(row.pedido_id), customer: row.nombre_cliente,
    confirmedAt: new Date(row.confirmado_en).toISOString(), state: row.estado_codigo,
    pickupCode: row.codigo_recojo,
    preparationFinishedAt: row.terminado_en ? new Date(row.terminado_en).toISOString() : null,
    products: row.productos,
  })) };
}

export async function listControlOrders(db: Queryable, site: KitchenSite): Promise<ControlSnapshot> {
  const result = await db.query<{ pedido_id: string; productos: { name: string; quantity: number }[] }>(
    `SELECT p.pedido_id,
       COALESCE(jsonb_agg(jsonb_build_object('name', pr.nombre, 'quantity', d.cantidad)
                          ORDER BY d.detalle_id) FILTER (WHERE d.detalle_id IS NOT NULL), '[]'::jsonb) AS productos
     FROM pedidos p
     LEFT JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
     LEFT JOIN productos pr ON pr.producto_id = d.producto_id
     WHERE p.sede_id = $1 AND p.estado_id = 2 AND p.pago_confirmado = TRUE
       AND NOT EXISTS (
         SELECT 1 FROM avisos_preparacion a
         WHERE a.pedido_id = p.pedido_id
       )
     GROUP BY p.pedido_id
     ORDER BY p.confirmado_en ASC, p.pedido_id ASC`, [site.id]);
  return { siteName: site.name, orders: result.rows.map(row => ({
    id: String(row.pedido_id), preparationFinishedAt: null,
    products: row.productos,
  })) };
}

export async function changeOrder(db: Queryable, site: KitchenSite, orderId: string,
  action: "finish" | "ready" | "deliver", pickupCode?: string): Promise<OperationResult> {
  // Rechaza credenciales propietarias o con DML directo, aunque estén
  // configuradas por error como cuenta operativa. No registra el código.
  const rights = await db.query<{ unsafe: boolean; can_finish: boolean; can_ready: boolean; can_deliver: boolean }>(
    `SELECT (
       has_table_privilege(current_user,'public.pedidos','INSERT') OR
       has_table_privilege(current_user,'public.pedidos','UPDATE') OR
       has_table_privilege(current_user,'public.pedidos','DELETE') OR
       has_table_privilege(current_user,'public.avisos_preparacion','INSERT') OR
       has_table_privilege(current_user,'public.avisos_preparacion','UPDATE') OR
       has_table_privilege(current_user,'public.avisos_preparacion','DELETE') OR
       has_table_privilege(current_user,'public.historial_estados_pedido','INSERT') OR
       has_table_privilege(current_user,'public.historial_estados_pedido','UPDATE') OR
       has_table_privilege(current_user,'public.historial_estados_pedido','DELETE')
     ) AS unsafe,
     has_function_privilege(current_user,'public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE') AS can_finish,
     has_function_privilege(current_user,'public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') AS can_ready,
     has_function_privilege(current_user,'public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE') AS can_deliver`);
  const grants = rights.rows[0];
  const expectedGrants = action === "finish"
    ? grants?.can_finish && !grants.can_ready && !grants.can_deliver
    : !grants?.can_finish && grants.can_ready && grants.can_deliver;
  if (rights.rowCount !== 1 || grants.unsafe || !expectedGrants) {
    throw new Error("La cuenta operativa no tiene los privilegios mínimos de su área");
  }
  const sql = action === "finish"
    ? "SELECT public.fn_t114_terminar_preparacion($1::bigint,$2::bigint) AS result"
    : action === "ready"
      ? "SELECT public.fn_t114_confirmar_listo($1::bigint,$2::bigint) AS result"
      : "SELECT public.fn_t114_entregar_pedido($1::bigint,$2::bigint,$3::text) AS result";
  const params = action === "deliver" ? [site.id, orderId, pickupCode] : [site.id, orderId];
  const result = await db.query<{ result: OperationResult }>(sql, params);
  if (result.rowCount !== 1 || !["ok", "duplicate", "not-found", "invalid-state", "no-notice", "invalid-code"].includes(result.rows[0]?.result))
    throw new Error("La función operativa devolvió un resultado no válido");
  return result.rows[0].result;
}
