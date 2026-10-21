import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const cookieName = "alesar_csrf";
function developmentSecret(): string {
  const processState = globalThis as typeof globalThis & { __allinstantOperationsCsrfSecret?: string };
  return processState.__allinstantOperationsCsrfSecret ||= randomBytes(32).toString("hex");
}

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function allowedOrigins(request: NextRequest): string[] {
  const configured = process.env.OPERATIONS_ORIGIN;
  if (configured) return [configured];
  if (process.env.NODE_ENV !== "production" &&
      ["127.0.0.1", "localhost"].includes(request.nextUrl.hostname)) {
    return [request.nextUrl.origin, request.nextUrl.origin.replace("localhost", "127.0.0.1")];
  }
  return [];
}

export type OperationsRole = "control" | "dispatch";

export function operationsAccess(request: NextRequest, site: "smp" | "lm", role: OperationsRole, write = false): boolean {
  const expected = allowedOrigins(request);
  if (!expected.includes(request.nextUrl.origin)) return false;
  if (process.env.NODE_ENV === "production") {
    const key = process.env[`OPERATIONS_PROXY_KEY_${site.toUpperCase()}_${role.toUpperCase()}`];
    if (!key || key.length < 32 || !equal(request.headers.get("x-alesar-internal-key") || "", key)) return false;
    const otherKeys = ["SMP_CONTROL", "SMP_DISPATCH", "LM_CONTROL", "LM_DISPATCH"]
      .filter(area => area !== `${site.toUpperCase()}_${role.toUpperCase()}`)
      .map(area => process.env[`OPERATIONS_PROXY_KEY_${area}`]);
    if (otherKeys.some(other => other && equal(key, other))) return false;
  }
  if (write) {
    if (!expected.includes(request.headers.get("origin") || "")) return false;
    if (request.headers.get("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin") return false;
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return false;
    if (request.headers.get("x-requested-with") !== "AlInstant") return false;
  }
  return true;
}

function secret(): string | null {
  return process.env.OPERATIONS_CSRF_SECRET || (process.env.NODE_ENV === "production" ? null : developmentSecret());
}

export function makeCsrfToken(site: string): string {
  const key = secret();
  if (!key || key.length < 32) throw new Error("OPERATIONS_CSRF_SECRET no configurado");
  const value = `${site}.${Date.now()}.${randomBytes(24).toString("hex")}`;
  const signature = createHmac("sha256", key).update(value).digest("hex");
  return `${value}.${signature}`;
}

export function validCsrf(request: NextRequest, site: string): boolean {
  const key = secret();
  const token = request.headers.get("x-csrf-token") || "";
  const cookie = request.cookies.get(cookieName)?.value || "";
  if (!key || key.length < 32 || !token || !equal(token, cookie)) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== site) return false;
  const issued = Number(parts[1]);
  if (!Number.isSafeInteger(issued) || issued > Date.now() || Date.now() - issued > 60 * 60 * 1000) return false;
  return equal(parts[3], createHmac("sha256", key).update(parts.slice(0, 3).join(".")).digest("hex"));
}

export function csrfCookiePath(site: string): string { return `/api/operations/${site}`; }
export { cookieName };
