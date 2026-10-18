import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  database: vi.fn(), testOrdersDatabase: vi.fn(), findKitchenSite: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ database: mocks.database, testOrdersDatabase: mocks.testOrdersDatabase }));
vi.mock("@/lib/kitchen", async importOriginal => ({
  ...(await importOriginal<typeof import("../../lib/kitchen")>()), findKitchenSite: mocks.findKitchenSite,
}));

import { POST } from "../../app/api/operations/[site]/test-orders/route";
import { makeCsrfToken } from "../../lib/operations-security";

const context = (site: string) => ({ params: Promise.resolve({ site }) });

function request(token?: string) {
  return new NextRequest("http://localhost:3000/api/operations/smp/test-orders", {
    method: "POST", body: "{}", headers: {
      origin: "http://localhost:3000", "content-type": "application/json", "x-requested-with": "AllInstant",
      ...(token ? { "x-csrf-token": token, cookie: `alesar_csrf=${token}` } : {}),
    },
  });
}

describe("endpoint de pedidos sintéticos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_TEST_ORDERS", "true");
    mocks.database.mockReturnValue({});
    mocks.findKitchenSite.mockResolvedValue({ id: "1", code: "SMP", name: "San Martín de Porres" });
  });

  it("permanece inaccesible sin la habilitación explícita", async () => {
    vi.stubEnv("ENABLE_TEST_ORDERS", "false");
    expect((await POST(request(), context("smp"))).status).toBe(404);
    expect(mocks.database).not.toHaveBeenCalled();
    expect(mocks.testOrdersDatabase).not.toHaveBeenCalled();
  });

  it("permanece inaccesible en producción aunque la variable esté habilitada", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request(), context("smp"))).status).toBe(404);
    expect(mocks.database).not.toHaveBeenCalled();
    expect(mocks.testOrdersDatabase).not.toHaveBeenCalled();
  });

  it("exige las protecciones de escritura antes de abrir conexiones", async () => {
    expect((await POST(request(), context("smp"))).status).toBe(403);
    expect(mocks.database).not.toHaveBeenCalled();
    expect(mocks.testOrdersDatabase).not.toHaveBeenCalled();
  });

  it("verifica el marcador real de development y crea solo para la sede resuelta", async () => {
    const testDb = { query: vi.fn()
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ is_development: true }] })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ pedido_id: "91" }] }) };
    mocks.testOrdersDatabase.mockReturnValue(testDb);
    const token = makeCsrfToken("smp-dispatch");
    const response = await POST(request(token), context("smp"));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ pedidoId: "91" });
    expect(mocks.findKitchenSite).toHaveBeenCalledWith(expect.anything(), "SMP");
    expect(testDb.query.mock.calls[0][0]).toContain("t114_entorno_pruebas");
    expect(testDb.query.mock.calls[1]).toEqual([
      "SELECT public.fn_t114_generar_pedido_prueba($1::bigint) AS pedido_id", ["1"],
    ]);
  });

  it("bloquea una conexión que no contiene el marcador de development", async () => {
    const testDb = { query: vi.fn().mockResolvedValue({ rowCount: 1, rows: [{ is_development: false }] }) };
    mocks.testOrdersDatabase.mockReturnValue(testDb);
    const token = makeCsrfToken("smp-dispatch");
    expect((await POST(request(token), context("smp"))).status).toBe(403);
    expect(testDb.query).toHaveBeenCalledTimes(1);
  });
});
