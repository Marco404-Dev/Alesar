import { Client, Pool } from "pg";

let pool: Pool | undefined;

export function database(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL no está configurado");
    pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  }
  return pool;
}

export function listenConnectionString(databaseUrl?: string, listenUrl?: string): string {
  if (!databaseUrl) throw new Error("DATABASE_URL no está configurado");
  const databaseEndpoint = new URL(databaseUrl);
  const directHost = databaseEndpoint.hostname.replace(/-pooler(?=\.)/, "");

  if (!listenUrl) {
    if (databaseEndpoint.hostname.includes("-pooler")) {
      if (!databaseEndpoint.hostname.endsWith(".neon.tech") || directHost === databaseEndpoint.hostname) {
        throw new Error("DATABASE_LISTEN_URL debe ser una conexión directa");
      }
      databaseEndpoint.hostname = directHost;
      return databaseEndpoint.toString();
    }
    return databaseUrl;
  }

  const listenerEndpoint = new URL(listenUrl);
  if (listenerEndpoint.hostname.includes("-pooler")) {
    throw new Error("LISTEN requiere una conexión directa de Neon, sin -pooler");
  }
  if (listenerEndpoint.hostname !== directHost || listenerEndpoint.pathname !== databaseEndpoint.pathname) {
    throw new Error("DATABASE_LISTEN_URL debe apuntar al mismo endpoint y base que DATABASE_URL");
  }
  return listenUrl;
}

export function notificationClient(): Client {
  const connectionString = listenConnectionString(process.env.DATABASE_URL, process.env.DATABASE_LISTEN_URL);
  return new Client({ connectionString, connectionTimeoutMillis: 5000, keepAlive: true });
}
