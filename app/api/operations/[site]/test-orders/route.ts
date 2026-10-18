import { NextRequest, NextResponse } from "next/server";
import { database, testOrdersDatabase } from "@/lib/db";
import { findKitchenSite, siteCodeFromSlug } from "@/lib/kitchen";
import { operationsAccess, validCsrf } from "@/lib/operations-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ENABLE_TEST_ORDERS === "true";
}

export async function POST(request: NextRequest, context: { params: Promise<{ site: string }> }) {
  const slug = (await context.params).site;
  const code = siteCodeFromSlug(slug);
  if (!code || !isEnabled()) return NextResponse.json({ error: "Recurso no disponible" }, { status: 404 });
  const site = slug as "smp" | "lm";
  if (!operationsAccess(request, site, "dispatch", true) || !validCsrf(request, `${slug}-dispatch`))
    return NextResponse.json({ error: "Solicitud no autorizada" }, { status: 403 });
  try {
    const kitchenSite = await findKitchenSite(database(), code);
    const testDb = testOrdersDatabase();
    const environment = await testDb.query<{ is_development: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno = 'development') AS is_development",
    );
    if (environment.rowCount !== 1 || environment.rows[0]?.is_development !== true)
      return NextResponse.json({ error: "Generador no disponible para esta base de datos" }, { status: 403 });
    const generated = await testDb.query<{ pedido_id: string | number }>(
      "SELECT public.fn_t114_generar_pedido_prueba($1::bigint) AS pedido_id", [kitchenSite.id],
    );
    const pedidoId = String(generated.rows[0]?.pedido_id || "");
    if (generated.rowCount !== 1 || !/^[1-9][0-9]{0,18}$/.test(pedidoId)) throw new Error("Resultado inválido del generador");
    return NextResponse.json({ pedidoId }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const dbCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error("No se pudo generar pedido de prueba", typeof dbCode === "string" ? dbCode : "SIN_CODIGO");
    return NextResponse.json({ error: "Generador no disponible" }, { status: 503 });
  }
}
