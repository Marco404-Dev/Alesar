import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import OperationsOrderList from "../../components/OperationsOrderList";

describe("lista táctil de pedidos", () => {
  it("muestra identificación, cliente, hora, estado y código de despacho", () => {
    const html = renderToStaticMarkup(<OperationsOrderList mode="dispatch" selectedId={null} onSelect={() => {}} orders={[{
      id: "8", customer: "Ana Gómez", confirmedAt: "2026-10-18T12:00:00Z", state: "PREPARANDO",
      pickupCode: "ABC123", preparationFinishedAt: null, products: [{ name: "Menú", quantity: 2 }],
    }]} />);
    expect(html).toContain("#8");
    expect(html).toContain("Ana Gómez");
    expect(html).toContain("Confirmado 07:00");
    expect(html).toContain("Preparando");
    expect(html).toContain("ABC123");
  });

  it("muestra productos sin datos personales en control y estado vacío", () => {
    const html = renderToStaticMarkup(<OperationsOrderList mode="control" selectedId={null} onSelect={() => {}} orders={[{ id: "8", preparationFinishedAt: null, products: [{ name: "Menú", quantity: 2 }] }]} />);
    expect(html).toContain("Pedido 8");
    expect(html).toContain("2 unidades");
    expect(html).not.toContain("Código");
    expect(renderToStaticMarkup(<OperationsOrderList mode="dispatch" selectedId={null} onSelect={() => {}} orders={[]} />)).toContain("No hay pedidos pendientes");
  });
});
