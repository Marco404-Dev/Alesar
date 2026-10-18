import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import type { Client } from "pg";
import { createKitchenStream } from "../../lib/kitchen-stream";
import { observeKitchenStream } from "../../lib/kitchen-event-client";
import type { KitchenSnapshot } from "../../lib/kitchen";

class FakeClient extends EventEmitter {
  connect = vi.fn(async () => {});
  query = vi.fn(async () => ({}));
  end = vi.fn(async () => {});
}

const decoder = new TextDecoder();
const snapshot = (quantity: number): KitchenSnapshot => ({ siteName: "San Martín de Porres", lines: quantity ? [
  { lineId: "3", orderId: "2", productId: "8", name: "Jugo", quantity },
] : [] });

describe("SSE de cocina", () => {
  it("libera el cliente si falla la conexión o LISTEN", async () => {
    const connectFailure = new FakeClient();
    connectFailure.connect.mockRejectedValueOnce(Object.assign(new Error("falló"), { code: "ECONNREFUSED" }));
    await expect(createKitchenStream(connectFailure as unknown as Client, "1", async () => snapshot(0), new AbortController().signal)).rejects.toThrow();
    expect(connectFailure.end).toHaveBeenCalledOnce();

    const listenFailure = new FakeClient();
    listenFailure.query.mockRejectedValueOnce(Object.assign(new Error("falló"), { code: "XX000" }));
    await expect(createKitchenStream(listenFailure as unknown as Client, "1", async () => snapshot(0), new AbortController().signal)).rejects.toThrow();
    expect(listenFailure.query).toHaveBeenCalledWith("LISTEN allinstant_cocina");
    expect(listenFailure.end).toHaveBeenCalledOnce();
  });

  it("libera LISTEN si la petición se cancela durante el inicio", async () => {
    const client = new FakeClient();
    const abort = new AbortController();
    abort.abort();
    await expect(createKitchenStream(client as unknown as Client, "1", async () => snapshot(0), abort.signal)).rejects.toThrow(/cerró/);
    expect(client.end).toHaveBeenCalledOnce();
  });

  it("envía foto inicial y cambios de la sede, incluidos retiros", async () => {
    const client = new FakeClient();
    const load = vi.fn().mockResolvedValueOnce(snapshot(2)).mockResolvedValueOnce(snapshot(0));
    const abort = new AbortController();
    const stream = await createKitchenStream(client as unknown as Client, "1", load, abort.signal);
    const reader = stream.getReader();
    expect(decoder.decode((await reader.read()).value)).toContain("retry: 2000");
    expect(decoder.decode((await reader.read()).value)).toContain('"quantity":2');
    client.emit("notification", { channel: "allinstant_cocina", payload: "2" });
    expect(load).toHaveBeenCalledTimes(1);
    client.emit("notification", { channel: "allinstant_cocina", payload: "1" });
    expect(decoder.decode((await reader.read()).value)).toContain('"lines":[]');
    expect(load).toHaveBeenCalledTimes(2);
    abort.abort();
    expect(client.end).toHaveBeenCalled();
  });

  it("reconsulta toda la lista al reconectar y recupera cambios perdidos", async () => {
    const first = new FakeClient();
    const firstAbort = new AbortController();
    const firstStream = await createKitchenStream(first as unknown as Client, "1", async () => snapshot(2), firstAbort.signal);
    const firstReader = firstStream.getReader();
    await firstReader.read();
    await firstReader.read();
    firstAbort.abort();

    const second = new FakeClient();
    const secondStream = await createKitchenStream(second as unknown as Client, "1", async () => snapshot(0), new AbortController().signal);
    const secondReader = secondStream.getReader();
    await secondReader.read();
    expect(decoder.decode((await secondReader.read()).value)).toContain('"lines":[]');
    await secondReader.cancel();
  });

  it("el cliente reemplaza la foto tras reconectar", () => {
    const listeners = new Map<string, (event: Event) => void>();
    const source = {
      addEventListener: vi.fn((name: string, callback: (event: Event) => void) => listeners.set(name, callback)),
      removeEventListener: vi.fn((name: string) => listeners.delete(name)),
      close: vi.fn(),
      onopen: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };
    const onSnapshot = vi.fn();
    const onConnection = vi.fn();
    const stop = observeKitchenStream(source as never, onSnapshot, onConnection);
    source.onopen?.();
    listeners.get("snapshot")?.({ data: JSON.stringify(snapshot(2)) } as MessageEvent);
    source.onerror?.();
    source.onopen?.();
    listeners.get("snapshot")?.({ data: JSON.stringify(snapshot(0)) } as MessageEvent);
    expect(onConnection.mock.calls).toEqual([[true], [false], [true]]);
    expect(onSnapshot.mock.calls[1][0].lines).toEqual([]);
    stop();
    expect(source.close).toHaveBeenCalled();
  });
});
