-- AlInstant / Sprint 1 / T02.6
-- Habilitación controlada para prueba E2E en Neon development, base neondb.
-- Solo afecta el producto sintético identificado y la sede LM; no cambia precio ni metadata.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '15s';

DO $$
DECLARE
    filas_actualizadas INTEGER;
BEGIN
    UPDATE public.disponibilidad_producto_sede AS d
    SET disponible = TRUE
    FROM public.sedes AS s
    JOIN public.productos AS p ON p.nombre = 'Lomo saltado - Prueba LM'
    WHERE d.sede_id = s.sede_id
      AND d.producto_id = p.producto_id
      AND s.codigo = 'LM';

    GET DIAGNOSTICS filas_actualizadas = ROW_COUNT;

    IF filas_actualizadas <> 1 THEN
        RAISE EXCEPTION
            'Habilitación T02.6 detenida: se esperó exactamente una fila LM/producto sintético, se actualizaron %',
            filas_actualizadas;
    END IF;
END;
$$;

COMMIT;
