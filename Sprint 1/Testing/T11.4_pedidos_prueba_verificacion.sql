-- Consultas de verificación para el generador T11.4. No crean ni eliminan datos.
SELECT entorno
FROM public.t114_entorno_pruebas
WHERE entorno = 'development';

SELECT p.pedido_id, p.sede_id, p.estado_id, p.pago_confirmado,
       p.codigo_recojo, m.generado_en,
       count(d.detalle_id) AS lineas,
       count(h.historial_id) AS entradas_historial
FROM public.t114_pedidos_prueba m
JOIN public.pedidos p ON p.pedido_id = m.pedido_id
LEFT JOIN public.detalle_pedido d ON d.pedido_id = p.pedido_id
LEFT JOIN public.historial_estados_pedido h ON h.pedido_id = p.pedido_id
GROUP BY p.pedido_id, p.sede_id, p.estado_id, p.pago_confirmado, p.codigo_recojo, m.generado_en
ORDER BY m.generado_en DESC;

SELECT r.rolname,
       has_table_privilege(r.rolname, 'public.t114_entorno_pruebas', 'SELECT') AS lee_marcador,
       has_function_privilege(r.rolname,
         'public.fn_t114_generar_pedido_prueba(bigint)', 'EXECUTE') AS puede_generar,
       has_table_privilege(r.rolname, 'public.pedidos', 'INSERT') AS inserta_directo
FROM pg_roles r
WHERE r.rolname IN ('allinstant_t114_test_orders', 'allinstant_t114_test_app');

-- Previsualización de limpieza: solo muestra los registros marcados.
SELECT m.pedido_id, p.sede_id, p.codigo_recojo, p.nombre_cliente, m.generado_en
FROM public.t114_pedidos_prueba m
JOIN public.pedidos p ON p.pedido_id = m.pedido_id
ORDER BY m.generado_en;
