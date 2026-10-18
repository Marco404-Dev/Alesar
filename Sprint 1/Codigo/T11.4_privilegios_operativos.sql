-- Fase separada aplicada en Neon development el 18-10-2026.
-- No reejecutar si los grupos ya existen; revisar privilegios efectivos.
-- Requiere la migración T11.4. Ejecutar como administrador de roles/objetos.
-- Crea grupos NOLOGIN; los usuarios LOGIN y sus secretos se aprovisionan fuera
-- de este archivo. No se modifica ni presupone la cuenta actual de Neon.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = pg_catalog;

DO $preflight$
BEGIN
  IF to_regclass('public.avisos_preparacion') IS NULL OR
     to_regprocedure('public.fn_t114_terminar_preparacion(bigint,bigint)') IS NULL OR
     to_regprocedure('public.fn_t114_confirmar_listo(bigint,bigint)') IS NULL OR
     to_regprocedure('public.fn_t114_entregar_pedido(bigint,bigint,text)') IS NULL THEN
    RAISE EXCEPTION 'T11.4 no está instalada';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles
             WHERE rolname IN ('allinstant_t114_read','allinstant_t114_kitchen','allinstant_t114_dispatch')) THEN
    RAISE EXCEPTION 'Roles T11.4 ya existen; revisar membresías y permisos antes de reintentar';
  END IF;
END $preflight$;

CREATE ROLE allinstant_t114_read NOLOGIN;
CREATE ROLE allinstant_t114_kitchen NOLOGIN;
CREATE ROLE allinstant_t114_dispatch NOLOGIN;

GRANT USAGE ON SCHEMA public TO allinstant_t114_read,allinstant_t114_kitchen,allinstant_t114_dispatch;
GRANT SELECT ON public.sedes,public.productos,public.estados_pedido,
  public.pedidos,public.detalle_pedido,public.avisos_preparacion
  TO allinstant_t114_read;
GRANT EXECUTE ON FUNCTION public.fn_t114_terminar_preparacion(BIGINT,BIGINT)
  TO allinstant_t114_kitchen;
GRANT EXECUTE ON FUNCTION public.fn_t114_confirmar_listo(BIGINT,BIGINT),
  public.fn_t114_entregar_pedido(BIGINT,BIGINT,TEXT)
  TO allinstant_t114_dispatch;

-- No conceder INSERT/UPDATE/DELETE sobre pedidos, avisos o historial a estos
-- grupos. Los roles LOGIN deben heredar únicamente el grupo correspondiente;
-- una cuenta propietaria/superusuario no sirve como rol operativo.
DO $verify$
DECLARE v_rol TEXT; v_tabla TEXT; v_accion TEXT;
BEGIN
  FOREACH v_rol IN ARRAY ARRAY['allinstant_t114_read','allinstant_t114_kitchen','allinstant_t114_dispatch'] LOOP
    FOREACH v_tabla IN ARRAY ARRAY['public.pedidos','public.avisos_preparacion','public.historial_estados_pedido'] LOOP
      FOREACH v_accion IN ARRAY ARRAY['INSERT','UPDATE','DELETE'] LOOP
        IF has_table_privilege(v_rol,v_tabla,v_accion) THEN
          RAISE EXCEPTION 'Permiso DML heredado o público no permitido: %, %, %',v_rol,v_tabla,v_accion;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
  IF has_function_privilege('allinstant_t114_read','public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE') OR
     has_function_privilege('allinstant_t114_read','public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') OR
     has_function_privilege('allinstant_t114_read','public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE') OR
     has_function_privilege('allinstant_t114_kitchen','public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') OR
     has_function_privilege('allinstant_t114_kitchen','public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE') OR
     has_function_privilege('allinstant_t114_dispatch','public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE') THEN
    RAISE EXCEPTION 'Algún rol T11.4 puede invocar funciones de otra área';
  END IF;
  IF NOT has_table_privilege('allinstant_t114_read','public.pedidos','SELECT') OR
     NOT has_table_privilege('allinstant_t114_read','public.avisos_preparacion','SELECT') OR
     NOT has_function_privilege('allinstant_t114_kitchen',
       'public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE') OR
     NOT has_function_privilege('allinstant_t114_dispatch',
       'public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') OR
     NOT has_function_privilege('allinstant_t114_dispatch',
       'public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE') THEN
    RAISE EXCEPTION 'Faltan permisos T11.4 necesarios para lectura, cocina o despacho';
  END IF;
END $verify$;
COMMIT;
