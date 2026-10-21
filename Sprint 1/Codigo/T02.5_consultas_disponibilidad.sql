-- AlInstant | HU-02 | T02.5
-- Consultas de SOLO LECTURA para Neon PostgreSQL, rama development, base neondb.
-- Requisito: esquema T11.2 y migracion 03_disponibilidad_producto_sede.sql.
-- Ejecutar cada consulta por separado para capturar los resultados en Neon.

-- Q01: Comprobar que existen las sedes previstas.
-- Esperado: SMP (San Martín de Porres) y LM (La Molina).
SELECT sede_id, codigo, nombre
FROM sedes
WHERE codigo IN ('SMP', 'LM')
ORDER BY codigo;

-- Q02: Consultar el catálogo de San Martín de Porres.
-- TRUE = disponible; FALSE = agotado. Solo devuelve productos ofrecidos en SMP.
SELECT p.producto_id, p.nombre, d.disponible, d.actualizado_en
FROM disponibilidad_producto_sede AS d
JOIN productos AS p ON p.producto_id = d.producto_id
JOIN sedes AS s ON s.sede_id = d.sede_id
WHERE s.codigo = 'SMP'
ORDER BY p.nombre, p.producto_id;

-- Q03: Consultar el catálogo de La Molina.
SELECT p.producto_id, p.nombre, d.disponible, d.actualizado_en
FROM disponibilidad_producto_sede AS d
JOIN productos AS p ON p.producto_id = d.producto_id
JOIN sedes AS s ON s.sede_id = d.sede_id
WHERE s.codigo = 'LM'
ORDER BY p.nombre, p.producto_id;

-- Q04: Comparar la disponibilidad de productos ofrecidos en al menos una sede.
-- NULL = el producto NO está ofrecido en esa sede (distinto de FALSE = agotado).
SELECT p.producto_id, p.nombre,
       BOOL_OR(d.disponible) FILTER (WHERE s.codigo = 'SMP') AS disponible_smp,
       BOOL_OR(d.disponible) FILTER (WHERE s.codigo = 'LM') AS disponible_lm
FROM productos AS p
JOIN disponibilidad_producto_sede AS d ON d.producto_id = p.producto_id
JOIN sedes AS s ON s.sede_id = d.sede_id
WHERE s.codigo IN ('SMP', 'LM')
GROUP BY p.producto_id, p.nombre
ORDER BY p.nombre, p.producto_id;

-- Q05: Mostrar productos agotados para la sede seleccionada (ejemplo: SMP).
SELECT p.producto_id, p.nombre
FROM productos AS p
JOIN disponibilidad_producto_sede AS d ON d.producto_id = p.producto_id
JOIN sedes AS s ON s.sede_id = d.sede_id
WHERE s.codigo = 'SMP' AND d.disponible = FALSE
ORDER BY p.nombre;

-- Q06: Consultar si un producto podría agregarse al carrito según su sede.
-- IMPORTANTE: cambia producto_id=1 por un ID real devuelto en Q02/Q03.
-- Esta consulta comprueba la regla de disponibilidad en BD,
-- NO demuestra todavía el comportamiento del botón en la interfaz.
WITH parametros AS (
  SELECT 'SMP'::varchar AS sede_codigo, 1::bigint AS producto_id
)
SELECT EXISTS (
  SELECT 1
  FROM disponibilidad_producto_sede AS d
  JOIN sedes AS s ON s.sede_id = d.sede_id
  CROSS JOIN parametros AS par
  WHERE s.codigo = par.sede_codigo
    AND d.producto_id = par.producto_id
    AND d.disponible = TRUE
) AS se_puede_agregar;

-- Q07: Verificar que existen las tres tablas del modelo de disponibilidad.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('sedes','productos','disponibilidad_producto_sede')
ORDER BY table_name;

-- Q08: Comprobar las claves primaria y foráneas de la tabla asociativa.
SELECT tc.constraint_name, tc.constraint_type, kcu.column_name,
       ccu.table_name AS tabla_referenciada, ccu.column_name AS columna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON tc.constraint_name = ccu.constraint_name
 AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'disponibilidad_producto_sede'
  AND tc.constraint_type IN ('PRIMARY KEY','FOREIGN KEY')
ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position;
