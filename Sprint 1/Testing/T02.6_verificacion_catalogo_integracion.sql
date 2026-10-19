-- AllInstant / Sprint 1 / T02.6
-- Verificación de solo lectura posterior a la migración. No inserta, actualiza ni borra datos.

SELECT
    to_regclass('public.catalogo_producto') AS tabla_catalogo_producto,
    to_regclass('public.disponibilidad_producto_sede') AS tabla_disponibilidad;

SELECT
    c.conname,
    pg_get_constraintdef(c.oid) AS definicion
FROM pg_constraint AS c
WHERE c.conrelid IN (
    'public.catalogo_producto'::regclass,
    'public.disponibilidad_producto_sede'::regclass
)
ORDER BY c.conrelid::regclass::text, c.conname;

SELECT
    s.codigo AS sede,
    p.producto_id,
    p.nombre,
    c.precio_vigente,
    c.descripcion,
    c.imagen_url,
    d.disponible,
    d.actualizado_en
FROM public.disponibilidad_producto_sede AS d
JOIN public.sedes AS s ON s.sede_id = d.sede_id
JOIN public.productos AS p ON p.producto_id = d.producto_id
JOIN public.catalogo_producto AS c ON c.producto_id = p.producto_id
WHERE s.codigo IN ('SMP', 'LM')
ORDER BY s.codigo, p.producto_id;

-- Invariantes de la semilla: un registro por producto y una asociación por sede aplicable.
SELECT
    (SELECT COUNT(*) FROM public.catalogo_producto) =
    (SELECT COUNT(*) FROM public.productos) AS todos_los_productos_tienen_catalogo,
    NOT EXISTS (
        SELECT 1
        FROM public.disponibilidad_producto_sede AS d
        JOIN public.sedes AS s ON s.sede_id = d.sede_id
        WHERE s.codigo IN ('SMP', 'LM') AND d.disponible
    ) AS semilla_conservadora_sin_productos_habilitados;
