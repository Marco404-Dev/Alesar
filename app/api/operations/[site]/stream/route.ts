import { NextRequest, NextResponse } from "next/server";
import { database, notificationClient } from "@/lib/db";
import { findOperationsSite, siteCodeFromSlug } from "@/lib/operations-site";
import { listControlOrders, listDispatchOrders } from "@/lib/dispatch";
import { createOperationsStream } from "@/lib/operations-stream";
import { operationsAccess } from "@/lib/operations-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ site: string }> }) {
  const code = siteCodeFromSlug((await context.params).site);
  if (!code) return NextResponse.json({ error: "Sede no válida" }, { status: 404 });
  const mode = request.nextUrl.searchParams.get("mode");
  if (mode !== "dispatch" && mode !== "control") return NextResponse.json({ error: "Vista no válida" }, { status: 400 });
  if (!operationsAccess(request, code.toLowerCase() as "smp" | "lm", mode)) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  try {
    const pool = database();
    const site = await findOperationsSite(pool, code);
    const stream = await createOperationsStream(notificationClient(), site.id,
      () => mode === "dispatch" ? listDispatchOrders(pool, site) : listControlOrders(pool, site),
      request.signal, ["allinstant_cocina", "allinstant_despacho"]);
    return new Response(stream, { headers: {
      "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive", "X-Accel-Buffering": "no",
    } });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error("No se pudo iniciar SSE operativo", typeof code === "string" ? code : "SIN_CODIGO");
    return NextResponse.json({ error: "Flujo no disponible" }, { status: 503 });
  }
}
