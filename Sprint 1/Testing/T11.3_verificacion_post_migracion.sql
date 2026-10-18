-- Consultas de solo lectura para Neon development después de T11.3.
-- Revisar los resultados; este script no afirma que la migración se aplicó.
SELECT table_name, column_name, column_default
FROM information_schema.columns
WHERE table_schema = current_schema() AND table_name = 'pedidos'
  AND column_name = 'estado_id';

SELECT e.estado_id, e.codigo, COUNT(p.pedido_id) AS pedidos_actuales
FROM estados_pedido e LEFT JOIN pedidos p ON p.estado_id = e.estado_id
GROUP BY e.estado_id, e.codigo ORDER BY e.estado_id;

SELECT tgrelid::regclass AS tabla, tgname AS trigger,
       pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE NOT tgisinternal AND tgrelid IN
  ('pedidos'::regclass,'detalle_pedido'::regclass,'productos'::regclass)
ORDER BY tgrelid::regclass::TEXT, tgname;

SELECT proname AS funcion, pg_get_functiondef(oid) AS definicion
FROM pg_proc WHERE proname IN
  ('fn_controlar_estado_pedido','fn_registrar_historial_pedido',
   'fn_notificar_monitor_pedido','fn_notificar_monitor_detalle',
   'fn_notificar_monitor_producto')
ORDER BY proname;

SELECT viewname, definition FROM pg_views
WHERE schemaname = current_schema()
  AND viewname IN ('vista_pedidos_cocina','vista_pedidos_despacho')
ORDER BY viewname;

-- Distribución del primer evento histórico, sin exponer datos personales.
SELECT h.estado_nuevo_id, e.codigo, COUNT(*) AS pedidos
FROM historial_estados_pedido h
JOIN estados_pedido e ON e.estado_id = h.estado_nuevo_id
WHERE h.estado_anterior_id IS NULL
GROUP BY h.estado_nuevo_id, e.codigo ORDER BY h.estado_nuevo_id;

-- Muestra las transiciones registradas sin identificadores de clientes.
SELECT h.estado_anterior_id, h.estado_nuevo_id, h.origen, COUNT(*) AS cambios
FROM historial_estados_pedido h
WHERE h.estado_anterior_id IS NOT NULL
GROUP BY h.estado_anterior_id, h.estado_nuevo_id, h.origen
ORDER BY h.estado_anterior_id, h.estado_nuevo_id, h.origen;
