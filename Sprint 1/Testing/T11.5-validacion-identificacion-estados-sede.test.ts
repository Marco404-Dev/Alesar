import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { Client } from "pg";
import { listControlOrders, listDispatchOrders } from "../../lib/dispatch";
import { createOperationsStream } from "../../lib/operations-stream";
import { siteCodeFromSlug } from "../../lib/operations-site";

const schema = readFileSync(fileURLToPath(new URL("../../Sprint 2/Codigo/Base de Datos/T11.2_estructura_pedidos_y_estados.sql", import.meta.url)), "utf8");
const site = { id: "1", code: "SMP" as const, name: "San Martín de Porres" };
const decoder = new TextDecoder();

class FakeClient extends EventEmitter {
  connect = vi.fn(async () => {});
  query = vi.fn(async () => ({}));
  end = vi.fn(async () => {});
}

describe("T11.5 — identificación, estados, sede y nuevos pedidos", () => {
  it("conserva identificador de pedido y código de recojo únicos e inmutables", () => {
    expect(schema).toMatch(/pedido_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY/);
    expect(schema).toMatch(/codigo_recojo VARCHAR\(20\) NOT NULL UNIQUE/);
    expect(schema).toContain("No se permite modificar sede, código o fecha de confirmación del pedido");
  });

  it("resuelve solo SMP y LM y consulta cada lista con sede, estado y pago", async () => {
    expect(siteCodeFromSlug("smp")).toBe("SMP");
    expect(siteCodeFromSlug("lm")).toBe("LM");
    expect(siteCodeFromSlug("otra-sede")).toBeNull();

    const controlQuery = vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ pedido_id: "31", productos: [{ name: "Menú", quantity: 1 }] }] });
    const dispatchQuery = vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ pedido_id: "31", nombre_cliente: "Cliente", confirmado_en: new Date("2026-10-18T12:00:00Z"), estado_codigo: "PREPARANDO", codigo_recojo: "P31", terminado_en: null, productos: [] }] });
    expect((await listControlOrders({ query: controlQuery } as never, site)).orders[0].id).toBe("31");
    expect((await listDispatchOrders({ query: dispatchQuery } as never, site)).orders[0].id).toBe("31");
    expect(controlQuery.mock.calls[0][0]).toContain("p.sede_id = $1 AND p.estado_id = 2 AND p.pago_confirmado = TRUE");
    expect(controlQuery.mock.calls[0][0]).toContain("NOT EXISTS");
    expect(controlQuery.mock.calls[0][1]).toEqual(["1"]);
    expect(dispatchQuery.mock.calls[0][0]).toContain("p.sede_id = $1 AND p.estado_id IN (1, 2, 3) AND p.pago_confirmado = TRUE");
    expect(dispatchQuery.mock.calls[0][1]).toEqual(["1"]);
  });

  it("publica altas y retiro de cocina por SSE solo para la sede notificada", async () => {
    const client = new FakeClient();
    const load = vi.fn()
      .mockResolvedValueOnce({ orders: [] })
      .mockResolvedValueOnce({ orders: [{ id: "31", preparationFinishedAt: null, products: [{ name: "Menú", quantity: 1 }] }] })
      .mockResolvedValueOnce({ orders: [] });
    const abort = new AbortController();
    const stream = await createOperationsStream(client as unknown as Client, "1", load, abort.signal, ["allinstant_cocina", "allinstant_despacho"]);
    const reader = stream.getReader();
    await reader.read();
    expect(decoder.decode((await reader.read()).value)).toContain('"orders":[]');

    client.emit("notification", { channel: "allinstant_cocina", payload: "2" });
    expect(load).toHaveBeenCalledTimes(1);
    client.emit("notification", { channel: "allinstant_cocina", payload: "1" });
    expect(decoder.decode((await reader.read()).value)).toContain('"id":"31"');

    client.emit("notification", { channel: "allinstant_despacho", payload: "1" });
    expect(decoder.decode((await reader.read()).value)).toContain('"orders":[]');
    abort.abort();
  });
});
