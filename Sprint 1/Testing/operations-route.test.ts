import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  database: vi.fn(), operationalDatabase: vi.fn(), findOperationsSite: vi.fn(), changeOrder: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ database: mocks.database, operationalDatabase: mocks.operationalDatabase }));
vi.mock("@/lib/operations-site", async importOriginal => ({
  ...(await importOriginal<typeof import("../../lib/operations-site")>()), findOperationsSite: mocks.findOperationsSite,
}));
vi.mock("@/lib/dispatch", () => ({ changeOrder: mocks.changeOrder }));

import { POST } from "../../app/api/operations/[site]/orders/[id]/route";
import { makeCsrfToken } from "../../lib/operations-security";

const context = (site: string, id: string) => ({ params: Promise.resolve({ site, id }) });

describe("endpoint de transición operativa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.database.mockReturnValue({});
    mocks.operationalDatabase.mockReturnValue({});
    mocks.findOperationsSite.mockResolvedValue({ id: "1", code: "SMP", name: "San Martín de Porres" });
    mocks.changeOrder.mockResolvedValue("ok");
  });

  it("rechaza una solicitud externa antes de leer el cuerpo o consultar PostgreSQL", async () => {
    const request = new NextRequest("http://localhost:3000/api/operations/smp/orders/8", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{bad",
    });
    const response = await POST(request, context("smp", "8"));
    expect(response.status).toBe(403);
    expect(mocks.database).not.toHaveBeenCalled();
  });

  it("resuelve la sede en el servidor y usa el rol de despacho para confirmar listo", async () => {
    const token = makeCsrfToken("smp-dispatch");
    const request = new NextRequest("http://localhost:3000/api/operations/smp/orders/8", {
      method: "POST", body: JSON.stringify({ action: "ready" }), headers: {
        origin: "http://localhost:3000", "content-type": "application/json",
        "x-requested-with": "AllInstant", "x-csrf-token": token, cookie: `alesar_csrf=${token}`,
      },
    });
    const response = await POST(request, context("smp", "8"));
    expect(response.status).toBe(200);
    expect(mocks.findOperationsSite).toHaveBeenCalledWith(expect.anything(), "SMP");
    expect(mocks.operationalDatabase).toHaveBeenCalledWith("dispatch");
    expect(mocks.changeOrder).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: "1" }), "8", "ready", undefined);
  });

  it.each(["0", "-1", "pedido", "9223372036854775808"])("rechaza el identificador inválido %s antes de acceder a la base", async id => {
    const request = new NextRequest(`http://localhost:3000/api/operations/smp/orders/${id}`, { method: "POST" });
    expect((await POST(request, context("smp", id))).status).toBe(404);
    expect(mocks.database).not.toHaveBeenCalled();
  });
});
