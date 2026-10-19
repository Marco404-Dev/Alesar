# Sprint 1 — Código de implementación

Esta carpeta conserva los SQL T11.3 y T11.4 de migración, privilegios y reversión. La migración y los privilegios T11.4 se aplicaron y verificaron en Neon `development` el 18-10-2026; no se reejecutan sobre esa rama. `main` aporta además la migración HU-02 de disponibilidad y, temporalmente, sus scripts de prueba y consulta. El esquema original de T11.2 permanece en [`Sprint 2/Codigo/Base de Datos/`](../../Sprint%202/Codigo/Base%20de%20Datos/readme.md); no se duplica ni se mueve el trabajo de esa carpeta.

| Archivo | Propósito |
|---|---|
| [`T11.3_migracion_pedidos_cocina.sql`](T11.3_migracion_pedidos_cocina.sql) | Estado inicial `PREPARANDO` y avisos `NOTIFY` reutilizados por las interfaces operativas T11.4. |
| [`T11.3_reversion_pedidos_cocina.sql`](T11.3_reversion_pedidos_cocina.sql) | Reversión estructural; no borra pedidos ni historial. |
| [`T11.4_migracion_avisos_preparacion.sql`](T11.4_migracion_avisos_preparacion.sql) | Tabla, validación de estados, funciones atómicas y avisos SSE; aplicada en `development`. |
| [`T11.4_privilegios_operativos.sql`](T11.4_privilegios_operativos.sql) | Grupos `NOLOGIN` y permisos mínimos; aplicada en `development`. |
| [`T11.4_reversion_avisos_preparacion.sql`](T11.4_reversion_avisos_preparacion.sql) | Retira funciones y triggers T11.4 sin borrar avisos. |
| [`T11.4_migracion_pedidos_prueba.sql`](T11.4_migracion_pedidos_prueba.sql) | Marcador exclusivo de `development`, trazabilidad de pedidos sintéticos y función atómica; aplicada en `development`. |
| [`T11.4_ajuste_generador_pedidos_prueba.sql`](T11.4_ajuste_generador_pedidos_prueba.sql) | Ajuste aditivo aplicado: toma el último precio de desarrollo del producto. |
| [`T11.4_privilegios_pedidos_prueba.sql`](T11.4_privilegios_pedidos_prueba.sql) | Grupo limitado para ejecutar el generador; el LOGIN se aprovisiona fuera de Git. |
| [`T11.4_reversion_pedidos_prueba.sql`](T11.4_reversion_pedidos_prueba.sql) | Reversión conservadora de la estructura; no borra pedidos sintéticos ni roles. |
| [`README_T11.3_BD.md`](README_T11.3_BD.md) | Estado de la integración con Neon, precauciones y operación de base de datos. |
| [`03_disponibilidad_producto_sede.sql` en `main`](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Codigo/03_disponibilidad_producto_sede.sql) | Migración HU-02; permanece en Código. |
| [`04_pruebas_disponibilidad.sql` en `main`](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Codigo/04_pruebas_disponibilidad.sql) | Pruebas HU-02 con `ROLLBACK`; ubicación pendiente de coordinación hacia `Testing/`. |
| [`T02.5_consultas_disponibilidad.sql` en `main`](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Codigo/T02.5_consultas_disponibilidad.sql) | Consultas HU-02 de solo lectura; existe otra copia idéntica en `Pruebas/Codigo/`. Consolidación pendiente. |
| [`T02.6_migracion_catalogo_integracion.sql`](T02.6_migracion_catalogo_integracion.sql) | Migración aditiva para catálogo persistente y disponibilidad por sede; aplicada y verificada en `development` el 18-10-2026. |
| [`T02.6_reversion_catalogo_integracion.sql`](T02.6_reversion_catalogo_integracion.sql) | Reversión estructural protegida: se detiene ante datos para evitar pérdidas. |

La aplicación operativa Next.js está en `app/`, `components/` y `lib/` de la raíz; cocina usa únicamente `/control-cocina/*` y despacho `/despacho/*`. El monitor T11.3 se conserva solo en su documentación histórica. La web de clientes HU-01 es otro proyecto, ubicado en [`frontend/` de `main`](https://github.com/Marco404-Dev/Alesar/tree/main/Sprint%201/Codigo/frontend). Los scripts de prueba T11 están en [`Sprint 1/Testing/`](../Testing/README.md); los de HU-02 aún tienen las ubicaciones indicadas arriba. [`Sprint 1/Pruebas/`](../Pruebas/README.md) está destinado a evidencias. Las validaciones de identidad, estado, sede y SSE se registran en [T11.5](../Documentacion/T11.5-validacion-identificacion-estados-sede-pedidos.md).

La auditoría de integración del Sprint 1 está en [T00](../Documentacion/T00-integracion-general-sprint-1.md). Confirma que el frontend Vite todavía es local, que la API cliente debe residir en Next.js y que `disponibilidad_producto_sede` no existía en Neon `development` al 18-10-2026; no ejecutar su SQL por este documento.
