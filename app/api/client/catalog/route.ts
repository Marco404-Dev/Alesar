import { NextRequest } from "next/server";
import { database } from "@/lib/db";
import { clientError, clientJson } from "@/lib/client-api";
import { CatalogNotReadyError, SiteNotFoundError, findClientSite, listCatalog, parseSiteCode } from "@/lib/client-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = parseSiteCode(request.nextUrl.searchParams.get("site"));
  if (!code) return clientError(request, 400, "INVALID_SITE", "La sede no es válida");
  try {
    const db = database();
    const site = await findClientSite(db, code);
    const items = await listCatalog(db, site);
    return clientJson(request, { site: site.code, items });
  } catch (error) {
    if (error instanceof SiteNotFoundError) return clientError(request, 404, "SITE_NOT_FOUND", error.message);
    if (error instanceof CatalogNotReadyError) return clientError(request, 503, "CATALOG_NOT_READY", error.message);
    console.error("No se pudo consultar catálogo", error instanceof Error ? error.name : "SIN_DETALLE");
    return clientError(request, 503, "SERVICE_UNAVAILABLE", "El servicio de catálogo no está disponible");
  }
}
