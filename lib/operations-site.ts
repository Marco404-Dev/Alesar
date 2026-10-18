import type { Pool } from "pg";

export type SiteCode = "SMP" | "LM";
export type OperationsSite = { id: string; code: SiteCode; name: string };

type Queryable = Pick<Pool, "query">;

export function siteCodeFromSlug(slug: string): SiteCode | null {
  if (slug === "smp") return "SMP";
  if (slug === "lm") return "LM";
  return null;
}

export async function findOperationsSite(db: Queryable, code: SiteCode): Promise<OperationsSite> {
  const result = await db.query<{ sede_id: string; nombre: string }>(
    "SELECT sede_id, nombre FROM sedes WHERE codigo = $1", [code]
  );
  if (result.rowCount !== 1) throw new Error(`La sede ${code} no existe en la base de datos`);
  return { id: String(result.rows[0].sede_id), code, name: result.rows[0].nombre };
}

