
# Sprint 1 — Código de implementación

Esta carpeta conserva los SQL de implementación T11.3 y su reversión estructural. El esquema original de T11.2 permanece en [`Sprint 2/Codigo/Base de Datos/`](../../Sprint%202/Codigo/Base%20de%20Datos/readme.md); no se duplica ni se mueve el trabajo de esa carpeta.

| Archivo | Propósito |
|---|---|
| [`T11.3_migracion_pedidos_cocina.sql`](T11.3_migracion_pedidos_cocina.sql) | Estado inicial `PREPARANDO` y avisos `NOTIFY` para el monitor. |
| [`T11.3_reversion_pedidos_cocina.sql`](T11.3_reversion_pedidos_cocina.sql) | Reversión estructural; no borra pedidos ni historial. |
| [`README_T11.3_BD.md`](README_T11.3_BD.md) | Estado de la integración con Neon, precauciones y operación de base de datos. |

La aplicación Next.js se encuentra en `app/`, `components/` y `lib/` de la raíz. Las pruebas ejecutables están en [`Sprint 1/Testing/`](../Testing/README.md); las evidencias en [`Sprint 1/Pruebas/`](../Pruebas/README.md). La [documentación técnica de T11.3](../Documentacion/T11.3-implementacion-monitor-cocina.md) reúne arquitectura, trazabilidad y resultados.
