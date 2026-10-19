-- AllInstant / Sprint 1 / T02.6
-- Destino autorizado: Neon allinstant-dev, rama development, base neondb.
-- Migración aditiva, atómica e idempotente. No modificar ni ejecutar en production.
-- Recuperación: conservar este archivo y usar T02.6_reversion_catalogo_integracion.sql
-- solamente si no existen datos operativos de catálogo; dicha reversión se niega a borrarlos.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

CREATE TABLE IF NOT EXISTS public.catalogo_producto (
    producto_id BIGINT PRIMARY KEY
        REFERENCES public.productos(producto_id) ON DELETE RESTRICT,
    descripcion TEXT,
    imagen_url TEXT,
    precio_vigente NUMERIC(12,2) NOT NULL,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT catalogo_producto_precio_vigente_no_negativo
        CHECK (precio_vigente >= 0)
);

CREATE TABLE IF NOT EXISTS public.disponibilidad_producto_sede (
    sede_id BIGINT NOT NULL
        REFERENCES public.sedes(sede_id) ON DELETE RESTRICT,
    producto_id BIGINT NOT NULL
        REFERENCES public.productos(producto_id) ON DELETE RESTRICT,
    disponible BOOLEAN NOT NULL DEFAULT FALSE,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT disponibilidad_producto_sede_pkey PRIMARY KEY (sede_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_producto_sede_catalogo
    ON public.disponibilidad_producto_sede (sede_id, disponible, producto_id);

CREATE OR REPLACE FUNCTION public.fn_catalogo_producto_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.descripcion IS DISTINCT FROM OLD.descripcion
       OR NEW.imagen_url IS DISTINCT FROM OLD.imagen_url
       OR NEW.precio_vigente IS DISTINCT FROM OLD.precio_vigente THEN
        NEW.actualizado_en := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_disponibilidad_producto_sede_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.disponible IS DISTINCT FROM OLD.disponible THEN
        NEW.actualizado_en := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.catalogo_producto'::regclass
          AND tgname = 'trg_catalogo_producto_actualizado_en'
          AND NOT tgisinternal
    ) THEN
        CREATE TRIGGER trg_catalogo_producto_actualizado_en
        BEFORE UPDATE OF descripcion, imagen_url, precio_vigente ON public.catalogo_producto
        FOR EACH ROW EXECUTE FUNCTION public.fn_catalogo_producto_actualizado_en();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = 'public.disponibilidad_producto_sede'::regclass
          AND tgname = 'trg_disponibilidad_producto_sede_actualizado_en'
          AND NOT tgisinternal
    ) THEN
        CREATE TRIGGER trg_disponibilidad_producto_sede_actualizado_en
        BEFORE UPDATE OF disponible ON public.disponibilidad_producto_sede
        FOR EACH ROW EXECUTE FUNCTION public.fn_disponibilidad_producto_sede_actualizado_en();
    END IF;
END;
$$;

-- Semilla conservadora para development: no cambia productos ni precios ya catalogados.
-- El último precio histórico solo inicializa productos sin precio vigente; las asociaciones
-- por sede comienzan agotadas, de modo que ningún producto se vende sin habilitación expresa.
WITH ultimo_precio AS (
    SELECT DISTINCT ON (d.producto_id)
        d.producto_id,
        d.precio_unitario
    FROM public.detalle_pedido AS d
    ORDER BY d.producto_id, d.detalle_id DESC
)
INSERT INTO public.catalogo_producto (producto_id, precio_vigente)
SELECT p.producto_id, COALESCE(u.precio_unitario, 0.00::NUMERIC)
FROM public.productos AS p
LEFT JOIN ultimo_precio AS u ON u.producto_id = p.producto_id
ON CONFLICT (producto_id) DO NOTHING;

INSERT INTO public.disponibilidad_producto_sede (sede_id, producto_id, disponible)
SELECT s.sede_id, p.producto_id, FALSE
FROM public.sedes AS s
CROSS JOIN public.productos AS p
WHERE s.codigo IN ('SMP', 'LM')
ON CONFLICT (sede_id, producto_id) DO NOTHING;

COMMIT;
