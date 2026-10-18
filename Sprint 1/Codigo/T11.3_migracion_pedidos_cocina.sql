-- T11.3: migración preparada para Neon development. NO EJECUTAR SIN REVISIÓN.
-- Requiere el esquema T11.2 original. No altera pedidos ni historial existentes.
-- El backend de pagos debe crear cabecera y detalles en UNA transacción tras
-- confirmar el pago. NOTIFY se entrega solo al confirmar dicha transacción.
BEGIN;

ALTER TABLE pedidos ALTER COLUMN estado_id SET DEFAULT 2;

-- Conserva las transiciones del esquema original para pedidos RECIBIDO antiguos.
-- El trigger trg_historial_creacion_pedido original registra automáticamente 2.
CREATE OR REPLACE FUNCTION fn_controlar_estado_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  origen_actual TEXT := COALESCE(NULLIF(current_setting('allinstant.origen_cambio', true), ''), 'SISTEMA');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado_id <> 2 THEN
      RAISE EXCEPTION 'Todo pedido confirmado nuevo inicia en PREPARANDO';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.sede_id IS DISTINCT FROM OLD.sede_id OR
     NEW.codigo_recojo IS DISTINCT FROM OLD.codigo_recojo OR
     NEW.confirmado_en IS DISTINCT FROM OLD.confirmado_en THEN
    RAISE EXCEPTION 'No se permite modificar sede, código o fecha de confirmación del pedido';
  END IF;
  IF NEW.estado_id IS DISTINCT FROM OLD.estado_id THEN
    IF NOT ((OLD.estado_id = 1 AND NEW.estado_id = 2 AND origen_actual = 'COCINA') OR
            (OLD.estado_id = 2 AND NEW.estado_id = 3 AND origen_actual = 'DESPACHO') OR
            (OLD.estado_id = 3 AND NEW.estado_id = 4 AND origen_actual = 'DESPACHO')) THEN
      RAISE EXCEPTION 'Transición u origen no permitido: % -> % (%)', OLD.estado_id, NEW.estado_id, origen_actual;
    END IF;
    NEW.actualizado_en := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END $$;

-- Solo la sede numérica viaja por NOTIFY; nunca datos del pedido o cliente.
-- El receptor vuelve a consultar una foto completa filtrada por sede.
CREATE OR REPLACE FUNCTION fn_notificar_monitor_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado_id IN (1, 2) THEN
      PERFORM pg_notify('allinstant_cocina', NEW.sede_id::TEXT);
    END IF;
  ELSIF NEW.estado_id IS DISTINCT FROM OLD.estado_id
        AND (OLD.estado_id IN (1, 2) OR NEW.estado_id IN (1, 2)) THEN
    PERFORM pg_notify('allinstant_cocina', NEW.sede_id::TEXT);
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_notificar_monitor_pedido
AFTER INSERT OR UPDATE OF estado_id ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_notificar_monitor_pedido();

CREATE OR REPLACE FUNCTION fn_notificar_monitor_detalle()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  sede_anterior BIGINT;
  sede_nueva BIGINT;
BEGIN
  IF TG_OP = 'UPDATE' AND
     OLD.pedido_id IS NOT DISTINCT FROM NEW.pedido_id AND
     OLD.producto_id IS NOT DISTINCT FROM NEW.producto_id AND
     OLD.cantidad IS NOT DISTINCT FROM NEW.cantidad THEN
    RETURN NULL;
  END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT p.sede_id INTO sede_anterior FROM pedidos p
    WHERE p.pedido_id = OLD.pedido_id AND p.estado_id IN (1, 2);
    IF sede_anterior IS NOT NULL THEN
      PERFORM pg_notify('allinstant_cocina', sede_anterior::TEXT);
    END IF;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT p.sede_id INTO sede_nueva FROM pedidos p
    WHERE p.pedido_id = NEW.pedido_id AND p.estado_id IN (1, 2);
    IF sede_nueva IS NOT NULL AND sede_nueva IS DISTINCT FROM sede_anterior THEN
      PERFORM pg_notify('allinstant_cocina', sede_nueva::TEXT);
    END IF;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_notificar_monitor_detalle
AFTER INSERT OR DELETE OR UPDATE OF pedido_id, producto_id, cantidad ON detalle_pedido
FOR EACH ROW EXECUTE FUNCTION fn_notificar_monitor_detalle();

CREATE OR REPLACE FUNCTION fn_notificar_monitor_producto()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  sede_afectada BIGINT;
BEGIN
  FOR sede_afectada IN
    SELECT DISTINCT p.sede_id
    FROM detalle_pedido d JOIN pedidos p ON p.pedido_id = d.pedido_id
    WHERE d.producto_id = NEW.producto_id AND p.estado_id IN (1, 2)
  LOOP
    PERFORM pg_notify('allinstant_cocina', sede_afectada::TEXT);
  END LOOP;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_notificar_monitor_producto
AFTER UPDATE OF nombre ON productos
FOR EACH ROW WHEN (OLD.nombre IS DISTINCT FROM NEW.nombre)
EXECUTE FUNCTION fn_notificar_monitor_producto();

COMMIT;
