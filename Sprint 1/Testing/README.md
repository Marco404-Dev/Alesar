# Sprint 1 — Testing

Esta carpeta contiene código ejecutable de pruebas y consultas de verificación T11 del Sprint 1. Los resultados, capturas, videos e informes de ejecución se guardan en `../Pruebas/`. La organización acordada ubica aquí también las pruebas HU-02, pero sus scripts exclusivos de `main` aún están en `Codigo/` y `Pruebas/Codigo/`; su traslado requiere coordinar la integración de ramas.

| Archivo | Propósito |
|---|---|
| `db.test.ts` | Comprueba selección de conexión directa y rechazo de endpoints distintos o pooler para `LISTEN`. |
| *(histórico retirado)* | Las pruebas exclusivas del monitor T11.3 se retiraron junto con sus rutas y componentes; su evidencia queda indexada en `Pruebas/`. |
| `T11.2_pruebas_pedidos_y_estados.sql` | Pruebas históricas del esquema T11.2, cuyo pedido inicial era `RECIBIDO`; terminan en `ROLLBACK`. No corresponden al esquema tras T11.3. |
| `T11.3_pruebas_post_migracion.sql` | Pruebas del esquema tras T11.3; usan transacción y `ROLLBACK`. Su ejecución satisfactoria en Neon `development` fue reportada por el proyecto. |
| `T11.3_verificacion_post_migracion.sql` | Consultas de solo lectura para revisar default, triggers, funciones, vistas e historial; la verificación posterior fue reportada por el proyecto. |
| `dispatch.test.ts` | Consultas por sede y selección de funciones SQL según acción; rechazo de credenciales con DML directo. |
| `operations-stream.test.ts` | SSE de cocina y despacho, filtro por sede y recuperación tras reconexión. |
| `operations-route.test.ts` | Selección de sede y flujo de las rutas operativas actuales. |
| `operations-security.test.ts` | Origen, CSRF y claves internas diferentes por sede y área. |
| `operations-list.test.tsx` | Datos visibles, estado vacío y ausencia de datos personales en control. |
| `T11.4_verificacion_post_migracion.sql` | Consultas de solo lectura ejecutadas para verificar la migración T11.4 en `development`. |
| `T11.4_pruebas_post_migracion.sql` | Prueba transaccional ejecutada con `ROLLBACK`; no dejó datos sintéticos en `development`. |
| `T11.4_sql_contract.test.ts` | Comprueba localmente guardia de estado, bloqueos por pedido, roles sin DML y reversión conservadora en SQL. |
| `T11.4_concurrencia_manual.md` | Protocolo y evidencia de concurrencia de dos sesiones en `development`; conserva escenarios operativos de referencia. |
| `test-orders-route.test.ts` | Bloqueos por entorno, autorización, marcador de desarrollo y llamada limitada del endpoint de pedidos sintéticos. |
| `operations-board.test.tsx` | Visibilidad del botón de prueba solo para despacho cuando el servidor lo habilita. |
| `T11.5-validacion-identificacion-estados-sede.test.ts` | Contrato de identidad, filtros de sede/estado/pago y snapshots SSE de alta y retiro. |
| `T11.4_pedidos_prueba_verificacion.sql` | Contrato de estructura, privilegios y datos creados por el generador en `development`. |
| `T11.4_previsualizacion_limpieza_pedidos_prueba.sql` | Consulta de solo lectura para enumerar pedidos sintéticos antes de una eventual limpieza autorizada. |

Desde la raíz del repositorio, ejecutar `npm test` para las suites Vitest. `npm run typecheck` y `npm run build` verifican tipos y compilación. Estas pruebas usan dobles de base de datos o URL ficticias y no modifican Neon.

Las pruebas TypeScript están en esta carpeta; no existe una carpeta `tests/` en la raíz que haya que mover. Vitest las descubre aquí con la configuración actual. No ejecutar el script histórico T11.2 tras la migración T11.3 ni ejecutar migraciones como parte de `npm test`. El estado de la base y la reversión T11.3 se documentan en [Código](../Codigo/README_T11.3_BD.md); los resultados y límites operativos T11.4 constan en [su documento](../Documentacion/T11.4-implementacion-vista-despacho.md).
