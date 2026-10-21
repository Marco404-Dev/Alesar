import { randomUUID, randomInt } from "node:crypto";
import type { Pool } from "pg";
import { CatalogChangedError, type ClientSite, type Quote, quoteCart } from "@/lib/client-catalog";

const QUOTE_TTL_MS = 10 * 60 * 1000;
const PAYMENT_TTL_MS = 10 * 60 * 1000;
type PaymentMethod = "YAPE" | "CARD";
type PaymentOutcome = "approved" | "rejected";
type Payment = {
  id: string; quoteId: string; status: PaymentOutcome; expiresAt: number; consumed: boolean;
  order?: CreatedOrder;
};
export type Customer = { dni: string; name: string; whatsapp: string };
export type CreatedOrder = { orderId: string; pickupCode: string; state: "PREPARANDO"; confirmedAt: string };

export class QuoteNotFoundError extends Error {}
export class PaymentNotFoundError extends Error {}
export class PaymentRejectedError extends Error {}
export class PaymentUsedError extends Error {}
export class CustomerInputError extends Error {}
export class PickupCodeUnavailableError extends Error {}

export const PICKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const PICKUP_CODE_LENGTH = 3;
const PICKUP_CODE_UNIQUE_INDEX = "pedidos_codigo_recojo_activo_sede_uq";

const state = globalThis as typeof globalThis & {
  __allinstantClientQuotes?: Map<string, Quote>;
  __allinstantClientPayments?: Map<string, Payment>;
};
const quotes = state.__allinstantClientQuotes ||= new Map<string, Quote>();
const payments = state.__allinstantClientPayments ||= new Map<string, Payment>();

function purge(): void {
  const now = Date.now();
  for (const [id, quote] of quotes) if (quote.expiresAt <= now) quotes.delete(id);
  for (const [id, payment] of payments) if (payment.expiresAt <= now && !payment.consumed) payments.delete(id);
}

export function storeQuote(quote: Omit<Quote, "id" | "expiresAt">): Quote {
  purge();
  const stored = { ...quote, id: randomUUID(), expiresAt: Date.now() + QUOTE_TTL_MS };
  quotes.set(stored.id, stored);
  return stored;
}

export function simulatePayment(quoteId: unknown, method: unknown, outcome: unknown): { paymentId: string; status: PaymentOutcome } {
  purge();
  if (typeof quoteId !== "string" || !quotes.has(quoteId) || quotes.get(quoteId)!.expiresAt <= Date.now()) throw new QuoteNotFoundError("La cotización venció o no existe");
  if (method !== "YAPE" && method !== "CARD") throw new CustomerInputError("Método de pago no válido");
  if (outcome !== "approved" && outcome !== "rejected") throw new CustomerInputError("Resultado de pago no válido");
  const existing = [...payments.values()].find(payment => payment.quoteId === quoteId && payment.status === outcome && !payment.consumed);
  if (existing) return { paymentId: existing.id, status: existing.status };
  const payment: Payment = { id: randomUUID(), quoteId, status: outcome, expiresAt: Date.now() + PAYMENT_TTL_MS, consumed: false };
  payments.set(payment.id, payment);
  return { paymentId: payment.id, status: payment.status };
}

export function parseCustomer(value: unknown): Customer {
  if (!value || typeof value !== "object") throw new CustomerInputError("Datos de cliente no válidos");
  const { dni, name, whatsapp } = value as { dni?: unknown; name?: unknown; whatsapp?: unknown };
  const normalizedName = typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
  const normalizedWhatsapp = typeof whatsapp === "string" ? whatsapp.trim().replace(/[\s-]/g, "").replace(/^\+51/, "") : "";
  if (typeof dni !== "string" || !/^\d{8}$/.test(dni) || normalizedName.length < 2 || normalizedName.length > 100 || !/^9\d{8}$/.test(normalizedWhatsapp)) {
    throw new CustomerInputError("DNI, nombre o WhatsApp no válidos");
  }
  return { dni, name: normalizedName, whatsapp: normalizedWhatsapp };
}

export function pickupCode(): string {
  return Array.from({ length: PICKUP_CODE_LENGTH }, () => PICKUP_CODE_ALPHABET[randomInt(PICKUP_CODE_ALPHABET.length)]).join("");
}

function isPickupCodeCollision(error: unknown): boolean {
  return !!error && typeof error === "object" && "code" in error && error.code === "23505" &&
    "constraint" in error && error.constraint === PICKUP_CODE_UNIQUE_INDEX;
}

export async function createOrderFromPayment(db: Pool, paymentId: unknown, customer: Customer): Promise<CreatedOrder> {
  purge();
  if (typeof paymentId !== "string") throw new PaymentNotFoundError("Pago no encontrado");
  const payment = payments.get(paymentId);
  if (!payment || payment.expiresAt <= Date.now()) throw new PaymentNotFoundError("Pago vencido o no encontrado");
  if (payment.status === "rejected") throw new PaymentRejectedError("El pago fue rechazado");
  // Un reintento de la misma confirmación devuelve el resultado original en
  // vez de generar una segunda orden. El token sigue siendo de un solo uso.
  if (payment.order) return payment.order;
  if (payment.consumed) throw new PaymentUsedError("El pago ya está siendo procesado");
  const quote = quotes.get(payment.quoteId);
  if (!quote || quote.expiresAt <= Date.now()) throw new PaymentNotFoundError("La cotización venció");
  // Claim the one-time payment before opening the transaction; restore it if PostgreSQL rejects the operation.
  payment.consumed = true;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const siteResult = await client.query<{ sede_id: string; codigo: "SMP" | "LM"; nombre: string }>(
      "SELECT sede_id, codigo, nombre FROM sedes WHERE codigo = $1", [quote.site]
    );
    if (siteResult.rowCount !== 1) throw new CatalogChangedError("La sede ya no está disponible");
    const site: ClientSite = { id: String(siteResult.rows[0].sede_id), code: siteResult.rows[0].codigo, name: siteResult.rows[0].nombre };
    // Recalculate under the same transaction: browser and prior quote prices are never trusted.
    const recalculated = await quoteCart(client, site, quote.items.map(item => ({ productId: item.productId, quantity: item.quantity })));
    const stateResult = await client.query<{ estado_id: number }>("SELECT estado_id FROM estados_pedido WHERE codigo = 'PREPARANDO'");
    if (stateResult.rowCount !== 1) throw new CatalogChangedError("El estado inicial no está configurado");
    let inserted: { pedido_id: string; codigo_recojo: string; confirmado_en: Date | string } | undefined;
    for (let attempt = 0; attempt < 16 && !inserted; attempt++) {
      try {
        const result = await client.query<{ pedido_id: string; codigo_recojo: string; confirmado_en: Date | string }>(
          `INSERT INTO pedidos (codigo_recojo, sede_id, dni_cliente, nombre_cliente, whatsapp_cliente, estado_id, pago_confirmado)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE)
           RETURNING pedido_id, codigo_recojo, confirmado_en`,
          [pickupCode(), site.id, customer.dni, customer.name, customer.whatsapp, stateResult.rows[0].estado_id]
        );
        inserted = result.rows[0];
      } catch (error) {
        if (!isPickupCodeCollision(error)) throw error;
      }
    }
    if (!inserted) throw new PickupCodeUnavailableError("No se pudo reservar un código de recojo. Inténtalo nuevamente.");
    for (const item of recalculated.items) {
      await client.query(
        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)",
        [inserted.pedido_id, item.productId, item.quantity, item.unitPrice]
      );
    }
    await client.query("COMMIT");
    payment.order = {
      orderId: String(inserted.pedido_id), pickupCode: inserted.codigo_recojo,
      state: "PREPARANDO", confirmedAt: new Date(inserted.confirmado_en).toISOString(),
    };
    return payment.order;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    payment.consumed = false;
    throw error;
  } finally {
    client.release();
  }
}
