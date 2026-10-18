import { describe, expect, it } from "vitest";
import { listenConnectionString } from "../../lib/db";

const pooled = "postgresql://usuario:clave@ep-demo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";
const direct = "postgresql://usuario:clave@ep-demo.us-east-2.aws.neon.tech/neondb?sslmode=require";

describe("conexión directa para LISTEN", () => {
  it("deriva el endpoint directo de Neon si falta DATABASE_LISTEN_URL", () => {
    expect(listenConnectionString(pooled)).toBe(direct);
  });

  it("acepta un endpoint directo explícito de la misma base", () => {
    expect(listenConnectionString(pooled, direct)).toBe(direct);
    expect(listenConnectionString(direct)).toBe(direct);
  });

  it("rechaza pooler y bases o endpoints distintos para LISTEN", () => {
    expect(() => listenConnectionString(pooled, pooled)).toThrow(/directa/);
    expect(() => listenConnectionString(pooled, direct.replace("neondb", "otra"))).toThrow(/mismo endpoint y base/);
    expect(() => listenConnectionString(pooled, direct.replace("ep-demo", "ep-otro"))).toThrow(/mismo endpoint y base/);
  });
});
