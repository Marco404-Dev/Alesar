-- AlInstant / Sprint 1 / T00. Desarrollo exclusivamente.
-- Semilla idempotente: no modifica filas preexistentes ni datos históricos.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
INSERT INTO public.productos(nombre)
SELECT v.nombre FROM (VALUES
  ('[Prueba S1] Lomo saltado'), ('[Prueba S1] Pollo a la plancha'), ('[Prueba S1] Ají de gallina'), ('[Prueba S1] Tallarines verdes'), ('[Prueba S1] Ensalada fresca'),
  ('[Prueba S1] Sándwich mixto'), ('[Prueba S1] Empanada de pollo'), ('[Prueba S1] Jugo de naranja'), ('[Prueba S1] Café americano'), ('[Prueba S1] Torta de chocolate')
) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM public.productos p WHERE p.nombre = v.nombre);

INSERT INTO public.catalogo_producto(producto_id, descripcion, imagen_url, precio_vigente)
SELECT p.producto_id, 'Producto sintético Sprint 1; no constituye oferta comercial.', NULL,
  CASE p.nombre
    WHEN '[Prueba S1] Lomo saltado' THEN 22.00 WHEN '[Prueba S1] Pollo a la plancha' THEN 19.00
    WHEN '[Prueba S1] Ají de gallina' THEN 18.00 WHEN '[Prueba S1] Tallarines verdes' THEN 17.00
    WHEN '[Prueba S1] Ensalada fresca' THEN 12.00 WHEN '[Prueba S1] Sándwich mixto' THEN 11.00
    WHEN '[Prueba S1] Empanada de pollo' THEN 8.00 WHEN '[Prueba S1] Jugo de naranja' THEN 7.00
    WHEN '[Prueba S1] Café americano' THEN 6.00 ELSE 9.00 END
FROM public.productos p WHERE p.nombre LIKE '[Prueba S1] %'
ON CONFLICT (producto_id) DO NOTHING;

INSERT INTO public.disponibilidad_producto_sede(sede_id, producto_id, disponible)
SELECT s.sede_id, p.producto_id,
  CASE WHEN s.codigo = 'LM' THEN p.nombre NOT IN ('[Prueba S1] Tallarines verdes','[Prueba S1] Torta de chocolate')
       ELSE p.nombre NOT IN ('[Prueba S1] Sándwich mixto','[Prueba S1] Jugo de naranja') END
FROM public.sedes s CROSS JOIN public.productos p
WHERE s.codigo IN ('SMP','LM') AND p.nombre LIKE '[Prueba S1] %'
ON CONFLICT (sede_id, producto_id) DO NOTHING;
COMMIT;
