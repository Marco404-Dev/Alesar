import { NextRequest, NextResponse } from "next/server";
import { database, operationalDatabase } from "@/lib/db";
import { findOperationsSite, siteCodeFromSlug } from "@/lib/operations-site";
import { changeOrder } from "@/lib/dispatch";
import { operationsAccess, validCsrf } from "@/lib/operations-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: { params: Promise<{ site: string; id: string }> }) {
  const { site: slug, id } = await context.params;
  const code = siteCodeFromSlug(slug);
  if (!code || !/^[1-9][0-9]{0,18}$/.test(id) || (id.length === 19 && id > "9223372036854775807"))
    return NextResponse.json({ error: "Pedido o sede no válido" }, { status: 404 });
  // Rechazar solicitudes externas antes de leer el cuerpo JSON.
  const site = slug as "smp" | "lm";
  if (!operationsAccess(request, site, "control", true) && !operationsAccess(request, site, "dispatch", true))
    return NextResponse.json({ error: "Solicitud no autorizada" }, { status: 403 });
  let body: { action?: unknown; pickupCode?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud no válida" }, { status: 400 }); }
  const action = body?.action;
  if (action !== "finish" && action !== "ready" && action !== "deliver") return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  const role = action === "finish" ? "control" : "dispatch";
  if (!operationsAccess(request, site, role, true) || !validCsrf(request, `${slug}-${role}`))
    return NextResponse.json({ error: "Solicitud no autorizada" }, { status: 403 });
  if (action === "deliver" && (typeof body.pickupCode !== "string" || body.pickupCode.length > 20))
    return NextResponse.json({ error: "Código no válido" }, { status: 400 });
  try {
    const pool = database();
    const operationsSite = await findOperationsSite(pool, code);
    const result = await changeOrder(operationalDatabase(role), operationsSite, id, action, action === "deliver" ? body.pickupCode as string : undefined);
    const statuses = { ok: 200, duplicate: 409, "not-found": 404, "invalid-state": 409, "no-notice": 409, "invalid-code": 422 };
    return NextResponse.json({ result }, { status: statuses[result], headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const dbCode = error && typeof error === "object" && "code" in error ? error.code : undefined;
    console.error("No se pudo actualizar pedido", typeof dbCode === "string" ? dbCode : "SIN_CODIGO");
    return NextResponse.json({ error: "Operación no disponible" }, { status: 503 });
  }
}
