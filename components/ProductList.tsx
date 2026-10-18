import type { ProductLine } from "@/lib/kitchen";

export default function ProductList({ lines }: { lines: ProductLine[] }) {
  if (lines.length === 0) {
    return <div className="empty-state"><span aria-hidden="true">✓</span><p>No hay pedidos pendientes</p></div>;
  }

  return <div className="product-list" aria-label="Productos pendientes en orden de llegada">
    <div className="list-heading" aria-hidden="true"><span>ID PRODUCTO</span><span>PRODUCTO</span><span>CANTIDAD</span></div>
    <ul>{lines.map(line => <li key={line.lineId}>
      <span className="product-id">{line.productId}</span>
      <span className="product-name">{line.name}</span>
      <span className="product-quantity">{line.quantity}</span>
    </li>)}</ul>
  </div>;
}
