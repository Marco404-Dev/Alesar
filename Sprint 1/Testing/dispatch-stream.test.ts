import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import type { Client } from "pg";
import { createKitchenStream } from "../../lib/kitchen-stream";

class FakeClient extends EventEmitter {
  connect = vi.fn(async () => {});
  query = vi.fn(async (_sql: string) => ({}));
  end = vi.fn(async () => {});
}

const decoder = new TextDecoder();

describe("SSE operativo", () => {
  it("despacho escucha su canal y sede y publica foto tras un aviso", async () => {
    const client = new FakeClient();
    const load = vi.fn().mockResolvedValueOnce({ orders: [] }).mockResolvedValueOnce({ orders: [{ id: "8" }] });
    const abort = new AbortController();
    const stream = await createKitchenStream(client as unknown as Client, "1", load, abort.signal, ["allinstant_despacho"]);
    const reader = stream.getReader();
    expect(client.query).toHaveBeenCalledWith("LISTEN allinstant_despacho");
    await reader.read();
    expect(decoder.decode((await reader.read()).value)).toContain('"orders":[]');
    client.emit("notification", { channel: "allinstant_despacho", payload: "2" });
    expect(load).toHaveBeenCalledTimes(1);
    client.emit("notification", { channel: "allinstant_despacho", payload: "1" });
    expect(decoder.decode((await reader.read()).value)).toContain('"id":"8"');
    abort.abort();
  });

  it("control escucha cocina y despacho; reconexión recupera aviso persistido", async () => {
    const first = new FakeClient();
    const abort = new AbortController();
    const firstStream = await createKitchenStream(first as unknown as Client, "1", async () => ({ orders: [{ id: "8", preparationFinishedAt: null }] }), abort.signal, ["allinstant_cocina", "allinstant_despacho"]);
    const reader = firstStream.getReader();
    await reader.read(); await reader.read(); abort.abort();
    expect(first.query.mock.calls.map(call => String(call[0]))).toEqual(["LISTEN allinstant_cocina", "LISTEN allinstant_despacho"]);
    const second = new FakeClient();
    const secondStream = await createKitchenStream(second as unknown as Client, "1", async () => ({ orders: [{ id: "8", preparationFinishedAt: "2026-10-18T12:00:00Z" }] }), new AbortController().signal, ["allinstant_cocina", "allinstant_despacho"]);
    const secondReader = secondStream.getReader();
    await secondReader.read();
    expect(decoder.decode((await secondReader.read()).value)).toContain("preparationFinishedAt");
    await secondReader.cancel();
  });
});
