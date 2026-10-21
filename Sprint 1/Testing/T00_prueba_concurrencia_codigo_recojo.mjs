// Ejecución manual controlada: node Sprint 1/Testing/T00_prueba_concurrencia_codigo_recojo.mjs
// Solo development/neondb. Crea dos pedidos sintéticos persistentes y entregables.
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const env = Object.fromEntries(fs.readFileSync(path.resolve('.env.local'), 'utf8').split(/\r?\n/)
  .filter(line => /^[A-Z_]+=/.test(line)).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
const connectionString = env.DATABASE_LISTEN_URL;
const testConnectionString = env.TEST_ORDERS_DATABASE_URL;
if (!connectionString || !testConnectionString) throw new Error('Conexiones de prueba no configuradas');
const clients = [new Client({ connectionString: testConnectionString }), new Client({ connectionString: testConnectionString })];
const verifier = new Client({ connectionString: testConnectionString });
await Promise.all(clients.map(client => client.connect()));
await verifier.connect();
try {
  const target = await verifier.query("SELECT current_database() AS database, EXISTS (SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno='development') AS is_development");
  if (target.rowCount !== 1 || target.rows[0].database !== 'neondb' || target.rows[0].is_development !== true)
    throw new Error('La prueba solo puede ejecutarse en development/neondb');
  const [site, state, product] = await Promise.all([
    clients[0].query("SELECT sede_id FROM public.sedes WHERE codigo='LM'"),
    clients[0].query("SELECT estado_id FROM public.estados_pedido WHERE codigo='PREPARANDO'"),
    clients[0].query("SELECT p.producto_id,c.precio_vigente FROM public.productos p JOIN public.catalogo_producto c ON c.producto_id=p.producto_id JOIN public.disponibilidad_producto_sede d ON d.producto_id=p.producto_id JOIN public.sedes s ON s.sede_id=d.sede_id WHERE s.codigo='LM' AND d.disponible AND p.nombre LIKE '[Prueba S1] %' ORDER BY p.producto_id LIMIT 1"),
  ]);
  if (site.rowCount !== 1 || state.rowCount !== 1 || product.rowCount !== 1) throw new Error('Precondiciones sintéticas incompletas');
  const occupied = await clients[0].query("SELECT codigo_recojo FROM public.pedidos WHERE sede_id=$1 AND estado_id IN (1,2,3) AND upper(codigo_recojo) IN ('ZXZ','ZXY')", [site.rows[0].sede_id]);
  if (occupied.rowCount) throw new Error('Códigos de prueba aún activos; entregue los pedidos T00 anteriores antes de repetir');
  const create = async (client, code, retry) => {
    await client.query('BEGIN');
    try {
      let result;
      try { result = await client.query("INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente,estado_id,pago_confirmado) VALUES($1,$2,'90000002','T00 concurrencia','999000002',$3,TRUE) RETURNING pedido_id,codigo_recojo", [code,site.rows[0].sede_id,state.rows[0].estado_id]); }
      catch (error) {
        if (error?.code !== '23505' || !retry) throw error;
        result = await client.query("INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente,estado_id,pago_confirmado) VALUES($1,$2,'90000003','T00 concurrencia','999000003',$3,TRUE) RETURNING pedido_id,codigo_recojo", ['ZXY',site.rows[0].sede_id,state.rows[0].estado_id]);
      }
      await client.query('INSERT INTO public.detalle_pedido(pedido_id,producto_id,cantidad,precio_unitario) VALUES($1,$2,1,$3)', [result.rows[0].pedido_id,product.rows[0].producto_id,product.rows[0].precio_vigente]);
      await client.query('COMMIT'); return result.rows[0];
    } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
  };
  const [first, second] = await Promise.all([create(clients[0], 'ZXZ', false), create(clients[1], 'ZXZ', true)]);
  if (new Set([first.codigo_recojo, second.codigo_recojo]).size !== 2) throw new Error('La colisión no fue resuelta');
  console.log(JSON.stringify({ first, second }));
} finally { await Promise.all([...clients, verifier].map(client => client.end())); }
