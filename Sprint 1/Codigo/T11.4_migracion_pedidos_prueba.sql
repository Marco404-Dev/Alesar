-- T11.4: generador de pedidos sintéticos exclusivo para Neon development.
-- Aplicar una sola vez, después de las migraciones T11.2, T11.3 y T11.4.
-- No ejecutar en production. No modifica pedidos, productos ni historial existentes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public, pg_temp;

DO $preflight$
BEGIN
  IF to_regclass('public.pedidos') IS NULL OR
     to_regclass('public.detalle_pedido') IS NULL OR
     to_regclass('public.productos') IS NULL OR
     to_regclass('public.sedes') IS NULL OR
     to_regclass('public.historial_estados_pedido') IS NULL THEN
    RAISE EXCEPTION 'Faltan tablas base para el generador de pedidos de prueba';
  END IF;
  IF to_regprocedure('public.fn_t114_terminar_preparacion(bigint,bigint)') IS NULL OR
     to_regprocedure('pg_catalog.gen_random_uuid()') IS NULL THEN
    RAISE EXCEPTION 'Faltan dependencias T11.4 o gen_random_uuid()';
  END IF;
  IF to_regclass('public.t114_entorno_pruebas') IS NOT NULL OR
     to_regclass('public.t114_pedidos_prueba') IS NOT NULL OR
     to_regprocedure('public.fn_t114_generar_pedido_prueba(bigint)') IS NOT NULL THEN
    RAISE EXCEPTION 'El generador T11.4 ya existe total o parcialmente; revisar antes de reintentar';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_namespace n
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(n.nspacl, pg_catalog.acldefault('n', n.nspowner))) a
    WHERE n.nspname = 'public' AND a.grantee = 0 AND a.privilege_type = 'CREATE'
  ) THEN
    RAISE EXCEPTION 'El esquema public concede CREATE a PUBLIC';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.productos) THEN
    RAISE EXCEPTION 'No hay productos existentes para construir un pedido de prueba';
  END IF;
END $preflight$;

-- Marcador persistente que la aplicación consulta con la conexión limitada.
-- El CHECK impide etiquetar otra base como entorno habilitado para esta función.
CREATE TABLE public.t114_entorno_pruebas (
  entorno TEXT PRIMARY KEY,
  CONSTRAINT t114_entorno_pruebas_solo_development CHECK (entorno = 'development')
);
INSERT INTO public.t114_entorno_pruebas(entorno) VALUES ('development');
REVOKE ALL ON public.t114_entorno_pruebas FROM PUBLIC;

-- La FK es la identificación inequívoca de un pedido creado por el generador.
-- No depende del nombre, DNI, teléfono ni código de recojo.
CREATE TABLE public.t114_pedidos_prueba (
  pedido_id BIGINT PRIMARY KEY
    REFERENCES public.pedidos(pedido_id) ON DELETE RESTRICT,
  generado_en TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
REVOKE ALL ON public.t114_pedidos_prueba FROM PUBLIC;

-- Crea cabecera, detalle y marcador en una única transacción de la llamada.
-- Los triggers existentes insertan historial y emiten NOTIFY después del COMMIT.
CREATE FUNCTION public.fn_t114_generar_pedido_prueba(p_sede BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $fn$
DECLARE
  v_pedido BIGINT;
  v_producto BIGINT;
  v_precio NUMERIC(12,2);
  v_codigo TEXT;
  v_dni TEXT;
  v_intento INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno = 'development'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'El generador de pedidos de prueba no está habilitado en esta base';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.sedes WHERE sede_id = p_sede) THEN
    RAISE EXCEPTION USING ERRCODE = '23503', MESSAGE = 'Sede inexistente';
  END IF;

  -- Productos globales del esquema T11.2: no se usan identificadores fijos.
  SELECT p.producto_id,
         COALESCE((
           SELECT d.precio_unitario
           FROM public.detalle_pedido d
           WHERE d.producto_id = p.producto_id
           ORDER BY d.detalle_id DESC
           LIMIT 1
         ), 1.00::NUMERIC(12,2))
  INTO v_producto, v_precio
  FROM public.productos p
  ORDER BY p.producto_id
  OFFSET pg_catalog.floor(pg_catalog.random() * (SELECT count(*) FROM public.productos))
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '23514',
      MESSAGE = 'No hay productos disponibles para un pedido de prueba';
  END IF;

  -- El índice UNIQUE de pedidos.codigo_recojo es la garantía final ante carreras.
  FOR v_intento IN 1..8 LOOP
    v_codigo := 'TP-' || pg_catalog.upper(
      pg_catalog.substr(pg_catalog.replace(pg_catalog.gen_random_uuid()::TEXT, '-', ''), 1, 17)
    );
    v_dni := pg_catalog.lpad(
      pg_catalog.floor(pg_catalog.random() * 100000000)::BIGINT::TEXT, 8, '0'
    );
    BEGIN
      INSERT INTO public.pedidos(
        codigo_recojo, sede_id, dni_cliente, nombre_cliente, whatsapp_cliente,
        estado_id, pago_confirmado, confirmado_en
      ) VALUES (
        v_codigo, p_sede, v_dni, 'PEDIDO PRUEBA T11.4 ' || pg_catalog.substr(v_codigo, 4, 8),
        '0000000000', 2, TRUE, pg_catalog.clock_timestamp()
      ) RETURNING pedido_id INTO v_pedido;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF v_intento = 8 THEN RAISE; END IF;
    END;
  END LOOP;

  INSERT INTO public.detalle_pedido(pedido_id, producto_id, cantidad, precio_unitario)
  VALUES (v_pedido, v_producto, 1, v_precio);
  INSERT INTO public.t114_pedidos_prueba(pedido_id) VALUES (v_pedido);
  RETURN v_pedido;
END $fn$;

REVOKE ALL ON FUNCTION public.fn_t114_generar_pedido_prueba(BIGINT) FROM PUBLIC;
COMMIT;
