import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductList from "../../components/ProductList";
import SanMartinDePorresKitchen from "../../app/cocina/smp/page";
import LaMolinaKitchen from "../../app/cocina/lm/page";

describe("monitor no táctil", () => {
  it("dispone de rutas directas para ambas sedes", () => {
    expect(SanMartinDePorresKitchen().props.site).toBe("smp");
    expect(LaMolinaKitchen().props.site).toBe("lm");
  });

  it("muestra solo ID, nombre y cantidad en una lista única, sin fusionar pedidos", () => {
    const html = renderToStaticMarkup(<ProductList lines={[
      { lineId: "10", orderId: "7", productId: "5", name: "Menú", quantity: 2 },
      { lineId: "14", orderId: "9", productId: "5", name: "Menú", quantity: 1 },
    ]} />);
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(html).toContain("Menú");
    expect(html).toContain(">2</span>");
    expect(html).toContain(">1</span>");
    expect(html).not.toMatch(/pedido|recibido|preparando|<button|<form|<input/i);
    expect(html).not.toContain("orderId");
  });

  it("muestra el mensaje requerido cuando no hay productos", () => {
    expect(renderToStaticMarkup(<ProductList lines={[]} />)).toContain("No hay pedidos pendientes");
  });
});
