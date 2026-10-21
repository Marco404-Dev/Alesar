-- PROPUESTA SIN EJECUTAR. Retira la capacidad temporal, no borra pedidos.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
REVOKE ALL ON FUNCTION public.fn_t00_crear_pedido_colision_prueba(text,text) FROM allinstant_t114_test_orders, PUBLIC;
DROP FUNCTION IF EXISTS public.fn_t00_crear_pedido_colision_prueba(text,text);
COMMIT;
-- Antes de aplicar esta reversión, entregar los pedidos marcados en
-- public.t114_pedidos_prueba mediante el flujo operativo. No se borra historial.
