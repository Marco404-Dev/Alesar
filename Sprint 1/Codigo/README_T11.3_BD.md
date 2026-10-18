# T11.3 — Base de datos del monitor de cocina

## Estado de los archivos

| Archivo | Uso | Estado |
|---|---|---|
| `../../Sprint 2/Codigo/Base de Datos/T11.2_estructura_pedidos_y_estados.sql` | Esquema original T11.2 | Ejecutado previamente en Neon `development`; conservar sin reejecutar |
| `../Testing/T11.2_pruebas_pedidos_y_estados.sql` | Pruebas originales del inicio `RECIBIDO` | Código histórico; no ejecutar tras T11.3 |
| `T11.3_migracion_pedidos_cocina.sql` | Default `PREPARANDO`, control de alta y `NOTIFY` | Aplicado en Neon `development`, según verificación reportada |
| `../Testing/T11.3_pruebas_post_migracion.sql` | Pruebas de datos y estados con `ROLLBACK` | Ejecución satisfactoria reportada; sin pedidos ficticios restantes |
| `../Testing/T11.3_verificacion_post_migracion.sql` | Consultas de solo lectura | Verificación posterior reportada |
| `T11.3_reversion_pedidos_cocina.sql` | Reversión estructural, sin borrar datos | Preparado; no ejecutado |

El archivo del esquema T11.2 está ubicado en Sprint 2 aunque su tarea pertenece a Sprint 1. Se propone reubicarlo en Sprint 1 en una integración coordinada, conservando su contenido y referencia histórica; este trabajo no lo mueve.

Los scripts ejecutables T11.2/T11.3 y las pruebas Vitest están en `../Testing/`. Los scripts HU-02 añadidos exclusivamente en `main` todavía están en `Sprint 1/Codigo/` y `Sprint 1/Pruebas/Codigo/`; su reorganización está pendiente de coordinación. Las capturas, videos e informes de resultados permanecen en `../Pruebas/`.

## Estado y configuración de Neon development

La migración T11.3 se aplicó en el proyecto `allinstant-dev`, rama `development`, base `neondb`, según la verificación comunicada por el proyecto. En esa verificación se reportaron seis triggers activos, `pedidos.estado_id DEFAULT 2`, dos sedes, cuatro estados y pruebas SQL posteriores satisfactorias sin pedidos ficticios restantes. El SQL HU-02 presente en `main` puede agregar otro trigger si se aplica después; la cifra de seis no describe necesariamente el estado futuro de Neon. Esta actualización documental no reejecutó la migración ni las consultas SQL. No se debe volver a ejecutar el esquema original T11.2 ni la migración T11.3 sobre esa base.

HU-10 deberá registrar nuevas cabeceras y detalles **después de validar el pago**, en una sola transacción. Los productores antiguos que intenten insertar explícitamente `RECIBIDO` fallarán con la regla actual y deberán adaptarse antes de integrarse.

La aplicación Next.js configura `DATABASE_URL` solo en `.env.local` o variables del servidor. Para `LISTEN` se recomienda `DATABASE_LISTEN_URL` directa, sin `-pooler`; si falta y `DATABASE_URL` usa el pooler de Neon, el servidor deriva el host directo del mismo endpoint. Una URL de escucha explícita de otro endpoint o base se rechaza. Las rutas `/cocina/smp` y `/cocina/lm` consultan esta misma base y filtran cada sede por separado.

Los scripts no contienen credenciales. Nunca subir `.env.local` ni pegar cadenas de conexión en documentación o capturas.

## Avisos y prueba de integración

El canal `allinstant_cocina` transmite solo `sede_id` como texto. Los triggers avisan de altas activas, cambios de estado relevantes para cocina, inserciones/cambios/eliminaciones de líneas visibles y renombres efectivos de productos usados por pedidos activos. No avisan por cambio de precio unitario, actualización sin cambio visible, pedido ya entregado o transición `LISTO_RECOJO → ENTREGADO`. PostgreSQL entrega avisos después de `COMMIT` y puede consolidar avisos idénticos en una transacción. El servidor reconsulta siempre la lista completa, por lo que no depende de un aviso por cada línea.

La prueba SQL con `ROLLBACK` comprueba datos, historial y ejecución de funciones y triggers, pero **no** puede confirmar la entrega externa de `NOTIFY`: un aviso de una transacción revertida no llega al oyente. Se reportaron por separado comprobaciones de SSE con HTTP 200, snapshot inicial, actualización de productos en SMP, retiro al cambiar a `LISTO_RECOJO` y separación entre sedes. Los archivos de video existentes y los límites de evidencia se registran en la [documentación técnica T11.3](../Documentacion/T11.3-implementacion-monitor-cocina.md); aquí no se repiten pruebas de integración.

## Reversión

Si es necesario revertir, detener o adaptar primero los productores que insertan `PREPARANDO` y el monitor SSE. Revisar dependencias actuales y el respaldo. `T11.3_reversion_pedidos_cocina.sql` elimina **solo** los tres triggers y funciones de notificación T11.3, devuelve el default a 1 y restaura la función de control original. Conserva las seis tablas, las vistas, todos los pedidos y todo su historial. Los pedidos creados con primer estado `PREPARANDO` siguen así; la reversión no reescribe hechos históricos. Después de revertir, confirmar que los productores vuelven a crear `RECIBIDO` o detener altas hasta corregirlos.

## Límites actuales

T11.2 no almacena comprobante de pago ni impide una cabecera sin líneas. La variable `allinstant.origen_cambio` valida el origen declarado por el cliente SQL, pero no autentica al actor; se necesitan permisos mínimos en la base. El monitor no requiere login individual ni vinculación de dispositivo y no debe publicarse sin restricción de red/VPN, HTTPS y proxy/firewall. `LISTEN/NOTIFY` no es una cola durable; SSE recupera cambios al reconectar con una foto completa.
