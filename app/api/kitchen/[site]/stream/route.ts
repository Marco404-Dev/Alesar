import { NextRequest, NextResponse } from "next/server";
import { database, notificationClient } from "@/lib/db";
import { findKitchenSite, listKitchenProducts, siteCodeFromSlug } from "@/lib/kitchen";
import { createKitchenStream } from "@/lib/kitchen-stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ site: string }> }) {
  const code = siteCodeFromSlug((await context.params).site);
  if (!code) return NextResponse.json({ error: "Sede no válida" }, { status: 404 });

  let stage = "consulta de sede";
  try {
    const pool = database();
    const site = await findKitchenSite(pool, code);
    stage = "conexión de escucha";
    const stream = await createKitchenStream(
      notificationClient(), site.id,
      () => listKitchenProducts(pool, site),
      request.signal,
    );
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error("No se pudo iniciar el flujo de cocina", { stage, code: typeof code === "string" ? code : "SIN_CODIGO" });
    return NextResponse.json({ error: "Flujo de cocina no disponible" }, { status: 503 });
  }
}
