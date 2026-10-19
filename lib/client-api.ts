import { NextRequest, NextResponse } from "next/server";

export const noStore = { "Cache-Control": "no-store" };

function allowedOrigins(request: NextRequest): string[] {
  const configured = process.env.CLIENT_APP_ORIGIN;
  if (configured) return configured.split(",").map(origin => origin.trim()).filter(Boolean);
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname)) {
    return [request.nextUrl.origin, "http://localhost:5173", "http://127.0.0.1:5173"];
  }
  return [];
}

export function clientCors(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins(request).includes(origin)) {
    return { ...noStore, "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }
  return noStore;
}

export function clientWriteAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !!origin && allowedOrigins(request).includes(origin) &&
    request.headers.get("content-type")?.split(";", 1)[0].trim() === "application/json" &&
    request.headers.get("x-requested-with") === "AllInstant" &&
    (!request.headers.get("sec-fetch-site") || request.headers.get("sec-fetch-site") !== "cross-site");
}

export function clientError(request: NextRequest, status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status, headers: clientCors(request) });
}

export function clientJson(request: NextRequest, body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: clientCors(request) });
}
