# T00 — Integración general del Sprint 1

Actualizado: 18 de octubre de 2026. Este documento define la primera fase de integración; no aplica migraciones ni implementa endpoints.

## Objetivo y evidencia auditada

Se integrará el prototipo cliente React/Vite de HU-01, HU-02, HU-06 y HU-10 con la aplicación Next.js raíz y la operación HU-11. Se reutiliza Next.js como única API y Neon `allinstant-dev` / rama `development` / base `neondb` como entorno compartido. No hay una segunda base de datos ni acceso PostgreSQL desde el navegador.

Auditoría estática: `main` y `origin/main` coinciden en `4deba7e` (PR #33). Auditoría de solo lectura de Neon, el 18-10-2026: existen `sedes`, `productos`, `pedidos`, `detalle_pedido`, `historial_estados_pedido`, `avisos_preparacion` y las tablas T11.4; no existe `disponibilidad_producto_sede`. `productos` solo tiene `producto_id` y `nombre`; no hay precio, descripción, imagen ni pagos. `pedidos.estado_id` tiene `DEFAULT 2` y el pago debe ser verdadero. No se modificó Neon.

## Inventario y decisiones

| Área | Implementado y reutilizable | Simulación, ausencia o incompatibilidad |
|---|---|---|
| HU-01 | Pantallas Vite de sede, catálogo, carrito y resumen en `Codigo/frontend/src/App.tsx`. | Catálogo, precios y cantidades están en memoria; no hay API, persistencia ni router. |
| HU-02 | SQL versionado para `disponibilidad_producto_sede` y consultas. | La tabla no está aplicada en `development`; Vite no muestra ni bloquea agotados. |
| HU-06 | Reglas funcionales de nombre/WhatsApp. | Documenta Express/Prisma, `Customer` y `Order` inexistentes; el esquema real usa instantáneas en `pedidos` y además exige DNI. |
| HU-10 | Reglas de pago y pantallas/documentación de prototipo. | Sin pasarela, pago persistido, API o creación de pedido; documentación antigua menciona `RECIBIDO`, contrario al estado actual. |
| HU-11 | Next.js, `pg`, SSE, filtros server-side por sede, roles operativos y transiciones atómicas ya integrados. | Sus rutas son internas operativas, no API pública de clientes. No se alterarán. |

Decisiones: (1) conservar `RECIBIDO` solo histórico; toda alta cliente pagada inicia `PREPARANDO`; (2) usar `SMP`/`LM` como identidad pública, no los textos de UI; (3) el servidor determina productos, disponibilidad, precios, total, pago y código; (4) hasta acordar una fuente persistente de precios y aplicar disponibilidad, no se habilita la creación real de pedidos. Se conserva el SQL base T11.2 donde está (`Sprint 2/Codigo/Base de Datos/`) por trazabilidad; no se mueve en esta fase.

## Arquitectura propuesta

`Vite (browser) -> /api/client/* de Next.js -> pg pool -> Neon development`. En desarrollo, Vite debe usar proxy hacia Next o una allowlist CORS explícita; en producción se servirá detrás del mismo origen/reverse proxy. Solo `VITE_API_BASE_URL` puede ser público y no contiene secretos. `DATABASE_URL`, `DATABASE_LISTEN_URL` y credenciales operativas permanecen exclusivamente en Next.js. Las rutas `/api/operations/*`, sus tokens, CSRF, SSE y roles permanecen separados del área cliente.

El checkout se ejecutará en una transacción de Next posterior a la aprobación simulada: reconsulta sede, disponibilidad y precios; inserta cabecera, todos los detalles y el historial mediante la lógica existente; confirma una única vez. Los `NOTIFY` se emitirán después del `COMMIT`, por lo que cocina recibe una foto SSE con el pedido completo. Se rechazan lista vacía, IDs duplicados/no ofrecidos/agotados, cantidades inválidas, DNI, nombre y WhatsApp inválidos, y cualquier precio, total o estado enviado por el navegador.

## Contrato de API propuesto (v1)

Todos responden JSON y errores `{ "error": { "code": "...", "message": "..." } }`. Los IDs se serializan como strings; dinero como decimal string para no perder precisión.

| Endpoint | Solicitud | Respuesta / reglas |
|---|---|---|
| `GET /api/client/sites` | — | `{sites:[{code:"SMP"|"LM",name:string}]}`. |
| `GET /api/client/catalog?site=SMP` | Código de sede estricto. | `{site,items:[{productId:string,name:string,description:string,imageUrl:string|null,unitPrice:"0.00",available:boolean,updatedAt:string|null}]}`. Incluye agotados ofrecidos; ausencia de asociación significa no ofrecido. `404` sede, `503 CATALOG_NOT_READY` mientras falte disponibilidad/precios acordados. |
| `POST /api/client/checkout/quote` | `{site,items:[{productId:string,quantity:number}]}` | Catálogo revalidado: `{site,items:[{productId,name,quantity,unitPrice,lineTotal}],total}`. No persiste ni acepta precio/total del cliente. |
| `POST /api/client/payments/simulate` | `{quoteId,method:"YAPE"|"CARD",outcome:"approved"|"rejected"}` | `{paymentId,status:"approved"|"rejected"}`. La simulación server-side expira y no crea pedido si se rechaza. Solo es alcance Sprint 1; no almacena tarjetas ni integra proveedor. |
| `POST /api/client/orders` | `{paymentId,customer:{dni,name,whatsapp}}` | Con pago aprobado aún válido, crea una vez y devuelve `{orderId:string,pickupCode:string,state:"PREPARANDO",confirmedAt:string}` (`201`). `409` por pago usado/catálogo cambiado; `422` datos; nunca expone el código a cocina. |

La validación de cliente replica la del servidor: nombre recortado de 2–100; WhatsApp peruano normalizado a nueve dígitos que empiezan en 9 (admite prefijo `+51`); DNI exactamente ocho dígitos. Esta incorporación del DNI es necesaria porque la tabla real lo exige, aunque HU-06 histórica no lo incluya.

## Precondiciones y conflictos a resolver antes de habilitar pedidos

1. Preparar, revisar y aplicar en una tarea posterior la migración HU-02 en `development`; hoy su tabla no existe.
2. Aprobar una fuente server-side de precio, descripción e imagen. El esquema actual no permite derivarlos; no se reutilizarán los valores hardcodeados del Vite como verdad de base de datos. Si requiere columnas o tabla nueva, será una migración aditiva separada y reversible.
3. Definir la persistencia efímera de `quoteId`/`paymentId` (servidor o tabla) e idempotencia. Una tabla de pagos completa está fuera de este Sprint.
4. Corregir los documentos HU-10 que hablan de `RECIBIDO` y registrar que HU-06 Express/Prisma es histórico, sin borrar documentación.

## Matriz de integración y asignación paralela

| Tarea | Responsable / archivos propietarios | Entregable y dependencia |
|---|---|---|
| FE-1 Contratos cliente | Frontend A: `Codigo/frontend/src/api/**`, `types/**`, `hooks/useCatalog.ts`. | Cliente HTTP tipado, `VITE_API_BASE_URL`, carga/error y contratos; no toca `App.tsx`. Depende de este contrato. |
| FE-2 Flujo de compra | Frontend B: `Codigo/frontend/src/components/**` y coordinación exclusiva de `App.tsx`. | Catálogo remoto, agotados, carrito revalidable, formulario DNI/nombre/WhatsApp, pago/resultado. Integra FE-1; elimina mock solo al existir API. |
| BE-1 Catálogo y cotización | Backend A: `app/api/client/sites/**`, `app/api/client/catalog/**`, `app/api/client/checkout/quote/**`, `lib/client-catalog.ts`, pruebas focalizadas. | Filtros por sede, disponibilidad y precios server-side. Bloqueado funcionalmente hasta resolver las dos precondiciones de esquema/fuente de catálogo. No toca operaciones. |
| BE-2 Pago simulado y pedido | Backend B: `app/api/client/payments/**`, `app/api/client/orders/**`, `lib/client-checkout.ts`, pruebas focalizadas. | Aprobación/rechazo simulada, idempotencia y alta transaccional `PREPARANDO` tras pago. Depende de BE-1; no altera rutas, SQL ni `lib/operations-*`. |
| Integración y E2E | Integrador: revisión de PR/diffs, `App.tsx` final, documentación y pruebas. | Verifica contratos, CORS/proxy, no exposición de secretos, nueva orden visible por SSE en cocina/despacho, aislamiento SMP/LM, pago rechazado sin pedido y transición a entrega. |

Conflictos previsibles: `App.tsx` es monolítico y solo FE-2 lo modifica; `app/api/**` y `lib/**` se separan por los prefijos anteriores; nadie modifica rutas `operations`, componentes operativos o SQL existente. Las migraciones futuras tendrán rama, SQL y verificación propios y nunca tocarán `production`.

## BDD mínimo de la fase de implementación

- Dado un catálogo disponible por sede, cuando el cliente cambia SMP por LM, entonces recibe solo productos ofrecidos para esa sede y no puede añadir agotados.
- Dado un precio o producto alterado en el navegador, cuando cotiza o crea pedido, entonces Next recalcula o rechaza y no conserva ese valor.
- Dado pago simulado rechazado, cuando termina el flujo, entonces no existe pedido ni evento SSE.
- Dado pago aprobado y datos válidos, cuando confirma una sola vez, entonces crea detalles y pedido `PREPARANDO` de forma atómica, con código de recojo, visible solo para su sede.
- Dado un reintento del mismo pago, cuando se envía de nuevo, entonces no duplica el pedido.

## Límites y resultado de esta fase

No se ejecutaron migraciones, cambios de datos, endpoints ni pruebas de navegador. La validación Neon fue únicamente de estructura. Las pruebas T11.4/T11.5 y la operación SSE se preservan; las evidencias históricas no se reinterpretan. El plan queda listo para asignación tras decidir la fuente de catálogo y autorizar la migración HU-02.
