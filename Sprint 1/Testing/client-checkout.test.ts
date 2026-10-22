import { describe, expect, it, vi } from "vitest";
import { CatalogChangedError, parseCartItems } from "../../lib/client-catalog";
import { CustomerInputError, PICKUP_CODE_ALPHABET, PaymentRejectedError, PaymentUsedError, createOrderFromPayment, parseCustomer, pickupCode, simulatePayment, storeQuote } from "../../lib/client-checkout";

const validQuote = () => storeQuote({
  site: "SMP", items: [{ productId: "1", name: "Almuerzo", quantity: 2, unitPrice: "18.00", lineTotal: "36.00" }], total: "36.00",
});

describe("checkout cliente", () => {
  it("genera códigos de recojo nuevos de tres caracteres sin ambiguos", () => {
    const code = pickupCode();
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{3}$/);
    expect([...code].every(character => PICKUP_CODE_ALPHABET.includes(character))).toBe(true);
  });
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
        .mockResolvedValueOnce({}) // SAVEPOINT
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ pedido_id: "12", codigo_recojo: "AI-ABC", confirmado_en: "2026-10-18T10:00:00.000Z" }] })
        .mockResolvedValueOnce({}) // RELEASE SAVEPOINT
        .mockResolvedValueOnce({}) // detail
        .mockResolvedValueOnce({}), // COMMIT
      release: vi.fn(),
    };
    const db = { connect: vi.fn().mockResolvedValue(client) };
    const customer = parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" });
    const first = await createOrderFromPayment(db as never, payment.paymentId, customer);
    expect(first).toMatchObject({ orderId: "12", state: "PREPARANDO" });
    await expect(createOrderFromPayment(db as never, payment.paymentId, customer)).resolves.toEqual(first);
    // El rol cliente solo lee estos catálogos de referencia; no requiere
    // privilegios UPDATE implícitos por un locking clause.
    expect(client.query.mock.calls[1][0]).not.toContain("FOR KEY SHARE");
    expect(client.query.mock.calls[3][0]).not.toContain("FOR KEY SHARE");
    expect(client.query.mock.calls[5][0]).toContain("INSERT INTO pedidos");
    expect(client.query.mock.calls[7][0]).toContain("INSERT INTO detalle_pedido");
  });

  it("recupera el savepoint tras 23505 y reintenta sin caer en 25P02", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "CARD", "approved");
    let transactionAborted = false;
    let insertAttempts = 0;
    const uniqueViolation = Object.assign(new Error("código ocupado"), { code: "23505", constraint: "pedidos_codigo_recojo_activo_sede_uq" });
    const client = {
      query: vi.fn(async (statement: string) => {
        if (statement === "BEGIN" || statement === "COMMIT" || statement.startsWith("SAVEPOINT") || statement.startsWith("RELEASE SAVEPOINT") || statement.includes("INSERT INTO detalle_pedido")) {
          if (transactionAborted) throw Object.assign(new Error("transacción abortada"), { code: "25P02" });
          return {};
        }
        if (statement.startsWith("ROLLBACK TO SAVEPOINT")) {
          transactionAborted = false;
          return {};
        }
        if (statement.includes("FROM sedes")) return { rowCount: 1, rows: [{ sede_id: "1", codigo: "SMP", nombre: "San Martín" }] };
        if (statement.includes("FROM disponibilidad_producto_sede")) return { rowCount: 1, rows: [{ producto_id: "1", nombre: "Almuerzo", precio_vigente: "18", disponible: true }] };
        if (statement.includes("FROM estados_pedido")) return { rowCount: 1, rows: [{ estado_id: 2 }] };
        if (statement.includes("INSERT INTO pedidos")) {
          insertAttempts++;
          if (insertAttempts === 1) {
            transactionAborted = true;
            throw uniqueViolation;
          }
          if (transactionAborted) throw Object.assign(new Error("transacción abortada"), { code: "25P02" });
          return { rowCount: 1, rows: [{ pedido_id: "13", codigo_recojo: "ZXY", confirmado_en: "2026-10-21T10:00:00.000Z" }] };
        }
        throw new Error(`Consulta no esperada: ${statement}`);
      }),
      release: vi.fn(),
    };

    const created = await createOrderFromPayment({ connect: vi.fn().mockResolvedValue(client) } as never, payment.paymentId, parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" }));

    expect(created).toMatchObject({ orderId: "13", pickupCode: "ZXY" });
    expect(insertAttempts).toBe(2);
    expect(client.query.mock.calls.map(([statement]) => statement)).toContain("ROLLBACK TO SAVEPOINT pickup_code_attempt");
    expect(client.query.mock.calls.map(([statement]) => statement)).not.toContain("ROLLBACK");
  });

  it("libera el pago si no se puede adquirir conexión y permite reintentar sin duplicar pedidos", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "CARD", "approved");
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ sede_id: "1", codigo: "SMP", nombre: "San Martín" }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ producto_id: "1", nombre: "Almuerzo", precio_vigente: "18", disponible: true }] })
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ estado_id: 2 }] })
        .mockResolvedValueOnce({}) // SAVEPOINT
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ pedido_id: "14", codigo_recojo: "ABC", confirmado_en: "2026-10-21T10:00:00.000Z" }] })
        .mockResolvedValueOnce({}) // RELEASE SAVEPOINT
        .mockResolvedValueOnce({}) // detail
        .mockResolvedValueOnce({}), // COMMIT
      release: vi.fn(),
    };
    const db = { connect: vi.fn().mockRejectedValueOnce(new Error("conexión no disponible")).mockResolvedValueOnce(client) };
    const customer = parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" });

    await expect(createOrderFromPayment(db as never, payment.paymentId, customer)).rejects.toThrow("conexión no disponible");
    await expect(createOrderFromPayment(db as never, payment.paymentId, customer)).resolves.toMatchObject({ orderId: "14" });
    expect(db.connect).toHaveBeenCalledTimes(2);
    expect(client.query.mock.calls.filter(([statement]) => statement.includes("INSERT INTO pedidos"))).toHaveLength(1);
  });

  it("mantiene un único procesamiento mientras espera adquirir conexión", async () => {
    const quote = validQuote();
    const payment = simulatePayment(quote.id, "CARD", "approved");
    const customer = parseCustomer({ dni: "12345678", name: "Ana Ruiz", whatsapp: "987654321" });
    let rejectConnection!: (reason: Error) => void;
    const db = { connect: vi.fn(() => new Promise<never>((_resolve, reject) => { rejectConnection = reject; })) };

    const first = createOrderFromPayment(db as never, payment.paymentId, customer);
    await expect(createOrderFromPayment(db as never, payment.paymentId, customer)).rejects.toThrow(PaymentUsedError);
    rejectConnection(new Error("conexión no disponible"));
    await expect(first).rejects.toThrow("conexión no disponible");
    expect(db.connect).toHaveBeenCalledTimes(1);
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
