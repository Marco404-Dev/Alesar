import { describe, expect, it, vi } from "vitest";
import { findKitchenSite, listKitchenProducts, siteCodeFromSlug } from "../../lib/kitchen";

describe("sedes del monitor", () => {
  it("acepta únicamente SMP y La Molina", () => {
    expect(siteCodeFromSlug("smp")).toBe("SMP");
    expect(siteCodeFromSlug("lm")).toBe("LM");
    expect(siteCodeFromSlug("otra")).toBeNull();
  });

  it("resuelve la sede desde PostgreSQL con un código validado", async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ sede_id: "2", nombre: "La Molina" }] });
    expect(await findKitchenSite({ query } as never, "LM")).toEqual({ id: "2", code: "LM", name: "La Molina" });
    expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE codigo = $1"), ["LM"]);
  });
});

describe("líneas de productos", () => {
  const site = { id: "2", code: "LM" as const, name: "La Molina" };

  it("filtra por sede y estados activos, conserva líneas separadas y orden cronológico", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [
      { detalle_id: "10", pedido_id: "7", producto_id: "5", nombre: "Menú", cantidad: 2 },
      { detalle_id: "14", pedido_id: "9", producto_id: "5", nombre: "Menú", cantidad: 1 },
    ] });
    const snapshot = await listKitchenProducts({ query } as never, site);
    expect(query.mock.calls[0][0]).toContain("p.sede_id = $1 AND p.estado_id IN (1, 2)");
    expect(query.mock.calls[0][0]).toContain("ORDER BY p.confirmado_en ASC, p.pedido_id ASC, d.detalle_id ASC");
    expect(query.mock.calls[0][1]).toEqual(["2"]);
    expect(snapshot.lines).toEqual([
      { lineId: "10", orderId: "7", productId: "5", name: "Menú", quantity: 2 },
      { lineId: "14", orderId: "9", productId: "5", name: "Menú", quantity: 1 },
    ]);
  });

  it("retira productos cuando la consulta ya no devuelve el pedido listo", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ detalle_id: "10", pedido_id: "7", producto_id: "5", nombre: "Menú", cantidad: 2 }] })
      .mockResolvedValueOnce({ rows: [] });
    const db = { query } as never;
    expect((await listKitchenProducts(db, site)).lines).toHaveLength(1);
    expect((await listKitchenProducts(db, site)).lines).toEqual([]);
  });
});
