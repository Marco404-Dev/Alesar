import type { Pool } from "pg";

export type SiteCode = "SMP" | "LM";
export type KitchenSite = { id: string; code: SiteCode; name: string };
export type ProductLine = {
  lineId: string;
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
};
export type KitchenSnapshot = { siteName: string; lines: ProductLine[] };

type Queryable = Pick<Pool, "query">;

export function siteCodeFromSlug(slug: string): SiteCode | null {
  if (slug === "smp") return "SMP";
  if (slug === "lm") return "LM";
  return null;
}

export async function findKitchenSite(db: Queryable, code: SiteCode): Promise<KitchenSite> {
  const result = await db.query<{ sede_id: string; nombre: string }>(
    "SELECT sede_id, nombre FROM sedes WHERE codigo = $1", [code]
  );
  if (result.rowCount !== 1) throw new Error(`La sede ${code} no existe en la base de datos`);
  return { id: String(result.rows[0].sede_id), code, name: result.rows[0].nombre };
}

export async function listKitchenProducts(db: Queryable, site: KitchenSite): Promise<KitchenSnapshot> {
  const result = await db.query<{
    detalle_id: string;
    pedido_id: string;
    producto_id: string;
    nombre: string;
    cantidad: number;
  }>(
    `SELECT d.detalle_id, d.pedido_id, d.producto_id, pr.nombre, d.cantidad
     FROM pedidos p
     JOIN detalle_pedido d ON d.pedido_id = p.pedido_id
     JOIN productos pr ON pr.producto_id = d.producto_id
     WHERE p.sede_id = $1 AND p.estado_id IN (1, 2) AND p.pago_confirmado = TRUE
     ORDER BY p.confirmado_en ASC, p.pedido_id ASC, d.detalle_id ASC`,
    [site.id]
  );
  return {
    siteName: site.name,
    lines: result.rows.map(row => ({
      lineId: String(row.detalle_id),
      orderId: String(row.pedido_id),
      productId: String(row.producto_id),
      name: row.nombre,
      quantity: row.cantidad,
    })),
  };
}
