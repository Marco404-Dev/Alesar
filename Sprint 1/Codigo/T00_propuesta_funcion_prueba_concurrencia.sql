-- PROPUESTA SIN EJECUTAR. Solo allinstant-dev/development/neondb.
-- Requiere autorización expresa: crea una función SECURITY DEFINER temporal.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog;

DO $preflight$
BEGIN
  IF current_database() <> 'neondb' OR NOT EXISTS (SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno = 'development') THEN
    RAISE EXCEPTION 'La prueba de concurrencia solo está habilitada en development/neondb';
  END IF;
  IF to_regrole('allinstant_t114_test_orders') IS NULL OR
     to_regprocedure('public.fn_t114_generar_pedido_prueba(bigint)') IS NULL OR
     to_regprocedure('public.fn_t00_crear_pedido_colision_prueba(text,text)') IS NOT NULL OR
     to_regclass('public.catalogo_producto') IS NULL OR
     to_regclass('public.disponibilidad_producto_sede') IS NULL OR
     NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='pedidos' AND indexname='pedidos_codigo_recojo_activo_sede_uq') THEN
    RAISE EXCEPTION 'Precondiciones T00 incompletas';
  END IF;
END $preflight$;

CREATE FUNCTION public.fn_t00_crear_pedido_colision_prueba(p_codigo text, p_dni text)
RETURNS TABLE(pedido_id bigint, codigo_recojo text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO pg_catalog, public, pg_temp
AS $function$
DECLARE v_sede bigint; v_estado smallint; v_producto bigint; v_precio numeric(12,2); v_pedido bigint;
BEGIN
  IF current_database() <> 'neondb' OR NOT EXISTS (SELECT 1 FROM public.t114_entorno_pruebas WHERE entorno='development') THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Prueba permitida solo en development';
  END IF;
  IF p_codigo NOT IN ('ZXZ','ZXY') OR p_dni NOT IN ('90000002','90000003') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Parámetros de prueba no permitidos';
  END IF;
  SELECT sede_id INTO v_sede FROM public.sedes WHERE codigo='LM';
  SELECT estado_id INTO v_estado FROM public.estados_pedido WHERE codigo='PREPARANDO';
  SELECT p.producto_id,c.precio_vigente INTO v_producto,v_precio
  FROM public.productos p JOIN public.catalogo_producto c ON c.producto_id=p.producto_id
  JOIN public.disponibilidad_producto_sede d ON d.producto_id=p.producto_id
  WHERE d.sede_id=v_sede AND d.disponible AND p.nombre LIKE '[Prueba S1] %'
  ORDER BY p.producto_id LIMIT 1;
  IF v_sede IS NULL OR v_estado IS NULL OR v_producto IS NULL THEN RAISE EXCEPTION 'Precondiciones sintéticas incompletas'; END IF;
  INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente,estado_id,pago_confirmado)
  VALUES(p_codigo,v_sede,p_dni,'T00 concurrencia controlada','99900000' || right(p_dni,1),v_estado,TRUE)
  RETURNING pedidos.pedido_id INTO v_pedido;
  INSERT INTO public.detalle_pedido(pedido_id,producto_id,cantidad,precio_unitario) VALUES(v_pedido,v_producto,1,v_precio);
  INSERT INTO public.t114_pedidos_prueba(pedido_id) VALUES(v_pedido);
  RETURN QUERY SELECT v_pedido,p_codigo;
END $function$;

REVOKE ALL ON FUNCTION public.fn_t00_crear_pedido_colision_prueba(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_t00_crear_pedido_colision_prueba(text,text) TO allinstant_t114_test_orders;
COMMIT;
