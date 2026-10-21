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

El 21-10-2026 se comprobó antes de aplicar que `development` / `neondb` era el destino, existían ocho pedidos históricos y no había conflictos entre códigos activos. La migración de códigos se aplicó allí correctamente. La semilla fue detenida antes de escribir: el conector SQL devolvió `branch not found` pese a que la API de metadatos aún confirma la misma rama y base. Por seguridad, quedan pendientes la semilla, consulta de índice posterior, E2E, concurrencia y reconexión SSE hasta resolver esa inconsistencia sin usar otra rama. La comprobación estática sí incluye typecheck y pruebas focalizadas; no se atribuye evidencia de video.
