import type { Pool, PoolClient } from "pg";

export type ClientSiteCode = "SMP" | "LM";
export type ClientSite = { id: string; code: ClientSiteCode; name: string };
export type CatalogItem = {
  productId: string; name: string; description: string; imageUrl: string | null;
  unitPrice: string; available: boolean; updatedAt: string | null;
};
export type QuoteItem = Pick<CatalogItem, "productId" | "name" | "unitPrice"> & { quantity: number; lineTotal: string };
export type Quote = { id: string; site: ClientSiteCode; items: QuoteItem[]; total: string; expiresAt: number };

type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

export class ClientInputError extends Error {}
export class SiteNotFoundError extends Error {}
export class CatalogNotReadyError extends Error {}
export class CatalogChangedError extends Error {}

const siteCodes = new Set<ClientSiteCode>(["SMP", "LM"]);
const money = (value: string | number): string => Number(value).toFixed(2);

export function parseSiteCode(value: unknown): ClientSiteCode | null {
  return typeof value === "string" && siteCodes.has(value as ClientSiteCode) ? value as ClientSiteCode : null;
}

export function parseCartItems(value: unknown): { productId: string; quantity: number }[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) throw new ClientInputError("La lista de productos no es válida");
  const items = value.map(item => {
    if (!item || typeof item !== "object") throw new ClientInputError("Producto no válido");
    const { productId, quantity } = item as { productId?: unknown; quantity?: unknown };
    if (typeof productId !== "string" || !/^[1-9][0-9]{0,18}$/.test(productId) ||
        typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new ClientInputError("Producto o cantidad no válido");
    }
    return { productId, quantity };
  });
  if (new Set(items.map(item => item.productId)).size !== items.length) throw new ClientInputError("No se permiten productos duplicados");
  return items;
}

function catalogUnavailable(error: unknown): boolean {
  return !!error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "42P01";
}

export async function listSites(db: Queryable): Promise<ClientSite[]> {
  const result = await db.query<{ sede_id: string; codigo: ClientSiteCode; nombre: string }>(
    "SELECT sede_id, codigo, nombre FROM sedes WHERE codigo IN ('SMP','LM') ORDER BY codigo"
  );
  return result.rows.map(row => ({ id: String(row.sede_id), code: row.codigo, name: row.nombre }));
}

export async function findClientSite(db: Queryable, code: ClientSiteCode): Promise<ClientSite> {
  const result = await db.query<{ sede_id: string; codigo: ClientSiteCode; nombre: string }>(
    "SELECT sede_id, codigo, nombre FROM sedes WHERE codigo = $1", [code]
  );
  if (result.rowCount !== 1) throw new SiteNotFoundError("La sede no existe");
  const row = result.rows[0];
  return { id: String(row.sede_id), code: row.codigo, name: row.nombre };
}

/** The HU-02 migration is the only source for public catalog metadata and pricing. */
export async function listCatalog(db: Queryable, site: ClientSite): Promise<CatalogItem[]> {
  try {
    const result = await db.query<{
      producto_id: string; nombre: string; descripcion: string | null; imagen_url: string | null;
      precio_vigente: string; disponible: boolean; actualizado_en: Date | string | null;
    }>(
      `SELECT p.producto_id, p.nombre, cp.descripcion, cp.imagen_url, cp.precio_vigente,
              cps.disponible, GREATEST(cp.actualizado_en, cps.actualizado_en) AS actualizado_en
         FROM disponibilidad_producto_sede cps
         JOIN productos p ON p.producto_id = cps.producto_id
         JOIN catalogo_producto cp ON cp.producto_id = cps.producto_id
        WHERE cps.sede_id = $1
        ORDER BY p.nombre, p.producto_id`, [site.id]
    );
    return result.rows.map(row => ({
      productId: String(row.producto_id), name: row.nombre, description: row.descripcion || "",
      imageUrl: row.imagen_url, unitPrice: money(row.precio_vigente), available: row.disponible,
      updatedAt: row.actualizado_en ? new Date(row.actualizado_en).toISOString() : null,
    }));
  } catch (error) {
    if (catalogUnavailable(error)) throw new CatalogNotReadyError("El catálogo aún no está disponible");
    throw error;
  }
}

export async function quoteCart(db: Queryable, site: ClientSite, cart: { productId: string; quantity: number }[]): Promise<Omit<Quote, "id" | "expiresAt">> {
  try {
    const result = await db.query<{
      producto_id: string; nombre: string; precio_vigente: string; disponible: boolean;
    }>(
      `SELECT p.producto_id, p.nombre, cp.precio_vigente, cps.disponible
         FROM disponibilidad_producto_sede cps
         JOIN productos p ON p.producto_id = cps.producto_id
         JOIN catalogo_producto cp ON cp.producto_id = cps.producto_id
        WHERE cps.sede_id = $1 AND cps.producto_id = ANY($2::bigint[])`,
      [site.id, cart.map(item => item.productId)]
    );
    if (result.rowCount !== cart.length) throw new CatalogChangedError("Hay productos que ya no se ofrecen en esta sede");
    const byProduct = new Map(result.rows.map(row => [String(row.producto_id), row]));
    const items = cart.map(({ productId, quantity }) => {
      const product = byProduct.get(productId);
      if (!product || !product.disponible) throw new CatalogChangedError("Hay productos agotados o no disponibles");
      const unitPrice = money(product.precio_vigente);
      return { productId, name: product.nombre, quantity, unitPrice, lineTotal: money(Number(unitPrice) * quantity) };
    });
    return { site: site.code, items, total: money(items.reduce((sum, item) => sum + Number(item.lineTotal), 0)) };
  } catch (error) {
    if (catalogUnavailable(error)) throw new CatalogNotReadyError("El catálogo aún no está disponible");
    throw error;
  }
}
