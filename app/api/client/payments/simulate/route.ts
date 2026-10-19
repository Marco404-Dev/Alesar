import { NextRequest } from "next/server";
import { clientCors, clientError, clientJson, clientWriteAllowed } from "@/lib/client-api";
import { CustomerInputError, QuoteNotFoundError, simulatePayment } from "@/lib/client-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) { return new Response(null, { status: 204, headers: { ...clientCors(request), "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Requested-With" } }); }

export async function POST(request: NextRequest) {
  if (!clientWriteAllowed(request)) return clientError(request, 403, "REQUEST_NOT_ALLOWED", "Solicitud no autorizada");
  let body: { quoteId?: unknown; method?: unknown; outcome?: unknown };
  try { body = await request.json(); } catch { return clientError(request, 400, "INVALID_REQUEST", "La solicitud no contiene JSON válido"); }
  try {
    return clientJson(request, simulatePayment(body.quoteId, body.method, body.outcome));
  } catch (error) {
    if (error instanceof QuoteNotFoundError) return clientError(request, 409, "QUOTE_EXPIRED", error.message);
    if (error instanceof CustomerInputError) return clientError(request, 422, "INVALID_PAYMENT", error.message);
    return clientError(request, 503, "SERVICE_UNAVAILABLE", "No se pudo procesar el pago simulado");
  }
}
