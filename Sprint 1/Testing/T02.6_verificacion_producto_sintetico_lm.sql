-- AlInstant / Sprint 1 / T02.6
-- Verificación de solo lectura posterior a la habilitación controlada para E2E.

SELECT
    s.codigo AS sede,
    p.producto_id,
    p.nombre,
    c.precio_vigente,
    c.descripcion,
    c.imagen_url,
    d.disponible
FROM public.disponibilidad_producto_sede AS d
JOIN public.sedes AS s ON s.sede_id = d.sede_id
JOIN public.productos AS p ON p.producto_id = d.producto_id
JOIN public.catalogo_producto AS c ON c.producto_id = p.producto_id
WHERE p.nombre = 'Lomo saltado - Prueba LM'
  AND s.codigo IN ('SMP', 'LM')
ORDER BY s.codigo;

DO $$
DECLARE
    lm_habilitado BOOLEAN;
    smp_habilitado BOOLEAN;
BEGIN
    SELECT d.disponible INTO STRICT lm_habilitado
    FROM public.disponibilidad_producto_sede AS d
    JOIN public.sedes AS s ON s.sede_id = d.sede_id
    JOIN public.productos AS p ON p.producto_id = d.producto_id
    WHERE s.codigo = 'LM' AND p.nombre = 'Lomo saltado - Prueba LM';

    SELECT d.disponible INTO STRICT smp_habilitado
    FROM public.disponibilidad_producto_sede AS d
    JOIN public.sedes AS s ON s.sede_id = d.sede_id
    JOIN public.productos AS p ON p.producto_id = d.producto_id
    WHERE s.codigo = 'SMP' AND p.nombre = 'Lomo saltado - Prueba LM';

    IF NOT lm_habilitado OR smp_habilitado THEN
        RAISE EXCEPTION 'Estado E2E inesperado: LM debe estar habilitada y SMP debe seguir agotada';
    END IF;
END;
$$;
