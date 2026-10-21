# T00 — Ajustes finales Sprint 1: AlInstant

## Objetivo y alcance

Esta tarea adopta **AlInstant** como nombre visible del producto, incorpora códigos de recojo de tres caracteres y deja disponible un catálogo sintético, únicamente para desarrollo. El alcance de base de datos es Neon `allinstant-dev` / `development` / `neondb`; no incluye producción ni el contenido del archivo histórico `AllInstant-proyecto.zip`.

## Reglas implementadas

- Los nuevos códigos usan exactamente tres caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`; se omiten caracteres visualmente ambiguos.
- La exclusividad se aplica en PostgreSQL por sede y solo mientras el pedido está en `RECIBIDO`, `PREPARANDO` o `LISTO_RECOJO`. Después de `ENTREGADO` puede reutilizarse.
- La inserción se reintenta solo cuando el índice parcial informa una colisión; otros errores revierten toda la transacción. Así, concurrencia no produce dos pedidos activos con el mismo código/sede.
- Entrega normaliza mayúsculas/minúsculas y espacios, manteniendo válidos los códigos históricos largos.
- La semilla añade diez productos marcados `[Prueba S1]`, con ocho disponibles y dos agotados por sede, y diferencias SMP/LM. Es idempotente y no sobrescribe filas existentes.

## Arquitectura, migraciones y seguridad

`lib/client-checkout.ts` genera el código mediante `randomInt` criptográfico y la base de datos decide la colisión real. `T00_codigo_recojo_tres_caracteres.sql` reemplaza la unicidad global antigua por el índice parcial `pedidos_codigo_recojo_activo_sede_uq` y redefine solo la comparación de código de `fn_t114_entregar_pedido`; conserva `SECURITY DEFINER`, los filtros por sede/pago, el bloqueo de fila y el flujo `LISTO_RECOJO → ENTREGADO`.

La migración usa transacción, `lock_timeout` y `statement_timeout`. Debe aplicarse después de revisar el índice existente en development; no se ejecuta sobre producción. La carga `T00_catalogo_sintetico_sedes.sql` también usa transacción y no cambia productos, precios ni disponibilidad ya registrados.

## BDD y trazabilidad

- Dado dos pedidos activos de la misma sede, cuando coinciden ignorando mayúsculas, entonces PostgreSQL rechaza uno.
- Dado el mismo código activo en SMP y LM, entonces ambos pueden existir.
- Dado un pedido entregado, cuando se genera el mismo código para una nueva orden de su sede, entonces el índice parcial lo permite.
- Dado un código histórico, cuando despacho lo ingresa en minúsculas, entonces la entrega lo valida.
- Dado la semilla, cuando se consulta cada sede, entonces hay diez productos sintéticos, ocho disponibles y dos agotados.

## Rebranding y compatibilidad

Se reemplazó el nombre visible, documentación y metadatos de paquete por **AlInstant**, incluido el encabezado interno `X-Requested-With`, actualizado simultáneamente en cliente y servidor. Se preservan los identificadores técnicos `allinstant_*` de roles, canales `LISTEN/NOTIFY`, variable de sesión SQL y el proyecto Neon porque ya forman contratos de base de datos o integración. También se preserva el directorio raíz `Alesar`, tablas, columnas, rutas, historial Git y el nombre/contenido del ZIP histórico.

## Verificación y límites

El 21-10-2026 se comprobó antes de aplicar que `development` / `neondb` era el destino, existían ocho pedidos históricos y no había conflictos entre códigos activos. La migración de códigos se aplicó allí correctamente. El fallo transitorio `branch not found` correspondió al ejecutor SQL del conector, no a la rama: la API de Neon continuó enumerando `br-delicate-bird-b51xsp4s` como `development` y `neondb`; una consulta posterior volvió a funcionar sin cambiar de rama. La semilla se aplicó después en esa misma rama.

### Resultado verificable posterior

- El índice parcial `pedidos_codigo_recojo_activo_sede_uq` existe y la restricción global histórica ya no existe.
- Cada sede tiene 10 productos `[Prueba S1]`: 8 disponibles, 2 agotados y un producto preexistente conservado.
- HTTP real local: catálogo LM `200` con 11 filas y catálogo SMP `200` con 11 filas, procedentes de Next conectado a Neon development.
- E2E HTTP real: el pedido sintético LM `29` se creó con dos productos, estado `PREPARANDO` y código `6ZG`; cocina comunicó finalización, despacho confirmó `LISTO_RECOJO` y la entrega aceptó `6zg`. Neon confirmó estado final `ENTREGADO`, dos líneas y el historial `PREPARANDO`, `LISTO_RECOJO`, `ENTREGADO`.
- No se declaró la reconexión SSE ni una colisión concurrente forzada como aprobadas: la herramienta de navegador no devolvió una instantánea dentro del límite y no se debe inferir esa evidencia de las operaciones HTTP.

### Validación de concurrencia y SSE — límite de privilegios (21-10-2026)

Se añadió `Testing/T00_prueba_concurrencia_codigo_recojo.mjs`: exige que la conexión de prueba confirme `development/neondb`, intenta dos transacciones simultáneas con el mismo código sintético (`ZXZ`) y solo permite el segundo alta con código alternativo (`ZXY`) tras `23505`. Al ejecutarlo con la cuenta limitada de pruebas, PostgreSQL denegó lectura de `sedes` (`42501`) antes de crear pedidos. Esto confirma privilegios mínimos, pero impide afirmar una prueba real de concurrencia en Neon sin una credencial de desarrollo autorizada que pueda insertar datos sintéticos. No se ampliaron privilegios ni se modificaron datos.

Las pruebas automatizadas de SSE (`operations-stream.test.ts`) ejecutaron la desconexión y reapertura simuladas de un cliente: verifican `LISTEN` por canal y que la nueva foto incluye el aviso persistido. No constituyen una interrupción de red real en navegador. Para la evidencia pendiente, abrir `/control-cocina/lm` y `/despacho/lm`, detener temporalmente la conexión del navegador, generar un pedido sintético desde un segundo cliente, restaurar red y confirmar la foto SSE sin recarga manual.

### Recuperación SSE manual de cocina LM (reportada por usuario, 21-10-2026)

El usuario reportó desde Windows una conexión inicial activa en `/control-cocina/lm`, detención de Next.js, indicador `Reconectando…` y fallos de `stream?mode=control`. Tras reiniciar Next.js, observó una nueva conexión HTTP `200`, el indicador `En vivo` y el pedido sintético `#33` visible posteriormente. Se registra como recuperación SSE de cocina LM tras reinicio de Next.js. No se reportó explícitamente si la aparición fue sin actualización manual, no se probó despacho ni una interrupción física de red, y Codex no verificó esta observación directamente.

### Marca y concurrencia — revisión final

La búsqueda de código confirma que `OperationsBoard` y el frontend Vite ya renderizan `AlInstant`; los únicos `allinstant_*` restantes son identificadores técnicos de roles, canales, variables SQL o nombres externos históricos. Si la cabecera muestra `AllInstant × ALESAR`, reiniciar el proceso Next que atiende el puerto 3000 y hacer recarga dura/borrar la caché del sitio en el navegador; no hay cambio de código pendiente.

La vía autorizada de pruebas no permite la colisión forzada: `allinstant_t114_test_app` y su grupo tienen `EXECUTE` sobre `fn_t114_generar_pedido_prueba(bigint)`, pero no `SELECT` sobre `sedes` ni `INSERT` sobre `pedidos` o `detalle_pedido`. El generador usa códigos aleatorios `TP-*` y no acepta código inyectado. Para una prueba PostgreSQL real de `ZXZ`/`ZXY` se requiere autorización para una función `SECURITY DEFINER` de prueba, limitada a development, que reciba únicamente sede y códigos sintéticos, inserte cabecera+detalle atómicamente y marque los pedidos en `t114_pedidos_prueba`; no se propone aplicar ese cambio sin autorización.

### Propuesta de concurrencia controlada — pendiente de autorización

Los archivos `Codigo/T00_propuesta_funcion_prueba_concurrencia.sql` y su reversión preparan una única función `SECURITY DEFINER`, revocada para `PUBLIC` y ejecutable solo por `allinstant_t114_test_orders`. Acepta exclusivamente los pares sintéticos `ZXZ`/`ZXY` y DNI `90000002`/`90000003`, fija LM, `PREPARANDO`, un producto `[Prueba S1]` disponible y el marcador `development/neondb`; no acepta tablas, SQL, sede, precio ni estado arbitrarios. Cada llamada inserta cabecera, detalle y marca T11.4 en la misma transacción de PostgreSQL.

El script actualizado abre dos conexiones limitadas simultáneas: ambas intentan `ZXZ`; una recibe `23505` desde el índice parcial y solo esa conexión reintenta `ZXY`. Esto prueba el índice real, la atomicidad de la función y el patrón de reintento. No usa exactamente el generador criptográfico del checkout (que produce valores aleatorios mediante `randomInt`), pero reproduce su decisión relevante: reintentar únicamente ante la violación única. Tras entregar los dos pedidos por el flujo operativo normal, la reversión revoca y elimina la función sin borrar pedidos, detalles ni historial.

Riesgos mitigados: no hay GRANT directo de DML, `search_path` está fijado, existe preflight de tablas/índice/rol y la función falla fuera de development. Riesgo residual: la función temporal permite dos altas sintéticas predefinidas mientras exista; por ello debe instalarse, ejecutarse una vez, verificar los resultados y revertirse inmediatamente. No se aplicó esta propuesta.

### Ejecución autorizada de concurrencia (21-10-2026)

Tras confirmar `development` (`br-delicate-b51xsp4s`), `neondb`, marcador de entorno, índice parcial y ausencia de códigos activos `ZXZ`/`ZXY` en LM, se aplicó temporalmente la función propuesta. Dos conexiones de `allinstant_t114_test_app` intentaron `ZXZ` a la vez. El resultado fue pedido `35` con `ZXZ` y pedido `36` con `ZXY`; el script solo alcanza `ZXY` al capturar `23505` del índice parcial, por lo que la colisión y el reintento ocurrieron contra PostgreSQL real.

Cada pedido quedó con una línea y marca T11.4, sin pedidos incompletos. Ambos se procesaron por las acciones operativas normales de cocina, despacho y entrega, y terminaron `ENTREGADO` con historial `PREPARANDO`, `LISTO_RECOJO`, `ENTREGADO`. Se ejecutó inmediatamente la reversión: la función ya no existe, el grupo de pruebas sigue sin `INSERT` directo y no quedan códigos `ZXZ`/`ZXY` activos. No se borraron los pedidos sintéticos entregados ni datos históricos.
