-- AlInstant / Sprint 1 / T02.6
-- Reversión estructural protegida. No borra datos de catálogo ni de disponibilidad.
-- Ejecutar solo en development y solo si la comprobación previa confirma cero filas.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.catalogo_producto)
       OR EXISTS (SELECT 1 FROM public.disponibilidad_producto_sede) THEN
        RAISE EXCEPTION
            'Reversión T02.6 detenida: existen datos de catálogo/disponibilidad; recuperar desde Neon o migrar datos de forma explícita.';
    END IF;
END;
$$;

DROP TABLE IF EXISTS public.disponibilidad_producto_sede;
DROP TABLE IF EXISTS public.catalogo_producto;
DROP FUNCTION IF EXISTS public.fn_disponibilidad_producto_sede_actualizado_en();
DROP FUNCTION IF EXISTS public.fn_catalogo_producto_actualizado_en();

COMMIT;
