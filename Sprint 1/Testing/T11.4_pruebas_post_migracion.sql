-- Prueba sintética transaccional: ejecutada en Neon development el 18-10-2026.
-- Ejecutar completa en una sola sesión y solo en un entorno de desarrollo autorizado.
-- ROLLBACK revierte filas, pero las secuencias IDENTITY consumidas NO retroceden.
-- NO demuestra NOTIFY tras COMMIT ni concurrencia entre sesiones.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public, pg_temp;

DO $test$
DECLARE
  v_smp BIGINT;
  v_lm BIGINT;
  v_pedido BIGINT;
  v_sin_aviso BIGINT;
  v_otro_sede BIGINT;
  v_codigo TEXT := 'T114' || substr(md5(txid_current()::TEXT || random()::TEXT || 'a'),1,16);
  v_codigo_sin TEXT := 'T114' || substr(md5(txid_current()::TEXT || random()::TEXT || 'b'),1,16);
  v_codigo_lm TEXT := 'T114' || substr(md5(txid_current()::TEXT || random()::TEXT || 'c'),1,16);
BEGIN
  SELECT sede_id INTO STRICT v_smp FROM public.sedes WHERE codigo='SMP';
  SELECT sede_id INTO STRICT v_lm FROM public.sedes WHERE codigo='LM';
  IF (SELECT count(*) FROM pg_catalog.pg_constraint
      WHERE conrelid='public.avisos_preparacion'::regclass AND contype='f') <> 1 THEN
    RAISE EXCEPTION 'Falta FK de avisos a pedidos';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_trigger
      WHERE NOT tgisinternal AND tgrelid IN
      ('public.pedidos'::regclass,'public.avisos_preparacion'::regclass) AND tgname IN
      ('trg_t114_validar_aviso','trg_t114_exigir_aviso_listo',
       'trg_notificar_despacho_aviso','trg_notificar_despacho_pedido')) <> 4 THEN
    RAISE EXCEPTION 'Faltan triggers T11.4';
  END IF;

  INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
  VALUES(v_codigo,v_smp,'12345678','Prueba T11.4 SMP','900000000')
  RETURNING pedido_id INTO v_pedido;
  INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
  VALUES(v_codigo_sin,v_smp,'12345678','Prueba sin aviso','900000000')
  RETURNING pedido_id INTO v_sin_aviso;
  INSERT INTO public.pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
  VALUES(v_codigo_lm,v_lm,'87654321','Prueba T11.4 LM','900000001')
  RETURNING pedido_id INTO v_otro_sede;

  IF (SELECT count(*) FROM public.historial_estados_pedido
      WHERE pedido_id=v_pedido AND estado_anterior_id IS NULL
      AND estado_nuevo_id=2 AND origen='SISTEMA') <> 1 THEN
    RAISE EXCEPTION 'Historial inicial PREPARANDO incorrecto';
  END IF;

  -- T11.3 acepta el origen DESPACHO; el trigger T11.4 debe bloquear SIN aviso.
  PERFORM set_config('allinstant.origen_cambio','DESPACHO',true);
  BEGIN
    UPDATE public.pedidos SET estado_id=3 WHERE pedido_id=v_sin_aviso;
    RAISE EXCEPTION 'Se permitió LISTO_RECOJO sin aviso';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF (SELECT estado_id FROM public.pedidos WHERE pedido_id=v_sin_aviso) <> 2 OR
     (SELECT count(*) FROM public.historial_estados_pedido WHERE pedido_id=v_sin_aviso) <> 1 THEN
    RAISE EXCEPTION 'Intento sin aviso alteró estado o historial';
  END IF;
  IF public.fn_t114_confirmar_listo(v_smp,v_sin_aviso) <> 'no-notice' THEN
    RAISE EXCEPTION 'Función aceptó confirmación sin aviso';
  END IF;
  IF public.fn_t114_entregar_pedido(v_smp,v_sin_aviso,v_codigo_sin) <> 'invalid-state' THEN
    RAISE EXCEPTION 'Función aceptó entrega en estado incorrecto';
  END IF;

  -- Un pedido inexistente no puede generar aviso; FK presente y trigger válido.
  BEGIN
    INSERT INTO public.avisos_preparacion(pedido_id) VALUES(-1);
    RAISE EXCEPTION 'Se permitió aviso huérfano';
  EXCEPTION WHEN foreign_key_violation OR check_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM public.avisos_preparacion WHERE pedido_id=-1) THEN
    RAISE EXCEPTION 'Persistió un aviso huérfano';
  END IF;
  BEGIN
    INSERT INTO public.avisos_preparacion(pedido_id,confirmado_en)
    VALUES(v_sin_aviso,clock_timestamp());
    RAISE EXCEPTION 'Se permitió crear aviso ya confirmado';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- La función filtra por sede antes de bloquear y escribir.
  IF public.fn_t114_terminar_preparacion(v_lm,v_pedido) <> 'not-found' OR
     public.fn_t114_confirmar_listo(v_lm,v_pedido) <> 'not-found' OR
     public.fn_t114_entregar_pedido(v_smp,v_otro_sede,v_codigo_lm) <> 'not-found' THEN
    RAISE EXCEPTION 'Fallo de separación por sede';
  END IF;
  IF public.fn_t114_terminar_preparacion(v_smp,v_pedido) <> 'ok' THEN
    RAISE EXCEPTION 'Aviso inicial incorrecto';
  END IF;
  IF public.fn_t114_terminar_preparacion(v_smp,v_pedido) <> 'duplicate' THEN
    RAISE EXCEPTION 'Aviso inicial o idempotencia incorrectos';
  END IF;
  BEGIN
    INSERT INTO public.avisos_preparacion(pedido_id) VALUES(v_pedido);
    RAISE EXCEPTION 'Se permitió aviso duplicado';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  IF (SELECT count(*) FROM public.avisos_preparacion WHERE pedido_id=v_pedido) <> 1 OR
     (SELECT estado_id FROM public.pedidos WHERE pedido_id=v_pedido) <> 2 OR
     (SELECT count(*) FROM public.historial_estados_pedido WHERE pedido_id=v_pedido) <> 1 THEN
    RAISE EXCEPTION 'Aviso alteró pedido o historial';
  END IF;
  BEGIN
    UPDATE public.avisos_preparacion SET terminado_en=terminado_en + interval '1 second'
    WHERE pedido_id=v_pedido;
    RAISE EXCEPTION 'Se permitió reescribir la fecha de preparación';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF (SELECT count(*) FROM public.avisos_preparacion WHERE pedido_id=v_pedido) <> 1 OR
     (SELECT confirmado_en FROM public.avisos_preparacion WHERE pedido_id=v_pedido) IS NOT NULL THEN
    RAISE EXCEPTION 'El intento de reescritura alteró el aviso';
  END IF;

  IF public.fn_t114_confirmar_listo(v_smp,v_pedido) <> 'ok' THEN
    RAISE EXCEPTION 'Confirmación de listo fallida';
  END IF;
  IF public.fn_t114_confirmar_listo(v_smp,v_pedido) <> 'invalid-state' THEN
    RAISE EXCEPTION 'Confirmación de listo duplicada o fallida';
  END IF;
  IF (SELECT estado_id FROM public.pedidos WHERE pedido_id=v_pedido) <> 3 OR
     (SELECT confirmado_en FROM public.avisos_preparacion WHERE pedido_id=v_pedido) IS NULL OR
     (SELECT count(*) FROM public.historial_estados_pedido WHERE pedido_id=v_pedido) <> 2 OR
     NOT EXISTS (SELECT 1 FROM public.historial_estados_pedido WHERE pedido_id=v_pedido
                 AND estado_anterior_id=2 AND estado_nuevo_id=3 AND origen='DESPACHO') THEN
    RAISE EXCEPTION 'Listo, confirmación o historial incorrectos';
  END IF;
  BEGIN
    UPDATE public.avisos_preparacion SET confirmado_en=clock_timestamp()
    WHERE pedido_id=v_pedido;
    RAISE EXCEPTION 'Se permitió confirmar un aviso dos veces';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF EXISTS (SELECT 1 FROM public.vista_pedidos_cocina WHERE pedido_id=v_pedido) OR
     NOT EXISTS (SELECT 1 FROM public.vista_pedidos_despacho WHERE pedido_id=v_pedido) THEN
    RAISE EXCEPTION 'Retiro de cocina o permanencia en despacho incorrectos';
  END IF;
  IF public.fn_t114_entregar_pedido(v_smp,v_pedido,'codigo-incorrecto') <> 'invalid-code' OR
     (SELECT estado_id FROM public.pedidos WHERE pedido_id=v_pedido) <> 3 THEN
    RAISE EXCEPTION 'Código incorrecto alteró estado';
  END IF;
  IF public.fn_t114_entregar_pedido(v_smp,v_pedido,v_codigo) <> 'ok' THEN
    RAISE EXCEPTION 'Entrega fallida';
  END IF;
  IF public.fn_t114_entregar_pedido(v_smp,v_pedido,v_codigo) <> 'invalid-state' THEN
    RAISE EXCEPTION 'Entrega duplicada o fallida';
  END IF;
  IF (SELECT count(*) FROM public.historial_estados_pedido WHERE pedido_id=v_pedido) <> 3 OR
     NOT EXISTS (SELECT 1 FROM public.historial_estados_pedido WHERE pedido_id=v_pedido
                 AND estado_anterior_id=3 AND estado_nuevo_id=4 AND origen='DESPACHO') OR
     EXISTS (SELECT 1 FROM public.vista_pedidos_despacho WHERE pedido_id=v_pedido) THEN
    RAISE EXCEPTION 'Historial o retiro de entregado incorrectos';
  END IF;
  BEGIN
    INSERT INTO public.avisos_preparacion(pedido_id) VALUES(v_pedido);
    RAISE EXCEPTION 'Se permitió aviso en ENTREGADO';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $test$;

SELECT 'T11.4: comprobaciones completadas; transacción revertida' AS resultado;
ROLLBACK;
