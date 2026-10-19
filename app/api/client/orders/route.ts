import { NextRequest } from "next/server";
import { database } from "@/lib/db";
import { clientCors, clientError, clientJson, clientWriteAllowed } from "@/lib/client-api";
import { CatalogChangedError, CatalogNotReadyError } from "@/lib/client-catalog";
import { CustomerInputError, PaymentNotFoundError, PaymentRejectedError, PaymentUsedError, createOrderFromPayment, parseCustomer } from "@/lib/client-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) { return new Response(null, { status: 204, headers: { ...clientCors(request), "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Requested-With" } }); }

export async function POST(request: NextRequest) {
  if (!clientWriteAllowed(request)) return clientError(request, 403, "REQUEST_NOT_ALLOWED", "Solicitud no autorizada");
  let body: { paymentId?: unknown; customer?: unknown };
  try { body = await request.json(); } catch { return clientError(request, 400, "INVALID_REQUEST", "La solicitud no contiene JSON válido"); }
  try {
    const order = await createOrderFromPayment(database(), body.paymentId, parseCustomer(body.customer));
    return clientJson(request, order, 201);
  } catch (error) {
    if (error instanceof CustomerInputError) return clientError(request, 422, "INVALID_CUSTOMER", error.message);
    if (error instanceof PaymentRejectedError) return clientError(request, 409, "PAYMENT_REJECTED", error.message);
    if (error instanceof PaymentUsedError) return clientError(request, 409, "PAYMENT_USED", error.message);
    if (error instanceof PaymentNotFoundError) return clientError(request, 409, "PAYMENT_EXPIRED", error.message);
    if (error instanceof CatalogChangedError) return clientError(request, 409, "CATALOG_CHANGED", error.message);
    if (error instanceof CatalogNotReadyError) return clientError(request, 503, "CATALOG_NOT_READY", error.message);
    console.error("No se pudo crear pedido de cliente", error instanceof Error ? error.name : "SIN_DETALLE");
    return clientError(request, 503, "SERVICE_UNAVAILABLE", "No se pudo registrar el pedido");
  }
}
