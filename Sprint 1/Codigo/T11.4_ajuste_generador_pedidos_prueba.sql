-- Ajuste aditivo T11.4 aplicado en Neon development el 18-10-2026.
-- Alinea la función ya instalada con el precio de desarrollo más reciente
-- por producto; 1.00 es reserva válida cuando el producto no tiene historial.
-- No ejecutar en production ni sobre una base sin el generador T11.4.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public, pg_temp;

DO $preflight$
BEGIN
  IF to_regclass('public.t114_entorno_pruebas') IS NULL OR
     to_regclass('public.t114_pedidos_prueba') IS NULL OR
     to_regprocedure('public.fn_t114_generar_pedido_prueba(bigint)') IS NULL THEN
    RAISE EXCEPTION 'El generador T11.4 no está instalado';
  END IF;
END $preflight$;

CREATE OR REPLACE FUNCTION public.fn_t114_generar_pedido_prueba(p_sede BIGINT)
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
  SELECT p.producto_id,
         COALESCE((
           SELECT d.precio_unitario FROM public.detalle_pedido d
           WHERE d.producto_id = p.producto_id
           ORDER BY d.detalle_id DESC LIMIT 1
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
GRANT EXECUTE ON FUNCTION public.fn_t114_generar_pedido_prueba(BIGINT)
  TO allinstant_t114_test_orders;
COMMIT;
