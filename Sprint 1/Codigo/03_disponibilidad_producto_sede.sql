-- AlInstant / T02.2
-- Ejecutar SOLO en Neon > rama development > base neondb.
-- Requiere las tablas sedes y productos ya creadas en T11.2.
BEGIN;

CREATE TABLE IF NOT EXISTS disponibilidad_producto_sede (
    sede_id BIGINT NOT NULL REFERENCES sedes(sede_id) ON DELETE RESTRICT,
    producto_id BIGINT NOT NULL REFERENCES productos(producto_id) ON DELETE RESTRICT,
    disponible BOOLEAN NOT NULL DEFAULT FALSE,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_disponibilidad_producto_sede PRIMARY KEY (sede_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_producto_sede_catalogo
    ON disponibilidad_producto_sede (sede_id, disponible, producto_id);

CREATE OR REPLACE FUNCTION fn_fecha_actualizacion_disponibilidad()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.disponible IS DISTINCT FROM OLD.disponible THEN
        NEW.actualizado_en := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_fecha_actualizacion_disponibilidad
BEFORE UPDATE OF disponible ON disponibilidad_producto_sede
FOR EACH ROW
EXECUTE FUNCTION fn_fecha_actualizacion_disponibilidad();

COMMIT;
