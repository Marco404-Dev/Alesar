-- AlInstant T11.2: pruebas de desarrollo; todos los datos se revierten.
-- Requiere haber ejecutado 01_esquema_postgresql.sql.
BEGIN;
INSERT INTO productos(nombre) VALUES ('Menú de prueba'),('Bebida de prueba');
INSERT INTO pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente)
VALUES ('TEST-SMP-001',(SELECT sede_id FROM sedes WHERE codigo='SMP'),'12345678','Cliente SMP','999888777'),
       ('TEST-LM-001',(SELECT sede_id FROM sedes WHERE codigo='LM'),'87654321','Cliente LM','988777666');
INSERT INTO detalle_pedido(pedido_id,producto_id,cantidad,precio_unitario)
SELECT p.pedido_id,pr.producto_id,2,12.50 FROM pedidos p CROSS JOIN productos pr
WHERE p.codigo_recojo='TEST-SMP-001' AND pr.nombre='Menú de prueba';

DO $$ BEGIN
 IF (SELECT count(*) FROM vista_pedidos_cocina WHERE sede_id=(SELECT sede_id FROM sedes WHERE codigo='SMP') AND codigo_recojo LIKE 'TEST-%') <> 1 THEN
  RAISE EXCEPTION 'Fallo en filtro de sede cocina';
 END IF;
 IF (SELECT count(*) FROM historial_estados_pedido h JOIN pedidos p USING(pedido_id) WHERE p.codigo_recojo='TEST-SMP-001') <> 1 THEN
  RAISE EXCEPTION 'Fallo en historial inicial';
 END IF;
 IF (SELECT total_unidades FROM vista_pedidos_cocina WHERE codigo_recojo='TEST-SMP-001') <> 2 THEN
  RAISE EXCEPTION 'Fallo total de unidades';
 END IF;
END $$;

SET LOCAL allinstant.origen_cambio = 'COCINA';
UPDATE pedidos SET estado_id=2 WHERE codigo_recojo='TEST-SMP-001';
SET LOCAL allinstant.origen_cambio = 'DESPACHO';
UPDATE pedidos SET estado_id=3 WHERE codigo_recojo='TEST-SMP-001';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM vista_pedidos_cocina WHERE codigo_recojo='TEST-SMP-001') THEN
  RAISE EXCEPTION 'El pedido listo no debe aparecer en cocina';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM vista_pedidos_despacho WHERE codigo_recojo='TEST-SMP-001') THEN
  RAISE EXCEPTION 'El pedido listo debe aparecer en despacho';
 END IF;
END $$;
UPDATE pedidos SET estado_id=4 WHERE codigo_recojo='TEST-SMP-001';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM vista_pedidos_despacho WHERE codigo_recojo='TEST-SMP-001') THEN
  RAISE EXCEPTION 'El pedido entregado no debe aparecer en despacho';
 END IF;
 IF (SELECT COUNT(*) FROM historial_estados_pedido h JOIN pedidos p USING(pedido_id) WHERE p.codigo_recojo='TEST-SMP-001') <> 4 THEN
  RAISE EXCEPTION 'Deben registrarse los cuatro estados en el historial';
 END IF;
END $$;

-- Intentos inválidos controlados, deben producir excepción y no alterar datos.
DO $$ BEGIN
 BEGIN
  UPDATE pedidos SET estado_id=1 WHERE codigo_recojo='TEST-SMP-001';
  RAISE EXCEPTION 'Error: se permitió retroceder de ENTREGADO';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM = 'Error: se permitió retroceder de ENTREGADO' THEN RAISE; END IF;
 END;
 BEGIN
  INSERT INTO pedidos(codigo_recojo,sede_id,dni_cliente,nombre_cliente,whatsapp_cliente,pago_confirmado)
  VALUES ('TEST-NOPAGO-001',(SELECT sede_id FROM sedes WHERE codigo='SMP'),'12345678','Sin pago','999888777',FALSE);
  RAISE EXCEPTION 'Error: se permitió pago no confirmado';
 EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

SELECT 'PRUEBAS COMPLETADAS (transacción revertida)' AS resultado;
ROLLBACK;
