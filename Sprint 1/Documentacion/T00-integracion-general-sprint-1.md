# T00 — Integración general del Sprint 1

## Auditoría externa complementaria (21-10-2026)

Se auditó estáticamente el archivo no rastreado `AllInstant-proyecto.zip` sin
ejecutarlo ni extraerlo. Es una aplicación independiente React/Vite + Express +
Prisma, no una versión paralela compatible de esta integración Next.js + `pg`.
Su esquema, los códigos `smp`/`molina`, la creación previa al pago y las
transiciones operativas contradicen los contratos actuales. No se incorporó
código, configuración, migraciones ni dependencias del ZIP. El detalle,
matriz y decisiones están en `T00-auditoria-alinstant-proyecto.md`.

No aporta una corrección al 503: no usa Neon ni distingue pooler/conexión
directa. La validación HTTP real y el E2E documentados abajo permanecen
pendientes.

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

## Implementación posterior autorizada

Después de aprobar este plan, se implementó la integración en la rama local
`codex/sprint1-client-integration`:

- T02.6 creó `catalogo_producto` y aplicó la disponibilidad por sede en
  `allinstant-dev` / `development` / `neondb`, mediante una transacción
  aditiva con límites de bloqueo y tiempo. La estructura, índice y triggers
  fueron verificados. La documentación y los SQL de recuperación están en
  [T02.6](T02.6-catalogo-integracion-neon.md).
- Solo el producto identificado explícitamente como sintético, `Lomo saltado
  - Prueba LM` (ID 5), quedó habilitado para LM como prueba E2E de catálogo;
  SMP permanece agotada. No se cambió su precio histórico `18.00`, ni se
  inventaron descripción o imagen. El script conserva esa precondición y no
  debe reutilizarse para productos reales.
- Next.js expone `/api/client/sites`, `/api/client/catalog`,
  `/api/client/checkout/quote`, `/api/client/payments/simulate` y
  `/api/client/orders`. Recalcula precio y disponibilidad dentro de la
  transacción, crea pedido y detalles tras pago aprobado y conserva
  `PREPARANDO`. Un reintento del mismo pago confirmado devuelve el pedido ya
  creado, sin duplicarlo dentro de la instancia del proceso.
- El Vite consume esa API con una URL pública configurable, sin credenciales;
  incorpora catálogo por sede, agotados no seleccionables, formulario de DNI,
  nombre y WhatsApp, pago simulado y código de recojo. Su proxy de desarrollo
  solo reenvía `/api` al destino configurado.

### Verificaciones realizadas

- `npm run typecheck`: correcto.
- Pruebas focalizadas: 17/17 aprobadas (checkout y rutas cliente, además de
  contrato operativo HU-11 y T11.5).
- Vite: `npm run build` y `npm run lint` correctos.
- SQL T02.6 y la habilitación controlada: ejecutados y verificados en Neon
  development; production no fue consultada ni modificada.

No se creó un pedido final por HTTP: la comprobación local contra el servidor
Next temporal no logró conexión de loopback desde el entorno de ejecución. Por
ello sigue pendiente la prueba manual de navegador que confirme el pedido
sintético, la foto SSE de cocina/despacho y la reconexión. El almacenamiento
de cotizaciones/pagos simulados es memoria de proceso, adecuado solo para este
Sprint y una instancia; una futura distribución requiere persistencia o sesión
compartida.

### Incidente E2E — catálogo no disponible (18-10-2026)

La prueba manual de Vite mostró el mensaje `El servicio de catálogo no está
disponible`. La causa fue de conexión, no de catálogo: `DATABASE_URL` apuntaba
al host Neon `-pooler` mientras el compute `development` tiene el pooler
deshabilitado. El intento de conexión devolvió `ENOTFOUND`; la ruta de catálogo
lo convertía correctamente en HTTP 503. La verificación por API administrada
de Neon confirmó que T02.6 existe y que el producto sintético ID 5 se devuelve
para LM con `disponible = true` y precio `18.00`.

La aplicación usa ahora, únicamente fuera de producción, la URL directa ya
configurada para `DATABASE_LISTEN_URL`, después de comprobar que representa el
mismo endpoint y base. En producción conserva `DATABASE_URL` (pooler). También
se fijaron Next en `127.0.0.1:3000` y Vite en `127.0.0.1:5173`: ambos fallan
ante un puerto ocupado, en vez de migrar de puerto silenciosamente. El proxy de
Vite apunta por defecto a `http://127.0.0.1:3000` y admite
`VITE_DEV_API_TARGET` si se usa otro puerto.

El sandbox de ejecución no pudo resolver DNS de los endpoints Neon, por lo que
no fue posible una respuesta HTTP local real. La validación a repetir en el
navegador está documentada en el README del frontend.

### Validación E2E real y corrección de permisos (21-10-2026)

La validación posterior se realizó desde Windows con Next en
`127.0.0.1:3000`, Vite en `127.0.0.1:5173` y la rama Neon autorizada
`allinstant-dev/development/neondb`. Se verificó por HTTP real que
`GET /api/client/catalog?site=LM` devuelve `200`, una fila disponible y el
producto sintético ID 5 a `18.00`; `site=SMP` devuelve `200` con una fila
agotada. No se devolvieron secretos ni URLs de conexión.

La causa raíz del 503 fue doble y queda corregida. Primero, la cuenta servidor
`allinstant_t114_read_app` heredaba los privilegios definidos antes de T02.6 y
no podía leer `catalogo_producto` ni `disponibilidad_producto_sede` (PostgreSQL
`42501`). Después, el checkout fallaba porque su trigger histórico requería
INSERT en `historial_estados_pedido`, y porque `FOR KEY SHARE` exigía permiso
de bloqueo sobre los catálogos de referencia. El script aditivo
`Codigo/T00_privilegios_cliente_integracion.sql` crea el grupo NOLOGIN
`allinstant_t00_client`, se lo concede solo a esa cuenta de servidor y limita
sus capacidades a lectura de catálogo/estados, INSERT de pedido, detalle e
historial, y las tres secuencias estrictamente necesarias. No concede
UPDATE/DELETE ni modifica cocina, despacho o production. El checkout dejó de
usar bloqueos de fila sobre `sedes` y `estados_pedido`, que son referencias
leídas y ya protegidas por claves foráneas.

El E2E visual con datos sintéticos produjo el pedido LM `27`: catálogo remoto,
carrito, cotización, pago simulado, alta `PREPARANDO`, aviso de cocina,
confirmación `LISTO_RECOJO` desde despacho y entrega con código válido. La
consulta posterior confirmó `ENTREGADO`, pago confirmado, una línea de detalle
y tres eventos de historial (`PREPARANDO`, `LISTO_RECOJO`, `ENTREGADO`).
Cocina se actualizó por SSE y retiró el pedido al comunicar la preparación;
despacho recibió el aviso por SSE y sus listas quedaron vacías tras entregar.
No se grabó video: las capturas de automatización fueron temporales y no se
presentan como evidencia audiovisual.

Verificaciones posteriores al cambio: `npm run typecheck` correcto y cinco
archivos Vitest focalizados, 20/20 pruebas aprobadas (conexión, checkout,
rutas cliente, ruta operativa y SSE). Una recarga de despacho abrió una nueva
conexión SSE y recuperó la foto vacía posterior a la entrega; falta únicamente
una prueba ante una desconexión de red real y las revisiones previas a publicar.

### Cierre de semilla y código corto (21-10-2026)

En `allinstant-dev/development/neondb` se confirmó el índice parcial por sede
para códigos activos y el retiro de la unicidad global histórica, sin modificar
los ocho pedidos ya existentes. La semilla `T00_catalogo_sintetico_sedes.sql`
agregó diez productos `[Prueba S1]` a cada sede: ocho disponibles, dos agotados
y conservación del producto previo. Ambos catálogos respondieron HTTP `200`.

La E2E posterior creó el pedido sintético LM 29 con dos líneas, código `6ZG` y
estado `PREPARANDO`. Cocina comunicó la preparación, despacho confirmó
`LISTO_RECOJO` y la entrega con `6zg` llegó a `ENTREGADO`; Neon confirmó su
historial. Una colisión concurrente forzada y la reconexión SSE por caída de
red siguen pendientes de evidencia específica.
