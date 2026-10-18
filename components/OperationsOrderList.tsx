import type { ControlSnapshot, DispatchOrder, DispatchSnapshot } from "@/lib/dispatch";

type Order = DispatchSnapshot["orders"][number] | ControlSnapshot["orders"][number];
const states = { RECIBIDO: "Recibido", PREPARANDO: "Preparando", LISTO_RECOJO: "Listo para recojo" };

export function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function OperationsOrderList({ orders, mode, selectedId, onSelect }: {
  orders: Order[]; mode: "dispatch" | "control"; selectedId: string | null; onSelect: (id: string) => void;
}) {
  if (!orders.length) return <div className="operations-empty"><strong>No hay pedidos pendientes</strong><p>La lista se actualizará cuando llegue un pedido de esta sede.</p></div>;
  return <div className="operations-list">{orders.map(order => <button type="button" key={order.id} className={selectedId === order.id ? "operations-order selected" : "operations-order"} onClick={() => onSelect(order.id)}>
    <span className="operations-order-id">#{order.id}</span>
    <span className="operations-order-main"><strong>{mode === "dispatch" ? (order as DispatchOrder).customer : `Pedido ${order.id}`}</strong><small>{mode === "dispatch" ? `Confirmado ${formatOrderTime((order as DispatchOrder).confirmedAt)}` : `${order.products.reduce((sum, product) => sum + product.quantity, 0)} unidades`}</small></span>
    <span className="operations-order-end">{mode === "dispatch" ? <><em>{states[(order as DispatchOrder).state]}</em><small>Código {(order as DispatchOrder).pickupCode}</small></> : <em>{order.preparationFinishedAt ? "Comunicado" : "Pendiente"}</em>}</span>
  </button>)}</div>;
}
