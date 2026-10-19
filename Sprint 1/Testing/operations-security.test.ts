import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { makeCsrfToken, operationsAccess, validCsrf } from "../../lib/operations-security";

function request(headers: Record<string, string> = {}) {
  return new NextRequest("http://127.0.0.1:3000/api/operations/smp/orders/8", { method: "POST", headers });
}

describe("protección de escrituras locales", () => {
  it("exige origen, tipo JSON y encabezado contra solicitudes cruzadas", () => {
    expect(operationsAccess(request(), "smp", "dispatch", true)).toBe(false);
    expect(operationsAccess(request({ origin: "http://evil.test", "content-type": "application/json", "x-requested-with": "AllInstant" }), "smp", "dispatch", true)).toBe(false);
    expect(operationsAccess(request({ origin: "http://127.0.0.1:3000", "content-type": "application/json", "x-requested-with": "AllInstant", "sec-fetch-site": "same-origin" }), "smp", "dispatch", true)).toBe(true);
  });

  it("firma token por sede, exige cookie y expira/impide alteración", () => {
    const token = makeCsrfToken("smp-dispatch");
    const headers = { cookie: `alesar_csrf=${token}`, "x-csrf-token": token };
    expect(validCsrf(request(headers), "smp-dispatch")).toBe(true);
    expect(validCsrf(request(headers), "smp-control")).toBe(false);
    expect(validCsrf(request({ ...headers, "x-csrf-token": `${token}a` }), "smp-dispatch")).toBe(false);
  });

  it("en producción exige clave distinta para cocina y despacho", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("OPERATIONS_ORIGIN", "http://localhost:3000");
    vi.stubEnv("OPERATIONS_PROXY_KEY_SMP_CONTROL", "c".repeat(40));
    vi.stubEnv("OPERATIONS_PROXY_KEY_SMP_DISPATCH", "d".repeat(40));
    try {
      const control = request({ "x-alesar-internal-key": "c".repeat(40) });
      expect(operationsAccess(control, "smp", "control")).toBe(true);
      expect(operationsAccess(control, "smp", "dispatch")).toBe(false);
      expect(operationsAccess(control, "lm", "control")).toBe(false);
      expect(operationsAccess(request(), "smp", "control")).toBe(false);
      vi.stubEnv("OPERATIONS_PROXY_KEY_LM_CONTROL", "c".repeat(40));
      expect(operationsAccess(control, "smp", "control")).toBe(false);
    } finally { vi.unstubAllEnvs(); }
  });
});
