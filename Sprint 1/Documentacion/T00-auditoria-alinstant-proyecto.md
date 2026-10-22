# T00 — Auditoría estática de `AllInstant-proyecto.zip`

Fecha: 21 de octubre de 2026. Alcance: revisión sin extracción ni ejecución del
archivo, comparación con la rama local `codex/sprint1-client-integration` y
documentación de decisiones. No se modificó Neon, no se ejecutaron scripts del
archivo ni se importaron datos o migraciones.

## Objetivo y ubicación

Se auditó `C:\Users\96ces\Desktop\ING SOFTWARE\COCINA\Alesar\AllInstant-proyecto.zip`
(1,835,824 bytes, 139 entradas). No se encontró un archivo con la variante
`allistant-proyecto.zip` dentro del árbol de trabajo. La inspección de nombres,
atributos ZIP y rutas no detectó enlaces simbólicos, rutas absolutas ni
recorridos de directorio. El archivo permanece no rastreado y sin cambios.

## Inventario verificado

El ZIP contiene una aplicación independiente bajo el prefijo `allinstant/`:

| Área | Rutas verificadas | Hallazgo |
|---|---|---|
| Cliente | `src/customer.tsx`, `src/staff.tsx`, `src/components.tsx`, `src/state.tsx`, `src/api.ts`, `src/styles.css` | React 19/Vite, cliente y personal en una aplicación distinta. |
| Servidor | `server/index.ts`, `server/app.ts`, `server/domain.ts`, `server/security.ts` | Express 5, cookies/sesiones, rate limit y endpoints `/api/*`. |
| Datos | `prisma/schema.prisma`, `prisma/migrations/20261016000000_initial/migration.sql`, `prisma/seed.ts` | Prisma 6 y esquema propio con nombres en inglés y UUID/CUID. |
| Configuración | `package.json`, `vite.config.ts`, `docker-compose.yml`, `.env.example` | PostgreSQL local Docker y `DATABASE_URL`; sin `DATABASE_LISTEN_URL` ni configuración Neon específica. El `.env.example` incluye una contraseña de semilla de demostración; no se reutilizó ni se reproduce aquí. |
| Pruebas | `tests/domain.test.ts`, `tests/integration.test.ts`, `e2e/flow.spec.ts`, `playwright.config.ts` | pruebas Node, integración Express/Prisma y E2E Playwright. |
| Material auxiliar | `README.md`, `docs/API.md`, `docs/ALCANCE.md`, `public/assets/*`, `scripts/*` | documentación, recursos visuales y scripts de Docker, compartición y navegador; ninguno se ejecutó. |

Sus dependencias principales son `express`, `@prisma/client`, `prisma`, `zod`,
`cookie-parser`, `helmet`, `express-rate-limit` y Playwright; difieren del
servidor vigente (`Next.js`, `pg` y Vitest). El ZIP usa `smp` y `molina`; la
integración aprobada usa las identidades públicas estrictas `SMP` y `LM`.

## Comparación con la integración actual

| Componente | Existe en ZIP | Existe en repositorio | Diferencias verificadas | Acción recomendada / clasificación |
|---|---|---|---|---|
| Catálogo | `server/app.ts` (`GET /api/catalog`), `BranchProduct` | `app/api/client/catalog/route.ts`, `lib/client-catalog.ts` | ZIP consulta Prisma/`BranchProduct`; repositorio filtra `sedes`, `catalogo_producto` y `disponibilidad_producto_sede` con `pg`. | Conservar actual; ZIP es **incompatible** como código y **útil** como referencia de validación. |
| Disponibilidad | `BranchProduct.available` | `lib/client-catalog.ts`, SQL T02.6 | Ambos son por sede; cambian tablas, claves y códigos de sede. | **Duplicado** funcional e **incompatible** técnicamente. |
| Carrito | `src/customer.tsx`, `src/state.tsx` | `Sprint 1/Codigo/frontend/src/App.tsx`, `src/api/client.ts` | El ZIP maneja su propio contrato Express y estado; Vite actual consume Next. | **Duplicado**; no copiar. |
| Datos del cliente | `server/domain.ts` (`name`, `phone`) | `lib/client-checkout.ts`, `App.tsx` | El ZIP no exige DNI; el esquema real sí. | **Incompatible**. |
| Pago simulado | `POST /api/orders/:id/pay`, `Payment` Prisma | `app/api/client/payments/simulate/route.ts`, `lib/client-checkout.ts` | ZIP persiste pagos y parte de `PENDING_PAYMENT`; integración usa pagos/cotizaciones efímeros en Sprint 1. | **Útil** como diseño de idempotencia; no integrar modelo. |
| Creación de pedidos | `POST /api/orders` y migración Prisma | `app/api/client/orders/route.ts`, `lib/client-checkout.ts` | ZIP crea pedido pendiente antes de pagar y luego `RECEIVED`; repositorio crea después del pago en `PREPARANDO`. | **Incompatible** con regla vigente. |
| Cocina | `src/staff.tsx`, `PATCH /api/staff/orders/:id/status` | `app/control-cocina/smp/page.tsx`, `app/control-cocina/lm/page.tsx`, `lib/operations-*.ts` | ZIP permite que personal haga transiciones; cocina vigente solo registra aviso persistente. | **Incompatible**; conservar HU-11. |
| Despacho | `src/staff.tsx`, endpoint staff | `app/despacho/smp/page.tsx`, `app/despacho/lm/page.tsx`, `lib/dispatch.ts` | ZIP usa `READY`; vigente usa `LISTO_RECOJO` y validación de código al entregar. | **Incompatible**. |
| Base de datos | Prisma `Branch`, `Product`, `Order`, `Payment`, etc. | Neon/PostgreSQL con SQL histórico y T02.6 | Nombres, tipos, claves, estados y relaciones distintos. | **Incompatible**; no ejecutar `prisma migrate`, `seed` ni Docker contra Neon. |
| Pruebas | Node test y Playwright | `Sprint 1/Testing/client-*.test.ts`, `db.test.ts`, pruebas HU-11/Vitest | La intención coincide, pero el bootstrap y contratos son distintos. | Casos de prueba **útiles** para futuras pruebas E2E, no reutilizables directamente. |

## Hallazgos de arquitectura y 503

La causa documentada del 503 vigente fue un `DATABASE_URL` hacia el pooler Neon
deshabilitado de development; `lib/db.ts` ya selecciona fuera de producción la
conexión directa equivalente de `DATABASE_LISTEN_URL`. Las pruebas unitarias de
esa regla están en `Sprint 1/Testing/db.test.ts`.

El ZIP aporta **ninguna corrección técnica** a ese incidente: solo declara una
`DATABASE_URL` para un PostgreSQL local y un `docker-compose.yml` de desarrollo.
No usa Neon, pooler/direct endpoint, `DATABASE_LISTEN_URL`, SSL de Neon, la
consulta actual de catálogo ni las tablas `sedes`/`productos`/T02.6. Ejecutarlo
o adoptar su configuración sustituiría indebidamente la base autorizada. La
única coincidencia conceptual es que ambos restringen el catálogo por sede.

La comprobación HTTP real continúa pendiente: el entorno actual no permite
demostrar conectividad local/DNS hacia Neon. Por tanto no se afirma que el 503
esté resuelto solo por esta auditoría.

## Selección de reutilización

**Necesario:** ninguno del ZIP. Sprint 1 ya tiene la API Next, Vite y el modelo
T02.6 requeridos.

**Útil como referencia, no como copia:** validación de productos duplicados y
cantidades en `server/domain.ts`; transacciones serializables e idempotencia de
`server/app.ts`; escenarios de concurrencia/pago/entrega de
`tests/integration.test.ts`; y el flujo E2E de `e2e/flow.spec.ts`. Cualquier
adopción futura debe reescribirse contra los contratos y estados actuales.

**Descartado:** `prisma/**`, `server/**`, `docker-compose.yml`, scripts de
compartición, `src/staff.tsx` y `.env.example`: son una segunda arquitectura,
incluyen una credencial de demostración o contradicen reglas HU-11.

**Fuera de alcance:** recursos de Figma, el túnel/cloudflared, autenticación de
personal por usuario y reportes administrativos del ZIP.

## Cambios, pruebas y decisiones

El único cambio de esta tarea es este informe y las referencias de auditoría
añadidas a T00/T02.6. No hay cambios de código, dependencias, datos, migraciones
ni configuración. Se efectuaron: listado de 139 entradas, lectura estática de
los archivos de configuración, esquema/migración Prisma, servidor, contratos,
pruebas y documentación; contraste de rutas con el repositorio; revisión de
rutas inseguras/enlaces; `git diff --check`. No se ejecutaron pruebas porque no
se alteró código ejecutable.

## Recomendación de continuación

1. En Windows con acceso a Neon, iniciar Next en `127.0.0.1:3000` y Vite en
   `127.0.0.1:5173`; comprobar `GET /api/client/catalog?site=LM` con HTTP 200
   y el producto sintético LM, sin revelar variables de entorno.
2. Completar el E2E autorizado: cotización, pago simulado, alta `PREPARANDO`,
   foto SSE, aviso de cocina, confirmación de despacho, entrega y reconexión.
3. Mantener el ZIP como referencia externa no ejecutada. Si se decide adoptar
   alguno de sus escenarios, crear pruebas Vitest/Playwright nuevas contra la
   API actual; no mezclar Prisma ni ejecutar su migración.

## Conclusión

El ZIP contiene una implementación demostrativa completa y bien delimitada,
pero no es un faltante de la integración actual ni una solución al HTTP 503.
Reemplazar componentes vigentes introduciría una regresión funcional y de
arquitectura. La integración Sprint 1 necesita validación HTTP/E2E real, no
importación selectiva de este código.
