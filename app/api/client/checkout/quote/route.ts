import { NextRequest } from "next/server";
import { database } from "@/lib/db";
import { clientCors, clientError, clientJson, clientWriteAllowed } from "@/lib/client-api";
import { CatalogChangedError, CatalogNotReadyError, ClientInputError, SiteNotFoundError, findClientSite, parseCartItems, parseSiteCode, quoteCart } from "@/lib/client-catalog";
import { storeQuote } from "@/lib/client-checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) { return new Response(null, { status: 204, headers: { ...clientCors(request), "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, X-Requested-With" } }); }

export async function POST(request: NextRequest) {
  if (!clientWriteAllowed(request)) return clientError(request, 403, "REQUEST_NOT_ALLOWED", "Solicitud no autorizada");
  let body: { site?: unknown; items?: unknown };
  try { body = await request.json(); } catch { return clientError(request, 400, "INVALID_REQUEST", "La solicitud no contiene JSON válido"); }
  const code = parseSiteCode(body?.site);
  if (!code) return clientError(request, 400, "INVALID_SITE", "La sede no es válida");
  try {
    const cart = parseCartItems(body.items);
    const db = database();
    const quote = storeQuote(await quoteCart(db, await findClientSite(db, code), cart));
    return clientJson(request, { quoteId: quote.id, site: quote.site, items: quote.items, total: quote.total }, 201);
  } catch (error) {
    if (error instanceof ClientInputError) return clientError(request, 422, "INVALID_ITEMS", error.message);
    if (error instanceof SiteNotFoundError) return clientError(request, 404, "SITE_NOT_FOUND", error.message);
    if (error instanceof CatalogChangedError) return clientError(request, 409, "CATALOG_CHANGED", error.message);
    if (error instanceof CatalogNotReadyError) return clientError(request, 503, "CATALOG_NOT_READY", error.message);
    console.error("No se pudo cotizar pedido", error instanceof Error ? error.name : "SIN_DETALLE");
    return clientError(request, 503, "SERVICE_UNAVAILABLE", "No se pudo cotizar el pedido");
  }
}
