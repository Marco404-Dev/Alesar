-- Ejecutar SOLO después de aplicar T11.3 en Neon development.
-- Transacción íntegra de prueba: los datos ficticios se revierten.
-- NOTIFY dentro de ROLLBACK no se entrega a oyentes: la entrega en vivo
-- requiere una prueba de integración aparte con COMMIT y limpieza controlada.
BEGIN;

DO $$
DECLARE
  v_smp BIGINT;
  v_lm BIGINT;
  v_producto BIGINT;
  v_smp_pedido BIGINT;
  v_lm_pedido BIGINT;
  v_detalle BIGINT;
  v_codigo_smp TEXT := 'T113S' || txid_current()::TEXT;
  v_codigo_lm TEXT := 'T113L' || txid_current()::TEXT;
BEGIN
  SELECT sede_id INTO STRICT v_smp FROM sedes WHERE codigo = 'SMP';
  SELECT sede_id INTO STRICT v_lm FROM sedes WHERE codigo = 'LM';
  IF (SELECT estado_id FROM estados_pedido WHERE codigo = 'PREPARANDO') <> 2 THEN
    RAISE EXCEPTION 'Falta el estado PREPARANDO=2';
  END IF;
  IF (SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal
      AND tgrelid IN ('pedidos'::regclass,'detalle_pedido'::regclass,'productos'::regclass)
      AND tgname IN
      ('trg_notificar_monitor_pedido','trg_notificar_monitor_detalle',
       'trg_notificar_monitor_producto')) <> 3 THEN
    RAISE EXCEPTION 'Faltan triggers de notificación T11.3';
  END IF;
  IF (SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal
      AND tgrelid = 'pedidos'::regclass AND tgname IN
      ('trg_historial_creacion_pedido','trg_historial_cambio_estado')) <> 2 THEN
    RAISE EXCEPTION 'Faltan triggers históricos T11.2';
  END IF;
  INSERT INTO productos(nombre) VALUES ('Producto T11.3') RETURNING producto_id INTO v_producto;
  INSERT INTO pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
  VALUES (v_codigo_smp,v_smp,'12345678','Prueba SMP','999888777')
  RETURNING pedido_id INTO v_smp_pedido;
  INSERT INTO pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
  VALUES (v_codigo_lm,v_lm,'87654321','Prueba LM','988777666')
  RETURNING pedido_id INTO v_lm_pedido;
  IF (SELECT estado_id FROM pedidos WHERE pedido_id = v_smp_pedido) <> 2 OR
     (SELECT estado_id FROM pedidos WHERE pedido_id = v_lm_pedido) <> 2 THEN
    RAISE EXCEPTION 'El pedido nuevo no inició en PREPARANDO';
  END IF;
  IF (SELECT COUNT(*) FROM historial_estados_pedido WHERE pedido_id = v_smp_pedido
      AND estado_anterior_id IS NULL AND estado_nuevo_id = 2 AND origen = 'SISTEMA') <> 1 THEN
    RAISE EXCEPTION 'Falta historial inicial PREPARANDO';
  END IF;
  INSERT INTO detalle_pedido(pedido_id,producto_id,cantidad,precio_unitario)
  VALUES (v_smp_pedido,v_producto,2,12.50) RETURNING detalle_id INTO v_detalle;
  INSERT INTO detalle_pedido(pedido_id,producto_id,cantidad,precio_unitario)
  VALUES (v_lm_pedido,v_producto,1,12.50);
  IF (SELECT COUNT(*) FROM pedidos p JOIN detalle_pedido d USING(pedido_id)
      WHERE p.sede_id = v_smp AND p.estado_id IN (1,2)
      AND p.pago_confirmado = TRUE AND d.producto_id = v_producto) <> 1 THEN
    RAISE EXCEPTION 'Filtro por sede incorrecto';
  END IF;
  IF (SELECT total_unidades FROM vista_pedidos_cocina WHERE pedido_id = v_smp_pedido) <> 2 THEN
    RAISE EXCEPTION 'Vista de cocina incorrecta';
  END IF;
  UPDATE detalle_pedido SET cantidad = 3 WHERE detalle_id = v_detalle;
  IF (SELECT cantidad FROM detalle_pedido WHERE detalle_id = v_detalle) <> 3 THEN
    RAISE EXCEPTION 'No se actualizó el detalle';
  END IF;
  UPDATE productos SET nombre = 'Producto T11.3 editado' WHERE producto_id = v_producto;
  IF (SELECT pr.nombre FROM detalle_pedido d JOIN productos pr USING(producto_id)
      WHERE d.detalle_id = v_detalle) <> 'Producto T11.3 editado' THEN
    RAISE EXCEPTION 'No se refleja el nombre del producto';
  END IF;
  BEGIN
    UPDATE pedidos SET estado_id = 4 WHERE pedido_id = v_lm_pedido;
    RAISE EXCEPTION 'Se permitió saltar de PREPARANDO a ENTREGADO';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = 'Se permitió saltar de PREPARANDO a ENTREGADO' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Transición u origen no permitido:%' THEN RAISE; END IF;
  END;
  PERFORM set_config('allinstant.origen_cambio','DESPACHO',true);
  UPDATE pedidos SET estado_id = 3 WHERE pedido_id = v_smp_pedido;
  IF EXISTS (SELECT 1 FROM vista_pedidos_cocina WHERE pedido_id = v_smp_pedido) OR
     NOT EXISTS (SELECT 1 FROM vista_pedidos_despacho WHERE pedido_id = v_smp_pedido) THEN
    RAISE EXCEPTION 'El pedido listo debe salir de cocina y seguir en despacho';
  END IF;
  UPDATE pedidos SET estado_id = 4 WHERE pedido_id = v_smp_pedido;
  IF EXISTS (SELECT 1 FROM vista_pedidos_despacho WHERE pedido_id = v_smp_pedido) THEN
    RAISE EXCEPTION 'El pedido entregado debe salir de despacho';
  END IF;
  IF (SELECT COUNT(*) FROM historial_estados_pedido WHERE pedido_id = v_smp_pedido) <> 3 THEN
    RAISE EXCEPTION 'Historial 2 -> 3 -> 4 incompleto';
  END IF;
  DELETE FROM detalle_pedido WHERE pedido_id = v_lm_pedido;
  IF EXISTS (SELECT 1 FROM detalle_pedido WHERE pedido_id = v_lm_pedido) THEN
    RAISE EXCEPTION 'No se eliminó el detalle de prueba';
  END IF;
  BEGIN
    INSERT INTO pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente,pago_confirmado)
    VALUES ('T113N' || txid_current()::TEXT,v_smp,'12345678','Sin pago','999888777',FALSE);
    RAISE EXCEPTION 'Se permitió un pago no confirmado';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $$;

SELECT 'T11.3: comprobaciones completadas; transacción revertida' AS resultado;
ROLLBACK;
