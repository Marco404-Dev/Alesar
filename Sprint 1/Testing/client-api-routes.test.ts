import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ database: vi.fn(), findClientSite: vi.fn(), quoteCart: vi.fn(), listCatalog: vi.fn(), listSites: vi.fn(), storeQuote: vi.fn() }));
vi.mock("@/lib/db", () => ({ database: mocks.database }));
vi.mock("@/lib/client-catalog", async importOriginal => ({
  ...(await importOriginal<typeof import("../../lib/client-catalog")>()),
  findClientSite: mocks.findClientSite, quoteCart: mocks.quoteCart, listCatalog: mocks.listCatalog, listSites: mocks.listSites,
}));
vi.mock("@/lib/client-checkout", () => ({ storeQuote: mocks.storeQuote }));

import { GET as catalog } from "../../app/api/client/catalog/route";
import { POST as quote } from "../../app/api/client/checkout/quote/route";

describe("rutas públicas cliente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    mocks.database.mockReturnValue({});
    mocks.findClientSite.mockResolvedValue({ id: "1", code: "SMP", name: "San Martín" });
    mocks.quoteCart.mockResolvedValue({ site: "SMP", items: [], total: "18.00" });
    mocks.storeQuote.mockReturnValue({ id: "quote-1", site: "SMP", items: [], total: "18.00" });
  });

  it("valida sede antes de abrir la base de datos", async () => {
    const response = await catalog(new NextRequest("http://localhost:3000/api/client/catalog?site=otro"));
    expect(response.status).toBe(400);
    expect(mocks.database).not.toHaveBeenCalled();
  });

  it("bloquea escrituras cross-site antes de leer o cotizar", async () => {
    const response = await quote(new NextRequest("http://localhost:3000/api/client/checkout/quote", {
      method: "POST", body: "{bad", headers: { origin: "https://evil.example", "content-type": "application/json", "x-requested-with": "AlInstant", "sec-fetch-site": "cross-site" },
    }));
    expect(response.status).toBe(403);
    expect(mocks.database).not.toHaveBeenCalled();
  });

  it("devuelve una cotización server-side sin aceptar precios del navegador", async () => {
    const response = await quote(new NextRequest("http://localhost:3000/api/client/checkout/quote", {
      method: "POST", body: JSON.stringify({ site: "SMP", items: [{ productId: "1", quantity: 1, unitPrice: "0.01" }] }),
      headers: { origin: "http://localhost:5173", "content-type": "application/json", "x-requested-with": "AlInstant", "sec-fetch-site": "same-site" },
    }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ quoteId: "quote-1", site: "SMP", items: [], total: "18.00" });
    expect(mocks.quoteCart).toHaveBeenCalledWith(expect.anything(), expect.anything(), [{ productId: "1", quantity: 1 }]);
  });
});
