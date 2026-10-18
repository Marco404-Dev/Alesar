-- T11.4: previsualización no destructiva de limpieza de pedidos sintéticos.
-- Este archivo NO contiene DELETE ejecutable. No usar TRUNCATE.
BEGIN READ ONLY;

SELECT m.pedido_id, p.sede_id, p.codigo_recojo, p.nombre_cliente, m.generado_en,
       count(DISTINCT d.detalle_id) AS detalles,
       count(DISTINCT h.historial_id) AS historial,
       count(DISTINCT a.aviso_id) AS avisos
FROM public.t114_pedidos_prueba m
JOIN public.pedidos p ON p.pedido_id = m.pedido_id
LEFT JOIN public.detalle_pedido d ON d.pedido_id = p.pedido_id
LEFT JOIN public.historial_estados_pedido h ON h.pedido_id = p.pedido_id
LEFT JOIN public.avisos_preparacion a ON a.pedido_id = p.pedido_id
GROUP BY m.pedido_id, p.sede_id, p.codigo_recojo, p.nombre_cliente, m.generado_en
ORDER BY m.generado_en;

SELECT count(*) AS pedidos_sinteticos_marcados
FROM public.t114_pedidos_prueba;

COMMIT;

-- Limpieza autorizada: ejecutar solo una copia revisada tras obtener autorización
-- explícita. Mantener el filtro por t114_pedidos_prueba en cada operación y el
-- orden: avisos, detalles, historial, marcadores y finalmente pedidos. No borrar
-- productos, sedes ni pedidos que no tengan marcador persistente.
