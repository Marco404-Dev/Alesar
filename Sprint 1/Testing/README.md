# Sprint 1 — Testing

Esta carpeta contiene código ejecutable de pruebas y consultas de verificación del Sprint 1. Los resultados, capturas, videos e informes de ejecución se guardan en `../Pruebas/`.

| Archivo | Propósito |
|---|---|
| `db.test.ts` | Comprueba selección de conexión directa y rechazo de endpoints distintos o pooler para `LISTEN`. |
| `kitchen.test.ts` | Comprueba el filtro por sede y la consulta de líneas de cocina. |
| `kitchen-stream.test.ts` | Comprueba fotos SSE, avisos por sede y recuperación tras reconectar. |
| `route.test.ts` | Comprueba las rutas de lectura y la selección de sede en el servidor. |
| `monitor.test.tsx` | Comprueba la lista visible de productos y el estado vacío. |
| `T11.2_pruebas_pedidos_y_estados.sql` | Pruebas históricas del esquema T11.2, cuyo pedido inicial era `RECIBIDO`; terminan en `ROLLBACK`. No corresponden al esquema tras T11.3. |
| `T11.3_pruebas_post_migracion.sql` | Pruebas del esquema tras T11.3; usan transacción y `ROLLBACK`. Su ejecución satisfactoria en Neon `development` fue reportada por el proyecto. |
| `T11.3_verificacion_post_migracion.sql` | Consultas de solo lectura para revisar default, triggers, funciones, vistas e historial; la verificación posterior fue reportada por el proyecto. |

Desde la raíz del repositorio, ejecutar `npm test` para las suites Vitest. `npm run typecheck` y `npm run build` verifican tipos y compilación. Estas pruebas usan dobles de base de datos o URL ficticias y no modifican Neon.

Las cinco pruebas TypeScript están en esta carpeta; no existe una carpeta `tests/` en la raíz que haya que mover. Vitest las descubre aquí con la configuración actual. No ejecutar el script histórico T11.2 tras la migración T11.3 ni ejecutar migraciones como parte de `npm test`. El estado de la base y la reversión se documentan en [Código](../Codigo/README_T11.3_BD.md); los resultados y evidencias disponibles se distinguen en la [documentación T11.3](../Documentacion/T11.3-implementacion-monitor-cocina.md).
