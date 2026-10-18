"use client";

import { useEffect, useState } from "react";
import type { KitchenSnapshot } from "@/lib/kitchen";
import { observeKitchenStream } from "@/lib/kitchen-event-client";
import ProductList from "@/components/ProductList";

export default function KitchenMonitor({ site, siteName }: { site: "smp" | "lm"; siteName: string }) {
  const [snapshot, setSnapshot] = useState<KitchenSnapshot | null>(null);
  const [connection, setConnection] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    const source = new EventSource(`/api/kitchen/${site}/stream`);
    return observeKitchenStream(source, setSnapshot, online => setConnection(online ? "connected" : "disconnected"));
  }, [site]);

  return <main className="monitor">
    <header className="monitor-header">
      <div className="brand"><span className="brand-mark" aria-hidden="true">A</span><span>AllInstant <b>×</b> ALESAR</span></div>
      <div className="location"><span>Cocina</span><strong>{snapshot?.siteName || siteName}</strong></div>
    </header>

    <section className="monitor-content" aria-labelledby="monitor-title">
      <div className="monitor-heading"><h1 id="monitor-title">Productos en cocina</h1><span className="heading-accent" aria-hidden="true" /></div>

      {connection !== "connected" && <p className="connection-message" role="status">
        {connection === "connecting" ? "Conectando con la lista de productos…" : "Conexión interrumpida. Recuperando la lista…"}
      </p>}

      {snapshot && <ProductList lines={snapshot.lines} />}
    </section>
  </main>;
}
