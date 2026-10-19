import type { Client, Notification } from "pg";

const encoder = new TextEncoder();

function errorCode(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  return typeof code === "string" ? code : "SIN_CODIGO";
}

export async function createOperationsStream<T>(
  client: Client,
  siteId: string,
  loadSnapshot: () => Promise<T>,
  signal: AbortSignal,
  channels: readonly ("allinstant_cocina" | "allinstant_despacho")[],
): Promise<ReadableStream<Uint8Array>> {
  try {
    await client.connect();
  } catch (error) {
    console.error("SSE operativo: falló la conexión directa a PostgreSQL", errorCode(error));
    await client.end().catch(() => {});
    throw error;
  }
  try {
    for (const name of channels) {
      await client.query(`LISTEN ${name}`);
    }
  } catch (error) {
    console.error("SSE operativo: falló LISTEN", errorCode(error));
    await client.end().catch(() => {});
    throw error;
  }
  if (signal.aborted) {
    await client.end().catch(() => {});
    throw new Error("La solicitud SSE se cerró antes de iniciar el flujo");
  }

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;
  let loading = false;
  let dirty = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  function send(value: string) {
    if (!closed && controller) controller.enqueue(encoder.encode(value));
  }

  function cleanup() {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    signal.removeEventListener("abort", cleanup);
    client.off("notification", onNotification);
    client.off("end", onDisconnect);
    void client.end().catch(() => {}).finally(() => client.off("error", onError));
    try { controller?.close(); } catch { /* El navegador ya cerró la conexión. */ }
  }

  function onError(error: Error) {
    console.error("SSE operativo: conexión PostgreSQL interrumpida", errorCode(error));
    cleanup();
  }
  function onDisconnect() { cleanup(); }

  async function publish() {
    if (loading || closed || !controller) return;
    loading = true;
    try {
      while (dirty && !closed) {
        dirty = false;
        const snapshot = await loadSnapshot();
        send(`event: snapshot\ndata: ${JSON.stringify(snapshot)}\n\n`);
      }
    } catch (error) {
      console.error("SSE operativo: falló la consulta", errorCode(error));
      send("event: stream-error\ndata: {}\n\n");
      cleanup();
    } finally {
      loading = false;
    }
  }

  function onNotification(message: Notification) {
    if (!channels.includes(message.channel) || message.payload !== siteId) return;
    dirty = true;
    void publish();
  }

  client.on("notification", onNotification);
  client.on("error", onError);
  client.on("end", onDisconnect);
  signal.addEventListener("abort", cleanup, { once: true });

  return new ReadableStream<Uint8Array>({
    start(streamController) {
      controller = streamController;
      if (signal.aborted) {
        cleanup();
        return;
      }
      send("retry: 2000\n\n");
      dirty = true;
      void publish();
      heartbeat = setInterval(() => send(": keepalive\n\n"), 20000);
    },
    cancel: cleanup,
  });
}
