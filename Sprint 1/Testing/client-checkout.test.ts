import { describe, expect, it, vi } from "vitest";
import { CatalogChangedError, parseCartItems } from "../../lib/client-catalog";
import { CustomerInputError, PaymentRejectedError, createOrderFromPayment, parseCustomer, simulatePayment, storeQuote } from "../../lib/client-checkout";

const validQuote = () => storeQuote({
  site: "SMP", items: [{ productId: "1", name: "Almuerzo", quantity: 2, unitPrice: "18.00", lineTotal: "36.00" }], total: "36.00",
});

describe("checkout cliente", () => {
  it("rechaza productos duplicados y cantidades manipuladas", () => {
    expect(() => parseCartItems([{ productId: "1", quantity: 1 }, { productId: "1", quantity: 2 }])).toThrow();
    expect(() => parseCartItems([{ productId: "1", quantity: 1.5 }])).toThrow();
  });

  it("normaliza datos válidos y rechaza DNI, nombre o WhatsApp inválidos", () => {
    expect(parseCustomer({ dni: "12345678", name: "  Ana   Ruiz ", whatsapp: "+51 987-654-321" })).toEqual({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" });
    expect(() => parseCustomer({ dni: "12", name: "A", whatsapp: "888" })).toThrow(CustomerInputError);
  });

  it("no permite crear pedido con pago rechazado", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "YAPE", "rejected");
    await expect(createOrderFromPayment({ connect: vi.fn() } as never, payment.paymentId, parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" }))).rejects.toThrow(PaymentRejectedError);
  });

  it("crea un pedido PREPARANDO una sola vez con precios recalculados", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "CARD", "approved");
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ sede_id: "1", codigo: "SMP", nombre: "San Martín" }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ producto_id: "1", nombre: "Almuerzo", precio_vigente: "18", disponible: true }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ estado_id: 2 }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ pedido_id: "12", codigo_recojo: "AI-ABC", confirmado_en: "2026-10-18T10:00:00.000Z" }] })
        .mockResolvedValueOnce({}) // detail
        .mockResolvedValueOnce({}), // COMMIT
      release: vi.fn(),
    };
    const db = { connect: vi.fn().mockResolvedValue(client) };
    const customer = parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" });
    const first = await createOrderFromPayment(db as never, payment.paymentId, customer);
    expect(first).toMatchObject({ orderId: "12", state: "PREPARANDO" });
    await expect(createOrderFromPayment(db as never, payment.paymentId, customer)).resolves.toEqual(first);
    expect(client.query.mock.calls[4][0]).toContain("INSERT INTO pedidos");
    expect(client.query.mock.calls[5][0]).toContain("INSERT INTO detalle_pedido");
  });

  it("libera el pago si el catálogo cambia antes del commit", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "CARD", "approved");
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ sede_id: "1", codigo: "SMP", nombre: "San Martín" }] })
        .mockRejectedValueOnce(new CatalogChangedError("agotado"))
        .mockResolvedValueOnce({}),
      release: vi.fn(),
    };
    await expect(createOrderFromPayment({ connect: vi.fn().mockResolvedValue(client) } as never, payment.paymentId, parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" }))).rejects.toThrow(CatalogChangedError);
    // A failed transaction does not consume a payment; it remains available for a new quote validation.
    expect(() => simulatePayment(quote.id, "CARD", "approved")).not.toThrow();
  });
});
