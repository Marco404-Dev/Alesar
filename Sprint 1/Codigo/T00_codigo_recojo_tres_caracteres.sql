-- AlInstant / Sprint 1 / T00
-- Destino exclusivo: Neon allinstant-dev, rama development, base neondb.
-- Migración aditiva compatible: códigos nuevos de tres caracteres y legado entregable.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

-- La restricción histórica impide reutilizar códigos entregados. Se reemplaza
-- por unicidad parcial, por sede y sin distinción de mayúsculas/minúsculas.
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_codigo_recojo_key;
CREATE UNIQUE INDEX IF NOT EXISTS pedidos_codigo_recojo_activo_sede_uq
  ON public.pedidos (sede_id, upper(codigo_recojo))
  WHERE estado_id IN (1, 2, 3);

CREATE OR REPLACE FUNCTION public.fn_t114_entregar_pedido(p_sede bigint, p_pedido bigint, p_codigo text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'pg_temp'
AS $function$
DECLARE v_estado SMALLINT; v_codigo TEXT; v_filas INTEGER;
BEGIN
  SELECT estado_id,codigo_recojo INTO v_estado,v_codigo FROM public.pedidos
  WHERE pedido_id=p_pedido AND sede_id=p_sede AND pago_confirmado IS TRUE FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not-found'; END IF;
  IF v_estado <> 3 THEN RETURN 'invalid-state'; END IF;
  IF upper(btrim(COALESCE(p_codigo, ''))) IS DISTINCT FROM upper(btrim(v_codigo)) THEN RETURN 'invalid-code'; END IF;
  PERFORM pg_catalog.set_config('allinstant.origen_cambio','DESPACHO',true);
  UPDATE public.pedidos SET estado_id=4 WHERE pedido_id=p_pedido AND sede_id=p_sede AND estado_id=3;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  IF v_filas <> 1 THEN RAISE EXCEPTION 'La entrega no actualizó exactamente un pedido'; END IF;
  RETURN 'ok';
END $function$;
COMMIT;
