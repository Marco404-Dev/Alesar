-- T11.4: reversión conservadora del generador de pedidos sintéticos.
-- NO EJECUTAR sin autorización explícita. No borra pedidos de prueba.
-- Solo permite retirar la estructura si no existen marcadores pendientes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog, public, pg_temp;

DO $preflight$
BEGIN
  IF to_regclass('public.t114_pedidos_prueba') IS NULL OR
     to_regclass('public.t114_entorno_pruebas') IS NULL OR
     to_regprocedure('public.fn_t114_generar_pedido_prueba(bigint)') IS NULL THEN
    RAISE EXCEPTION 'No está instalada toda la estructura del generador T11.4';
  END IF;
  IF EXISTS (SELECT 1 FROM public.t114_pedidos_prueba) THEN
    RAISE EXCEPTION 'Existen pedidos sintéticos marcados; usar primero el procedimiento de limpieza autorizado';
  END IF;
END $preflight$;

REVOKE ALL ON FUNCTION public.fn_t114_generar_pedido_prueba(BIGINT)
  FROM allinstant_t114_test_orders;
DROP FUNCTION public.fn_t114_generar_pedido_prueba(BIGINT);
DROP TABLE public.t114_pedidos_prueba;
DROP TABLE public.t114_entorno_pruebas;
-- El grupo y sus cuentas LOGIN se conservan para revisión separada. No borrar
-- roles desde una reversión estructural ni asumir que no tienen membresías.
COMMIT;
