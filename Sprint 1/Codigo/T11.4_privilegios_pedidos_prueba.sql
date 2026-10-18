-- T11.4: privilegios mínimos para el generador de pedidos sintéticos.
-- Aplicar después de T11.4_migracion_pedidos_prueba.sql, solo en development.
-- El LOGIN se aprovisiona fuera de Git y hereda exclusivamente este grupo.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog;

DO $preflight$
BEGIN
  IF to_regclass('public.t114_entorno_pruebas') IS NULL OR
     to_regclass('public.t114_pedidos_prueba') IS NULL OR
     to_regprocedure('public.fn_t114_generar_pedido_prueba(bigint)') IS NULL THEN
    RAISE EXCEPTION 'La migración del generador T11.4 no está instalada';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'allinstant_t114_test_orders') THEN
    RAISE EXCEPTION 'El grupo allinstant_t114_test_orders ya existe; revisar privilegios antes de reintentar';
  END IF;
END $preflight$;

CREATE ROLE allinstant_t114_test_orders NOLOGIN;
GRANT USAGE ON SCHEMA public TO allinstant_t114_test_orders;
GRANT SELECT ON public.t114_entorno_pruebas TO allinstant_t114_test_orders;
GRANT EXECUTE ON FUNCTION public.fn_t114_generar_pedido_prueba(BIGINT)
  TO allinstant_t114_test_orders;

DO $verify$
BEGIN
  IF has_table_privilege('allinstant_t114_test_orders','public.pedidos','INSERT') OR
     has_table_privilege('allinstant_t114_test_orders','public.pedidos','UPDATE') OR
     has_table_privilege('allinstant_t114_test_orders','public.pedidos','DELETE') OR
     has_table_privilege('allinstant_t114_test_orders','public.detalle_pedido','INSERT') OR
     has_table_privilege('allinstant_t114_test_orders','public.t114_pedidos_prueba','INSERT') OR
     NOT has_table_privilege('allinstant_t114_test_orders','public.t114_entorno_pruebas','SELECT') OR
     NOT has_function_privilege('allinstant_t114_test_orders',
       'public.fn_t114_generar_pedido_prueba(bigint)','EXECUTE') THEN
    RAISE EXCEPTION 'Privilegios no mínimos o incompletos para pedidos de prueba';
  END IF;
END $verify$;
COMMIT;

-- Aprovisionamiento separado, fuera de este repositorio y sin publicar secretos:
-- 1. crear por SQL un LOGIN allinstant_t114_test_app con PASSWORD secreto y
--    atributos NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT;
-- 2. GRANT allinstant_t114_test_orders TO allinstant_t114_test_app;
-- 3. verificar que no herede neon_superuser ni DML directo sobre pedidos;
-- 4. guardar su conexión únicamente en TEST_ORDERS_DATABASE_URL local.
-- No usar el creador automático de roles de Neon para este LOGIN: en
-- development se verificó que agrega neon_superuser y no permite revocarlo.
