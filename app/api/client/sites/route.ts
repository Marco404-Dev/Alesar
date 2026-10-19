import { NextRequest } from "next/server";
import { database } from "@/lib/db";
import { clientError, clientJson } from "@/lib/client-api";
import { listSites } from "@/lib/client-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sites = await listSites(database());
    return clientJson(request, { sites: sites.map(({ code, name }) => ({ code, name })) });
  } catch (error) {
    console.error("No se pudo consultar sedes de cliente", error instanceof Error ? error.name : "SIN_DETALLE");
    return clientError(request, 503, "SERVICE_UNAVAILABLE", "El servicio de catálogo no está disponible");
  }
}
