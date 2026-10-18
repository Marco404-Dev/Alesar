import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  database: vi.fn(),
  notificationClient: vi.fn(),
  findKitchenSite: vi.fn(),
  createKitchenStream: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ database: mocks.database, notificationClient: mocks.notificationClient }));
vi.mock("@/lib/kitchen", async importOriginal => ({
  ...(await importOriginal<typeof import("../../lib/kitchen")>()),
  findKitchenSite: mocks.findKitchenSite,
}));
vi.mock("@/lib/kitchen-stream", () => ({ createKitchenStream: mocks.createKitchenStream }));

import { GET } from "../../app/api/kitchen/[site]/stream/route";

describe("endpoint de lectura del monitor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.database.mockReturnValue({});
    mocks.notificationClient.mockReturnValue({});
    mocks.findKitchenSite.mockImplementation(async (_db, code: string) => ({ id: code === "SMP" ? "1" : "2", code, name: code }));
    mocks.createKitchenStream.mockResolvedValue(new ReadableStream({ start(controller) { controller.close(); } }));
  });

  it.each([["smp", "SMP"], ["lm", "LM"]])("permite acceso directo a %s y fija la sede en el servidor", async (slug, code) => {
    const request = new NextRequest(`http://localhost:3000/api/kitchen/${slug}/stream`);
    const response = await GET(request, { params: Promise.resolve({ site: slug }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(mocks.findKitchenSite).toHaveBeenCalledWith(expect.anything(), code);
    expect(mocks.createKitchenStream).toHaveBeenCalledWith(expect.anything(), code === "SMP" ? "1" : "2", expect.any(Function), request.signal);
  });

  it("rechaza códigos de sede distintos de las dos rutas", async () => {
    const response = await GET(new NextRequest("http://localhost:3000/api/kitchen/otra/stream"), { params: Promise.resolve({ site: "otra" }) });
    expect(response.status).toBe(404);
    expect(mocks.database).not.toHaveBeenCalled();
  });
});
