-- Solo lectura. Ejecutar después de autorizar y aplicar T11.4 en Neon.
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'avisos_preparacion'
ORDER BY ordinal_position;

SELECT conname, contype, pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'avisos_preparacion'::regclass
ORDER BY conname;

SELECT tgname, pg_get_triggerdef(oid) AS definicion
FROM pg_trigger
WHERE NOT tgisinternal AND tgname IN
  ('trg_t114_validar_aviso','trg_t114_exigir_aviso_listo',
   'trg_notificar_despacho_pedido','trg_notificar_despacho_aviso');

SELECT proname, prosecdef AS security_definer,
       proconfig AS configuracion,
       pg_get_functiondef(oid) AS definicion
FROM pg_proc WHERE pronamespace='public'::regnamespace
  AND proname IN ('fn_t114_validar_aviso','fn_t114_exigir_aviso_listo',
                 'fn_t114_terminar_preparacion','fn_t114_confirmar_listo',
                 'fn_t114_entregar_pedido','fn_notificar_despacho_pedido',
                 'fn_notificar_despacho_aviso')
ORDER BY proname;

-- Debe devolver false para todas las funciones T11.4: ninguna es invocable
-- por PUBLIC después de la migración estructural.
SELECT p.proname,
       COALESCE(bool_or(a.grantee = 0 AND a.privilege_type = 'EXECUTE'),false)
         AS ejecutable_por_public
FROM pg_proc p
LEFT JOIN LATERAL aclexplode(COALESCE(p.proacl,acldefault('f',p.proowner))) a ON true
WHERE p.pronamespace='public'::regnamespace
  AND p.proname IN ('fn_t114_validar_aviso','fn_t114_exigir_aviso_listo',
                   'fn_t114_terminar_preparacion','fn_t114_confirmar_listo',
                   'fn_t114_entregar_pedido','fn_notificar_despacho_pedido',
                   'fn_notificar_despacho_aviso')
GROUP BY p.proname ORDER BY p.proname;

-- Solo tras autorizar y aplicar también T11.4_privilegios_operativos.sql:
SELECT rolname, rolcanlogin FROM pg_roles
WHERE rolname IN ('allinstant_t114_read','allinstant_t114_kitchen','allinstant_t114_dispatch');
SELECT 'allinstant_t114_kitchen' AS grupo,
       CASE WHEN to_regrole('allinstant_t114_kitchen') IS NOT NULL
         THEN has_table_privilege('allinstant_t114_kitchen','public.pedidos','UPDATE') END AS update_directo,
       CASE WHEN to_regrole('allinstant_t114_kitchen') IS NOT NULL
         THEN has_function_privilege('allinstant_t114_kitchen',
           'public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE') END AS terminar,
       CASE WHEN to_regrole('allinstant_t114_kitchen') IS NOT NULL
         THEN has_function_privilege('allinstant_t114_kitchen',
           'public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') END AS confirmar_listo;
SELECT 'allinstant_t114_dispatch' AS grupo,
       CASE WHEN to_regrole('allinstant_t114_dispatch') IS NOT NULL
         THEN has_table_privilege('allinstant_t114_dispatch','public.pedidos','UPDATE') END AS update_directo,
       CASE WHEN to_regrole('allinstant_t114_dispatch') IS NOT NULL
         THEN has_function_privilege('allinstant_t114_dispatch',
           'public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE') END AS confirmar_listo,
       CASE WHEN to_regrole('allinstant_t114_dispatch') IS NOT NULL
         THEN has_function_privilege('allinstant_t114_dispatch',
           'public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE') END AS entregar;

-- Tras la fase de privilegios: terminar=true solo para cocina;
-- confirmar/entregar=true solo para despacho; DML directo=false en todos.
SELECT r.rolname AS grupo,
       has_table_privilege(r.rolname,'public.pedidos','INSERT,UPDATE,DELETE')
         AS dml_pedidos,
       has_table_privilege(r.rolname,'public.avisos_preparacion','INSERT,UPDATE,DELETE')
         AS dml_avisos,
       has_table_privilege(r.rolname,'public.historial_estados_pedido','INSERT,UPDATE,DELETE')
         AS dml_historial,
       has_function_privilege(r.rolname,
         'public.fn_t114_terminar_preparacion(bigint,bigint)','EXECUTE')
         AS terminar,
       has_function_privilege(r.rolname,
         'public.fn_t114_confirmar_listo(bigint,bigint)','EXECUTE')
         AS confirmar,
       has_function_privilege(r.rolname,
         'public.fn_t114_entregar_pedido(bigint,bigint,text)','EXECUTE')
         AS entregar
FROM pg_roles r
WHERE r.rolname IN ('allinstant_t114_read','allinstant_t114_kitchen',
                    'allinstant_t114_dispatch')
ORDER BY r.rolname;

SELECT p.sede_id, count(*) AS avisos_pendientes
FROM avisos_preparacion a JOIN pedidos p ON p.pedido_id = a.pedido_id
WHERE a.confirmado_en IS NULL AND p.estado_id = 2
GROUP BY p.sede_id ORDER BY p.sede_id;
