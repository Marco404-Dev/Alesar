// Ejecución manual controlada: node Sprint 1/Testing/T00_prueba_concurrencia_codigo_recojo.mjs
// Requiere aplicar previamente la propuesta SQL autorizada. Solo development/neondb.
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const env = Object.fromEntries(fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
  .filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
const testConnectionString = env.TEST_ORDERS_DATABASE_URL;
if (!testConnectionString) throw new Error('TEST_ORDERS_DATABASE_URL no está configurada');
const clients = [new Client({ connectionString: testConnectionString }), new Client({ connectionString: testConnectionString })];
const verifier = new Client({ connectionString: testConnectionString });
await Promise.all(clients.map(client => client.connect()));
await verifier.connect();
try {
  const target = await verifier.query("SELECT current_database() AS database, EXISTS (SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno='development') AS is_development");
  if (target.rowCount !== 1 || target.rows[0].database !== 'neondb' || target.rows[0].is_development !== true)
    throw new Error('La prueba solo puede ejecutarse en development/neondb');
  const create = async (client, dni, retry) => {
    try { return (await client.query('SELECT * FROM public.fn_t00_crear_pedido_colision_prueba($1,$2)', ['ZXZ', dni])).rows[0]; }
    catch (error) {
      if (error?.code !== '23505' || !retry) throw error;
      return (await client.query('SELECT * FROM public.fn_t00_crear_pedido_colision_prueba($1,$2)', ['ZXY', dni])).rows[0];
    }
  };
  const [first, second] = await Promise.all([create(clients[0], '90000002', false), create(clients[1], '90000003', true)]);
  if (new Set([first.codigo_recojo, second.codigo_recojo]).size !== 2) throw new Error('La colisión no fue resuelta');
  console.log(JSON.stringify({ first, second }));
} finally { await Promise.all([...clients, verifier].map(client => client.end())); }
