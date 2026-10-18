import { NextRequest, NextResponse } from "next/server";
import { siteCodeFromSlug } from "@/lib/kitchen";
import { cookieName, csrfCookiePath, makeCsrfToken, operationsAccess } from "@/lib/operations-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ site: string }> }) {
  const slug = (await context.params).site;
  if (!siteCodeFromSlug(slug)) return NextResponse.json({ error: "Sede no válida" }, { status: 404 });
  const role = request.nextUrl.searchParams.get("role");
  if (role !== "control" && role !== "dispatch") return NextResponse.json({ error: "Área no válida" }, { status: 400 });
  if (!operationsAccess(request, slug as "smp" | "lm", role)) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  try {
    const token = makeCsrfToken(`${slug}-${role}`);
    const response = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
    response.cookies.set(cookieName, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: csrfCookiePath(slug), maxAge: 3600 });
    return response;
  } catch { return NextResponse.json({ error: "Seguridad operativa no configurada" }, { status: 503 }); }
}
