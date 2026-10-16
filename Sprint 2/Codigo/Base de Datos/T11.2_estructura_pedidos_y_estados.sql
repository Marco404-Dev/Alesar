-- AllInstant / T11.2 / PostgreSQL 14+
-- Ejecutar en una base de datos de desarrollo vacía.
BEGIN;

CREATE TABLE sedes (
  sede_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo VARCHAR(12) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT sedes_codigo_no_vacio CHECK (length(btrim(codigo)) > 0)
);

CREATE TABLE productos (
  producto_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  CONSTRAINT productos_nombre_no_vacio CHECK (length(btrim(nombre)) > 0)
);

CREATE TABLE estados_pedido (
  estado_id SMALLINT PRIMARY KEY,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(80) NOT NULL
);

CREATE TABLE pedidos (
  pedido_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo_recojo VARCHAR(20) NOT NULL UNIQUE,
  sede_id BIGINT NOT NULL REFERENCES sedes(sede_id),
  dni_cliente VARCHAR(8) NOT NULL,
  nombre_cliente VARCHAR(150) NOT NULL,
  whatsapp_cliente VARCHAR(20) NOT NULL,
  estado_id SMALLINT NOT NULL DEFAULT 1 REFERENCES estados_pedido(estado_id),
  pago_confirmado BOOLEAN NOT NULL DEFAULT TRUE CHECK (pago_confirmado = TRUE),
  confirmado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pedidos_dni_formato CHECK (dni_cliente ~ '^[0-9]{8}$'),
  CONSTRAINT pedidos_nombre_no_vacio CHECK (length(btrim(nombre_cliente)) > 0),
  CONSTRAINT pedidos_whatsapp_no_vacio CHECK (length(btrim(whatsapp_cliente)) > 0),
  CONSTRAINT pedidos_codigo_no_vacio CHECK (length(btrim(codigo_recojo)) > 0)
);

CREATE TABLE detalle_pedido (
  detalle_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(pedido_id) ON DELETE RESTRICT,
  producto_id BIGINT NOT NULL REFERENCES productos(producto_id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),
  CONSTRAINT detalle_pedido_producto_unico UNIQUE (pedido_id, producto_id)
);

CREATE TABLE historial_estados_pedido (
  historial_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pedido_id BIGINT NOT NULL REFERENCES pedidos(pedido_id) ON DELETE RESTRICT,
  estado_anterior_id SMALLINT REFERENCES estados_pedido(estado_id),
  estado_nuevo_id SMALLINT NOT NULL REFERENCES estados_pedido(estado_id),
  cambiado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  origen VARCHAR(30) NOT NULL DEFAULT 'SISTEMA',
  CONSTRAINT historial_origen_valido CHECK (origen IN ('SISTEMA','COCINA','DESPACHO')),
  CONSTRAINT historial_estados_distintos CHECK (estado_anterior_id IS NULL OR estado_anterior_id <> estado_nuevo_id)
);

INSERT INTO sedes (codigo,nombre) VALUES
 ('SMP','San Martín de Porres'),('LM','La Molina');
INSERT INTO estados_pedido (estado_id,codigo,descripcion) VALUES
 (1,'RECIBIDO','Pedido recibido'),
 (2,'PREPARANDO','Preparando comida'),
 (3,'LISTO_RECOJO','Comida lista para recojo'),
 (4,'ENTREGADO','Entregado');

-- La capa de aplicación debe fijar el origen en cada cambio de estado:
-- SET LOCAL allinstant.origen_cambio = 'COCINA' o 'DESPACHO'.
-- Sin origen explícito el cambio se marca como SISTEMA (solo para operaciones internas).
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

CREATE TRIGGER trg_controlar_estado_pedido
BEFORE INSERT OR UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_controlar_estado_pedido();

CREATE OR REPLACE FUNCTION fn_registrar_historial_pedido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO historial_estados_pedido(pedido_id,estado_anterior_id,estado_nuevo_id,origen)
    VALUES (NEW.pedido_id,NULL,NEW.estado_id,'SISTEMA');
  ELSIF NEW.estado_id IS DISTINCT FROM OLD.estado_id THEN
    INSERT INTO historial_estados_pedido(pedido_id,estado_anterior_id,estado_nuevo_id,origen)
    VALUES (NEW.pedido_id,OLD.estado_id,NEW.estado_id,
            COALESCE(NULLIF(current_setting('allinstant.origen_cambio',true),''),'SISTEMA'));
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_historial_creacion_pedido
AFTER INSERT ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_registrar_historial_pedido();
CREATE TRIGGER trg_historial_cambio_estado
AFTER UPDATE OF estado_id ON pedidos
FOR EACH ROW EXECUTE FUNCTION fn_registrar_historial_pedido();

CREATE INDEX idx_pedidos_sede_estado_fecha ON pedidos(sede_id,estado_id,confirmado_en,pedido_id);
CREATE INDEX idx_historial_pedido_fecha ON historial_estados_pedido(pedido_id,cambiado_en,historial_id);
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);

CREATE VIEW vista_pedidos_cocina AS
SELECT p.pedido_id,p.codigo_recojo,p.sede_id,p.confirmado_en,p.estado_id,
       e.descripcion AS estado,COALESCE(SUM(d.cantidad),0)::BIGINT AS total_unidades
FROM pedidos p
JOIN estados_pedido e ON e.estado_id=p.estado_id
LEFT JOIN detalle_pedido d ON d.pedido_id=p.pedido_id
WHERE p.estado_id IN (1,2)
GROUP BY p.pedido_id,e.descripcion;

CREATE VIEW vista_pedidos_despacho AS
SELECT p.pedido_id,p.codigo_recojo,p.sede_id,p.nombre_cliente,
       p.confirmado_en,p.estado_id,e.descripcion AS estado
FROM pedidos p JOIN estados_pedido e ON e.estado_id=p.estado_id
WHERE p.estado_id IN (1,2,3);

COMMIT;
