-- AlInstant / Sprint 1 / T00
-- Destino exclusivo: Neon allinstant-dev, rama development, base neondb.
-- Repara permisos mínimos del proceso Next.js para el catálogo y checkout
-- cliente. No concede privilegios a cocina ni despacho y no se ejecuta en
-- production.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog;

DO $preflight$
BEGIN
  IF to_regclass('public.catalogo_producto') IS NULL
     OR to_regclass('public.disponibilidad_producto_sede') IS NULL
     OR to_regclass('public.pedidos') IS NULL
     OR to_regclass('public.detalle_pedido') IS NULL
     OR to_regclass('public.estados_pedido') IS NULL THEN
    RAISE EXCEPTION 'Faltan tablas requeridas para la integración cliente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'allinstant_t114_read_app') THEN
    RAISE EXCEPTION 'No existe el rol LOGIN de la aplicación cliente';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'allinstant_t00_client') THEN
    CREATE ROLE allinstant_t00_client NOLOGIN;
  END IF;
END
$preflight$;

GRANT USAGE ON SCHEMA public TO allinstant_t00_client;
GRANT SELECT ON public.sedes, public.productos, public.estados_pedido,
  public.catalogo_producto, public.disponibilidad_producto_sede
  TO allinstant_t00_client;
GRANT INSERT ON public.pedidos, public.detalle_pedido,
  public.historial_estados_pedido TO allinstant_t00_client;
GRANT USAGE, SELECT ON SEQUENCE public.pedidos_pedido_id_seq,
  public.detalle_pedido_detalle_id_seq,
  public.historial_estados_pedido_historial_id_seq TO allinstant_t00_client;
GRANT allinstant_t00_client TO allinstant_t114_read_app;

DO $verify$
BEGIN
  IF NOT has_table_privilege('allinstant_t00_client', 'public.catalogo_producto', 'SELECT')
     OR NOT has_table_privilege('allinstant_t00_client', 'public.disponibilidad_producto_sede', 'SELECT')
     OR NOT has_table_privilege('allinstant_t00_client', 'public.pedidos', 'INSERT')
     OR NOT has_table_privilege('allinstant_t00_client', 'public.detalle_pedido', 'INSERT')
     OR NOT has_table_privilege('allinstant_t00_client', 'public.historial_estados_pedido', 'INSERT') THEN
    RAISE EXCEPTION 'Faltan privilegios cliente requeridos';
  END IF;
  IF has_table_privilege('allinstant_t00_client', 'public.pedidos', 'UPDATE')
     OR has_table_privilege('allinstant_t00_client', 'public.pedidos', 'DELETE')
     OR has_table_privilege('allinstant_t00_client', 'public.detalle_pedido', 'UPDATE')
     OR has_table_privilege('allinstant_t00_client', 'public.detalle_pedido', 'DELETE')
     OR has_table_privilege('allinstant_t00_client', 'public.historial_estados_pedido', 'UPDATE')
     OR has_table_privilege('allinstant_t00_client', 'public.historial_estados_pedido', 'DELETE') THEN
    RAISE EXCEPTION 'El rol cliente recibió DML no permitido';
  END IF;
END
$verify$;

COMMIT;
