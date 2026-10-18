"use client";

import { useEffect, useState } from "react";
import type { ControlSnapshot, DispatchOrder, DispatchSnapshot } from "@/lib/dispatch";
import OperationsOrderList, { formatOrderTime } from "@/components/OperationsOrderList";

type Mode = "dispatch" | "control";
type SiteSlug = "smp" | "lm";

const states = { RECIBIDO: "Recibido", PREPARANDO: "Preparando", LISTO_RECOJO: "Listo para recojo" };
const results: Record<string, string> = {
  duplicate: "La preparación ya fue comunicada.", "not-found": "El pedido no pertenece a esta sede.",
  "invalid-state": "El pedido cambió de estado. La lista se actualizará.",
  "no-notice": "Cocina aún no ha terminado esta preparación.", "invalid-code": "El código de recojo no coincide.",
};

export default function OperationsBoard({ site, siteName, mode, testOrdersEnabled = false }: {
  site: SiteSlug; siteName: string; mode: Mode; testOrdersEnabled?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<DispatchSnapshot | ControlSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickupCode, setPickupCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const source = new EventSource(`/api/operations/${site}/stream?mode=${mode}`);
    source.addEventListener("snapshot", event => {
      try { setSnapshot(JSON.parse((event as MessageEvent).data)); setConnected(true); }
      catch { setMessage("No se pudo leer la lista actualizada."); }
    });
    source.addEventListener("stream-error", () => setConnected(false));
    source.onerror = () => setConnected(false);
    return () => source.close();
  }, [site, mode]);

  const orders = snapshot?.orders || [];
  const selected = orders.find(order => order.id === selectedId);
  const notices = mode === "dispatch" ? (orders as DispatchOrder[]).filter(order => order.preparationFinishedAt && order.state === "PREPARANDO") : [];

  async function perform(orderId: string, action: "finish" | "ready" | "deliver") {
    if (busy) return;
    if (!connected) { setMessage("Sin conexión con los pedidos. Espera a que se actualice la lista."); return; }
    setBusy(true); setMessage("");
    try {
      const tokenResponse = await fetch(`/api/operations/${site}/token?role=${mode}`, { cache: "no-store" });
      if (!tokenResponse.ok) throw new Error("No se pudo validar el acceso al dispositivo.");
      const { token } = await tokenResponse.json();
      const response = await fetch(`/api/operations/${site}/orders/${orderId}`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Requested-With": "AllInstant", "X-CSRF-Token": token },
        body: JSON.stringify({ action, ...(action === "deliver" ? { pickupCode } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) { setMessage(results[data.result] || data.error || "No se pudo completar la operación."); return; }
      setMessage(action === "finish" ? "Preparación comunicada a despacho." : action === "ready" ? "Pedido confirmado como listo para recojo." : "Entrega registrada.");
      if (action === "deliver") setPickupCode("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally { setBusy(false); }
  }

  async function generateTestOrder() {
    if (generating || busy) return;
    if (!connected) { setMessage("Sin conexión con los pedidos. Espera a que se actualice la lista."); return; }
    setGenerating(true); setMessage("");
    try {
      const tokenResponse = await fetch(`/api/operations/${site}/token?role=dispatch`, { cache: "no-store" });
      if (!tokenResponse.ok) throw new Error("No se pudo validar el acceso al dispositivo.");
      const { token } = await tokenResponse.json();
      const response = await fetch(`/api/operations/${site}/test-orders`, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Requested-With": "AllInstant", "X-CSRF-Token": token },
        body: "{}",
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "No se pudo generar el pedido de prueba."); return; }
      setMessage(`Pedido de prueba #${data.pedidoId} generado. La lista se actualizará automáticamente.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo generar el pedido de prueba.");
    } finally { setGenerating(false); }
  }

  return <main className="operations">
    <header className="operations-header">
      <div className="operations-brand"><span className="operations-brand-mark">A</span><span>AllInstant <b>×</b> ALESAR</span></div>
      <div className="operations-place"><span>{mode === "dispatch" ? "Despacho" : "Control de cocina"}</span><strong>{snapshot?.siteName || siteName}</strong></div>
    </header>
    <div className="operations-content">
      <div className="operations-title-row"><div><p className="operations-eyebrow">OPERACIÓN · {site.toUpperCase()}</p><h1>{mode === "dispatch" ? "Pedidos para despacho" : "Preparaciones en cocina"}</h1></div><div className="operations-title-actions">{mode === "dispatch" && testOrdersEnabled && <button type="button" className="operations-test-order" disabled={generating || busy || !connected} onClick={() => void generateTestOrder()}>{generating ? "Generando…" : "+ Generar pedido de prueba"}</button>}<span className={connected ? "operations-live" : "operations-offline"}>{connected ? "En vivo" : "Reconectando…"}</span></div></div>
      {!snapshot && <p className="operations-status" role="status">Cargando pedidos de la sede…</p>}
      {!connected && snapshot && <p className="operations-status" role="status">Conexión interrumpida. Las acciones se habilitarán al recuperar la lista actual.</p>}
      {message && <p className="operations-status" role="status">{message}</p>}

      {mode === "dispatch" && snapshot && <section className="operations-notices" aria-labelledby="notices-title">
        <div className="operations-section-heading"><h2 id="notices-title">Preparaciones terminadas</h2><span>{notices.length}</span></div>
        {notices.length ? <div className="operations-notice-list">{notices.map(order => <button key={order.id} type="button" onClick={() => setSelectedId(order.id)}>
          <strong>Pedido #{order.id}</strong><span>{order.customer}</span><span>Terminó {formatOrderTime(order.preparationFinishedAt!)}</span><b>Revisar →</b>
        </button>)}</div> : <p className="operations-quiet">Las preparaciones que cocina termine aparecerán aquí.</p>}
      </section>}

      {snapshot && <div className="operations-workspace">
        <section aria-labelledby="orders-title" className="operations-list-section">
          <div className="operations-section-heading"><h2 id="orders-title">{mode === "dispatch" ? "Pedidos activos" : "En preparación"}</h2><span>{orders.length}</span></div>
          <OperationsOrderList orders={orders} mode={mode} selectedId={selectedId} onSelect={id => { setSelectedId(id); setPickupCode(""); setMessage(""); }} />
        </section>

        <section className="operations-detail" aria-labelledby="detail-title">
          {selected ? <><p className="operations-eyebrow">DETALLE DEL PEDIDO</p><h2 id="detail-title">Pedido #{selected.id}</h2>
            {mode === "dispatch" && <dl className="operations-facts"><div><dt>Cliente</dt><dd>{(selected as DispatchOrder).customer}</dd></div><div><dt>Confirmado</dt><dd>{formatOrderTime((selected as DispatchOrder).confirmedAt)}</dd></div><div><dt>Estado</dt><dd>{states[(selected as DispatchOrder).state]}</dd></div><div><dt>Código de recojo</dt><dd className="operations-code">{(selected as DispatchOrder).pickupCode}</dd></div></dl>}
            <h3>Productos</h3><ul className="operations-products">{selected.products.map((product, index) => <li key={index}><span>{product.name}</span><strong>× {product.quantity}</strong></li>)}</ul>
            {mode === "control" ? <button className="operations-primary" disabled={busy || !connected || !!selected.preparationFinishedAt} onClick={() => perform(selected.id, "finish")}>{selected.preparationFinishedAt ? "Preparación ya comunicada" : busy ? "Guardando…" : "Preparación terminada"}</button> : (selected as DispatchOrder).state === "PREPARANDO" ? <button className="operations-primary" disabled={busy || !connected || !selected.preparationFinishedAt} onClick={() => perform(selected.id, "ready")}>{busy ? "Confirmando…" : "Confirmar listo"}</button> : (selected as DispatchOrder).state === "LISTO_RECOJO" ? <form onSubmit={event => { event.preventDefault(); void perform(selected.id, "deliver"); }}><label htmlFor="pickup-code">Código proporcionado por el cliente</label><input id="pickup-code" value={pickupCode} onChange={event => setPickupCode(event.target.value)} autoComplete="off" required maxLength={20} /><button className="operations-primary" disabled={busy || !connected || !pickupCode}>{busy ? "Registrando…" : "Confirmar entrega"}</button></form> : <p className="operations-quiet">Esperando preparación de cocina.</p>}
            {mode === "dispatch" && (selected as DispatchOrder).state === "PREPARANDO" && !selected.preparationFinishedAt && <p className="operations-quiet">Cocina aún no ha comunicado el fin de preparación.</p>}
          </> : <div className="operations-detail-empty"><h2 id="detail-title">Selecciona un pedido</h2><p>Revisa los datos antes de confirmar una operación.</p></div>}
        </section>
      </div>}
    </div>
  </main>;
}
