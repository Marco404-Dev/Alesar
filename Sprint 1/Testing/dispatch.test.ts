import { describe, expect, it, vi } from "vitest";
import { changeOrder, listControlOrders, listDispatchOrders } from "../../lib/dispatch";

const site = { id: "1", code: "SMP" as const, name: "San Martín de Porres" };

describe("consultas operativas", () => {
  it("filtra despacho por sede y estados activos, ordena y presenta datos", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ pedido_id: "8", nombre_cliente: "Ana", confirmado_en: new Date("2026-10-18T12:00:00Z"), estado_codigo: "PREPARANDO", codigo_recojo: "ABC123", terminado_en: new Date("2026-10-18T12:10:00Z"), productos: [{ name: "Menú", quantity: 2 }] }] });
    const snapshot = await listDispatchOrders({ query } as never, site);
    expect(query.mock.calls[0][0]).toContain("p.sede_id = $1 AND p.estado_id IN (1, 2, 3)");
    expect(query.mock.calls[0][0]).toContain("ORDER BY p.confirmado_en ASC, p.pedido_id ASC");
    expect(query.mock.calls[0][1]).toEqual(["1"]);
    expect(snapshot.orders[0]).toEqual({ id: "8", customer: "Ana", confirmedAt: "2026-10-18T12:00:00.000Z", state: "PREPARANDO", pickupCode: "ABC123", preparationFinishedAt: "2026-10-18T12:10:00.000Z", products: [{ name: "Menú", quantity: 2 }] });
  });

  it("control de cocina excluye avisos persistidos", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ pedido_id: "8", productos: [{ name: "Menú", quantity: 2 }] }] });
    const snapshot = await listControlOrders({ query } as never, site);
    expect(query.mock.calls[0][0]).toContain("p.sede_id = $1 AND p.estado_id = 2");
    expect(query.mock.calls[0][0]).toContain("NOT EXISTS");
    expect(query.mock.calls[0][0]).toContain("FROM avisos_preparacion a");
    expect(snapshot.orders).toEqual([{ id: "8", preparationFinishedAt: null, products: [{ name: "Menú", quantity: 2 }] }]);
    expect(JSON.stringify(snapshot)).not.toContain("codigo_recojo");
  });
});

function mockRestrictedDb(result: string, action: "finish" | "ready" | "deliver") {
  const query = vi.fn(async (sql: string, _params?: unknown[]) =>
    sql.includes("has_table_privilege")
      ? { rowCount: 1, rows: [{ unsafe: false, can_finish: action === "finish", can_ready: action !== "finish", can_deliver: action !== "finish" }] }
      : { rowCount: 1, rows: [{ result }] });
  return { query };
}

describe("funciones SQL con roles acotados", () => {
  it.each([
    ["finish", "fn_t114_terminar_preparacion", ["1", "8"]],
    ["ready", "fn_t114_confirmar_listo", ["1", "8"]],
    ["deliver", "fn_t114_entregar_pedido", ["1", "8", "ABC123"]],
  ] as const)("llama solo la función permitida para %s", async (action, functionName, params) => {
    const db = mockRestrictedDb("ok", action);
    expect(await changeOrder(db as never, site, "8", action, "ABC123")).toBe("ok");
    expect(db.query.mock.calls[1][0]).toContain(functionName);
    expect(db.query.mock.calls[1][1]).toEqual(params);
    expect(db.query.mock.calls.some(([sql]) => /UPDATE pedidos|INSERT INTO avisos/.test(sql))).toBe(false);
  });

  it("rechaza una cuenta con permisos directos aunque la URL esté configurada", async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ unsafe: true, can_finish: false, can_ready: true, can_deliver: true }] });
    await expect(changeOrder({ query } as never, site, "8", "ready")).rejects.toThrow(/privilegios mínimos/);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("rechaza credenciales que pueden invocar funciones de otra área", async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ unsafe: false, can_finish: true, can_ready: true, can_deliver: true }] });
    await expect(changeOrder({ query } as never, site, "8", "finish")).rejects.toThrow(/privilegios mínimos/);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("rechaza un resultado SQL desconocido sin tratarlo como éxito", async () => {
    const db = mockRestrictedDb("unexpected", "ready");
    await expect(changeOrder(db as never, site, "8", "ready")).rejects.toThrow(/resultado no válido/);
  });

  it.each(["duplicate", "no-notice", "invalid-state", "invalid-code", "not-found"] as const)(
    "transmite el rechazo %s desde PostgreSQL sin escribir directamente", async result => {
      const db = mockRestrictedDb(result, "ready");
      expect(await changeOrder(db as never, site, "8", "ready")).toBe(result);
    });
});
