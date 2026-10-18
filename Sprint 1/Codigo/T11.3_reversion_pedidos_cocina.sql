-- Reversión estructural T11.3 para Neon development. NO EJECUTAR SIN REVISIÓN.
-- No borra pedidos, detalles ni historial. Antes de aplicarla, detener nuevas
-- altas con estado PREPARANDO y el monitor SSE. No revierte datos ya creados.
-- Requiere que los triggers/funciones de notificación sean los de T11.3;
-- comprobar dependencias y cambios posteriores antes de ejecutar.
BEGIN;

DROP TRIGGER IF EXISTS trg_notificar_monitor_producto ON productos;
DROP TRIGGER IF EXISTS trg_notificar_monitor_detalle ON detalle_pedido;
DROP TRIGGER IF EXISTS trg_notificar_monitor_pedido ON pedidos;
DROP FUNCTION IF EXISTS fn_notificar_monitor_producto();
DROP FUNCTION IF EXISTS fn_notificar_monitor_detalle();
DROP FUNCTION IF EXISTS fn_notificar_monitor_pedido();

ALTER TABLE pedidos ALTER COLUMN estado_id SET DEFAULT 1;

-- Restauración exacta de la función de control del script T11.2 original.
-- No reemplaza el trigger de historial: permanece operativo y conserva
-- PREPARANDO como primer estado de los pedidos ya registrados con T11.3.
CREATE OR REPLACE FUNCTION fn_controlar_estado_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  origen_actual TEXT := COALESCE(NULLIF(current_setting('allinstant.origen_cambio',true),''),'SISTEMA');
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado_id <> 1 THEN
      RAISE EXCEPTION 'Todo pedido confirmado inicia en RECIBIDO';
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
      RAISE EXCEPTION 'Transición u origen no permitido: % -> % (%)',OLD.estado_id,NEW.estado_id,origen_actual;
    END IF;
    NEW.actualizado_en := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END $$;

COMMIT;
