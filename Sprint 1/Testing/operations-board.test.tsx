import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import OperationsBoard from "../../components/OperationsBoard";

describe("generador en despacho", () => {
  it("solo muestra el botón cuando el servidor habilita el generador en despacho", () => {
    const enabled = renderToStaticMarkup(<OperationsBoard site="smp" siteName="San Martín de Porres" mode="dispatch" testOrdersEnabled />);
    expect(enabled).toContain("+ Generar pedido de prueba");
    const control = renderToStaticMarkup(<OperationsBoard site="smp" siteName="San Martín de Porres" mode="control" testOrdersEnabled />);
    expect(control).not.toContain("Generar pedido de prueba");
  });
});
