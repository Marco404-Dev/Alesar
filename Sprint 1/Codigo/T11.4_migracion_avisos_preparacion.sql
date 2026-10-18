-- T11.4 / PostgreSQL 14+. Aplicada en Neon development el 18-10-2026.
-- No reejecutar en una base donde T11.4 ya exista; el preflight se detendrá.
-- Requiere T11.2 y T11.3. No migra ni elimina pedidos o historial existentes.
-- Ejecutar con un rol administrador de migraciones, nunca con un rol operativo.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public, pg_temp;

DO $preflight$
DECLARE v_default TEXT;
BEGIN
  IF to_regclass('public.pedidos') IS NULL OR
     to_regclass('public.sedes') IS NULL OR
     to_regclass('public.estados_pedido') IS NULL OR
     to_regclass('public.historial_estados_pedido') IS NULL THEN
    RAISE EXCEPTION 'Faltan tablas T11.2 en public';
  END IF;
  IF to_regclass('public.avisos_preparacion') IS NOT NULL OR
     to_regprocedure('public.fn_t114_validar_aviso()') IS NOT NULL OR
     to_regprocedure('public.fn_t114_exigir_aviso_listo()') IS NOT NULL OR
     to_regprocedure('public.fn_t114_terminar_preparacion(bigint,bigint)') IS NOT NULL OR
     to_regprocedure('public.fn_t114_confirmar_listo(bigint,bigint)') IS NOT NULL OR
     to_regprocedure('public.fn_t114_entregar_pedido(bigint,bigint,text)') IS NOT NULL OR
     to_regprocedure('public.fn_notificar_despacho_pedido()') IS NOT NULL OR
     to_regprocedure('public.fn_notificar_despacho_aviso()') IS NOT NULL THEN
    RAISE EXCEPTION 'T11.4 ya existe total o parcialmente; revisar antes de reintentar';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_namespace n
    CROSS JOIN LATERAL pg_catalog.aclexplode(
      COALESCE(n.nspacl,pg_catalog.acldefault('n',n.nspowner))) a
    WHERE n.nspname='public' AND a.grantee=0 AND a.privilege_type='CREATE'
  ) THEN
    RAISE EXCEPTION 'El esquema public concede CREATE a PUBLIC; revisar privilegios antes de instalar funciones privilegiadas';
  END IF;
  IF (SELECT count(*) FROM public.estados_pedido
      WHERE (estado_id,codigo) IN ((1,'RECIBIDO'),(2,'PREPARANDO'),(3,'LISTO_RECOJO'),(4,'ENTREGADO'))) <> 4 THEN
    RAISE EXCEPTION 'Catálogo de estados incompatible con T11.2/T11.3';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_trigger
      WHERE NOT tgisinternal AND tgrelid = 'public.pedidos'::regclass
      AND tgname IN ('trg_controlar_estado_pedido','trg_historial_creacion_pedido',
                     'trg_historial_cambio_estado','trg_notificar_monitor_pedido')) <> 4 THEN
    RAISE EXCEPTION 'Faltan triggers T11.2/T11.3 de pedidos';
  END IF;
  SELECT pg_get_expr(d.adbin,d.adrelid) INTO v_default
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
  WHERE a.attrelid='public.pedidos'::regclass AND a.attname='estado_id';
  IF v_default IS NULL OR v_default NOT IN ('2','2::smallint') THEN
    RAISE EXCEPTION 'T11.3 no estableció DEFAULT 2 en pedidos.estado_id: %',v_default;
  END IF;
END $preflight$;

CREATE TABLE public.avisos_preparacion (
  aviso_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id BIGINT NOT NULL UNIQUE REFERENCES public.pedidos(pedido_id) ON DELETE RESTRICT,
  terminado_en TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  confirmado_en TIMESTAMPTZ,
  CONSTRAINT aviso_confirmacion_posterior CHECK (confirmado_en IS NULL OR confirmado_en >= terminado_en)
);
CREATE INDEX idx_avisos_preparacion_pendientes
  ON public.avisos_preparacion(pedido_id) WHERE confirmado_en IS NULL;
REVOKE ALL ON public.avisos_preparacion FROM PUBLIC;

-- Un aviso solo nace pendiente durante PREPARANDO y solo se confirma allí.
-- Bloquear el pedido aquí evita carreras con cambios de estado externos.
CREATE FUNCTION public.fn_t114_validar_aviso()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE v_estado SMALLINT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.confirmado_en IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='El aviso debe nacer pendiente';
  END IF;
  IF TG_OP = 'UPDATE' AND
     (NEW.pedido_id IS DISTINCT FROM OLD.pedido_id OR
      NEW.terminado_en IS DISTINCT FROM OLD.terminado_en OR
      OLD.confirmado_en IS NOT NULL) THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='No se permite reescribir un aviso';
  END IF;
  SELECT estado_id INTO v_estado FROM public.pedidos
  WHERE pedido_id=NEW.pedido_id FOR UPDATE;
  IF v_estado IS DISTINCT FROM 2 THEN
    RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Aviso fuera de PREPARANDO';
  END IF;
  RETURN NEW;
END $fn$;
CREATE TRIGGER trg_t114_validar_aviso
BEFORE INSERT OR UPDATE ON public.avisos_preparacion
FOR EACH ROW EXECUTE FUNCTION public.fn_t114_validar_aviso();

-- Defensa en la base: incluso un UPDATE SQL directo no puede omitir el aviso.
-- T11.3 conserva su función de control; T11.2 conserva su trigger de historial.
CREATE FUNCTION public.fn_t114_exigir_aviso_listo()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $fn$
BEGIN
  IF OLD.estado_id = 2 AND NEW.estado_id = 3 AND NOT EXISTS (
    SELECT 1 FROM public.avisos_preparacion a
    WHERE a.pedido_id = OLD.pedido_id AND a.confirmado_en IS NOT NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Falta aviso de preparación confirmado';
  END IF;
  RETURN NEW;
END $fn$;
CREATE TRIGGER trg_t114_exigir_aviso_listo
BEFORE UPDATE OF estado_id ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.fn_t114_exigir_aviso_listo();

-- Operaciones atómicas de invocación única. El rol operativo solo recibe EXECUTE.
-- FOR UPDATE serializa acciones simultáneas sobre el mismo pedido.
CREATE FUNCTION public.fn_t114_terminar_preparacion(p_sede BIGINT,p_pedido BIGINT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE v_estado SMALLINT; v_filas INTEGER;
BEGIN
  SELECT estado_id INTO v_estado FROM public.pedidos
  WHERE pedido_id=p_pedido AND sede_id=p_sede AND pago_confirmado IS TRUE FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not-found'; END IF;
  IF v_estado <> 2 THEN RETURN 'invalid-state'; END IF;
  INSERT INTO public.avisos_preparacion(pedido_id) VALUES(p_pedido)
  ON CONFLICT (pedido_id) DO NOTHING;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  IF v_filas = 0 THEN RETURN 'duplicate'; END IF;
  RETURN 'ok';
END $fn$;

CREATE FUNCTION public.fn_t114_confirmar_listo(p_sede BIGINT,p_pedido BIGINT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE v_estado SMALLINT; v_filas INTEGER;
BEGIN
  SELECT estado_id INTO v_estado FROM public.pedidos
  WHERE pedido_id=p_pedido AND sede_id=p_sede AND pago_confirmado IS TRUE FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not-found'; END IF;
  IF v_estado <> 2 THEN RETURN 'invalid-state'; END IF;
  UPDATE public.avisos_preparacion SET confirmado_en=pg_catalog.clock_timestamp()
  WHERE pedido_id=p_pedido AND confirmado_en IS NULL;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  IF v_filas = 0 THEN RETURN 'no-notice'; END IF;
  PERFORM pg_catalog.set_config('allinstant.origen_cambio','DESPACHO',true);
  UPDATE public.pedidos SET estado_id=3 WHERE pedido_id=p_pedido AND sede_id=p_sede AND estado_id=2;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  IF v_filas <> 1 THEN
    RAISE EXCEPTION 'La confirmación no actualizó exactamente un pedido';
  END IF;
  RETURN 'ok';
END $fn$;

CREATE FUNCTION public.fn_t114_entregar_pedido(p_sede BIGINT,p_pedido BIGINT,p_codigo TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE v_estado SMALLINT; v_codigo TEXT; v_filas INTEGER;
BEGIN
  SELECT estado_id,codigo_recojo INTO v_estado,v_codigo FROM public.pedidos
  WHERE pedido_id=p_pedido AND sede_id=p_sede AND pago_confirmado IS TRUE FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not-found'; END IF;
  IF v_estado <> 3 THEN RETURN 'invalid-state'; END IF;
  IF p_codigo IS DISTINCT FROM v_codigo THEN RETURN 'invalid-code'; END IF;
  PERFORM pg_catalog.set_config('allinstant.origen_cambio','DESPACHO',true);
  UPDATE public.pedidos SET estado_id=4 WHERE pedido_id=p_pedido AND sede_id=p_sede AND estado_id=3;
  GET DIAGNOSTICS v_filas = ROW_COUNT;
  IF v_filas <> 1 THEN
    RAISE EXCEPTION 'La entrega no actualizó exactamente un pedido';
  END IF;
  RETURN 'ok';
END $fn$;

-- Payload de NOTIFY: solo sede_id, sin datos personales ni código de recojo.
CREATE FUNCTION public.fn_notificar_despacho_pedido()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $fn$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.estado_id IS DISTINCT FROM OLD.estado_id THEN
    PERFORM pg_catalog.pg_notify('allinstant_despacho',NEW.sede_id::TEXT);
  END IF;
  RETURN NULL;
END $fn$;
CREATE TRIGGER trg_notificar_despacho_pedido
AFTER INSERT OR UPDATE OF estado_id ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.fn_notificar_despacho_pedido();

CREATE FUNCTION public.fn_notificar_despacho_aviso()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE v_sede BIGINT;
BEGIN
  SELECT sede_id INTO v_sede FROM public.pedidos WHERE pedido_id=NEW.pedido_id;
  PERFORM pg_catalog.pg_notify('allinstant_despacho',v_sede::TEXT);
  RETURN NULL;
END $fn$;
CREATE TRIGGER trg_notificar_despacho_aviso
AFTER INSERT OR UPDATE OF confirmado_en ON public.avisos_preparacion
FOR EACH ROW EXECUTE FUNCTION public.fn_notificar_despacho_aviso();

-- Sin privilegios públicos para invocar funciones. Los GRANT operativos son
-- una fase separada: T11.4_privilegios_operativos.sql, también autorizada.
REVOKE ALL ON FUNCTION public.fn_t114_terminar_preparacion(BIGINT,BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_t114_confirmar_listo(BIGINT,BIGINT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_t114_entregar_pedido(BIGINT,BIGINT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_t114_exigir_aviso_listo() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_t114_validar_aviso() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_notificar_despacho_pedido() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_notificar_despacho_aviso() FROM PUBLIC;

COMMIT;
