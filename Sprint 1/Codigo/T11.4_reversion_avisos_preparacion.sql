-- REVERSIÓN ESTRUCTURAL T11.4. NO EJECUTAR EN NEON SIN AUTORIZACIÓN.
-- Detener antes las rutas /despacho y /control-cocina y nuevas escrituras.
-- Conserva public.avisos_preparacion, sus filas, índices y la FK; no altera
-- pedidos ni historial. T11.2/T11.3 permanecen como estaban.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog;

DO $preflight$
BEGIN
  IF to_regclass('public.avisos_preparacion') IS NULL OR
     to_regclass('public.pedidos') IS NULL THEN
    RAISE EXCEPTION 'Esquema T11.4/T11.2 incompleto; revisar antes de revertir';
  END IF;
END $preflight$;

DROP TRIGGER IF EXISTS trg_notificar_despacho_aviso ON public.avisos_preparacion;
DROP TRIGGER IF EXISTS trg_t114_validar_aviso ON public.avisos_preparacion;
DROP TRIGGER IF EXISTS trg_notificar_despacho_pedido ON public.pedidos;
DROP TRIGGER IF EXISTS trg_t114_exigir_aviso_listo ON public.pedidos;

DROP FUNCTION IF EXISTS public.fn_notificar_despacho_aviso();
DROP FUNCTION IF EXISTS public.fn_notificar_despacho_pedido();
DROP FUNCTION IF EXISTS public.fn_t114_exigir_aviso_listo();
DROP FUNCTION IF EXISTS public.fn_t114_validar_aviso();
DROP FUNCTION IF EXISTS public.fn_t114_terminar_preparacion(BIGINT,BIGINT);
DROP FUNCTION IF EXISTS public.fn_t114_confirmar_listo(BIGINT,BIGINT);
DROP FUNCTION IF EXISTS public.fn_t114_entregar_pedido(BIGINT,BIGINT,TEXT);

-- Los grupos NOLOGIN opcionales de T11.4 se conservan; revisar sus membresías
-- por separado. Nunca hacer DROP TABLE aquí: contiene hechos históricos.
COMMIT;
