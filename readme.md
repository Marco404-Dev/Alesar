<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:422719,55:703B24,100:D93600&height=215&section=header&text=AlInstant&fontSize=65&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38" width="100%" alt="AlInstant — Sistema de pedidos anticipados para Alesar" />
</p>

<p align="center">
  <strong>Pedidos anticipados para recojo en las cafeterías Alesar</strong>
</p>

<p align="center">
  <a href="https://www.cateringalesar.com/"><strong>ALESAR · Sitio oficial</strong></a>
</p>

<!-- LOGOTIPO OFICIAL: cuando se cuente con el archivo autorizado, guardarlo en
     assets/logo-alesar.png y reemplazar el enlace de texto anterior por:
     <p align="center"><a href="https://www.cateringalesar.com/"><img src="assets/logo-alesar.png" alt="Logotipo oficial de Alesar" width="170" /></a></p>
-->

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-D93600?style=for-the-badge" alt="Estado: En desarrollo" />
  <img src="https://img.shields.io/badge/Modalidad-Recojo%20en%20local-422719?style=for-the-badge" alt="Modalidad: Recojo en local" />
  <img src="https://img.shields.io/badge/Sedes-SMP%20%7C%20La%20Molina-D93600?style=for-the-badge" alt="Sedes: SMP y La Molina" />
</p>

<p align="center"><sub>Proyecto académico · Ingeniería de Software · Universidad Peruana Cayetano Heredia (UPCH)</sub></p>

---

## Navegación

<p align="center">
  <a href="#sobre-alinstant">Sobre AlInstant</a> ·
  <a href="#el-problema">Problema</a> ·
  <a href="#la-solución">Solución</a> ·
  <a href="#funcionalidades-propuestas">Funcionalidades</a> ·
  <a href="#tecnologías-y-herramientas">Tecnologías</a> ·
  <a href="#avances-y-recursos">Recursos</a>
</p>

<p align="center"><img src="https://capsule-render.vercel.app/api?type=rect&color=0:422719,100:D93600&height=4&section=header" width="100%" alt="Separador" /></p>

## Sobre AlInstant

**AlInstant** es una propuesta de sistema web para gestionar **pedidos anticipados para recojo presencial** en las cafeterías **Alesar** de las sedes **San Martín de Porres (SMP)** y **La Molina**. Se desarrolla como parte del curso de Ingeniería de Software de la **Universidad Peruana Cayetano Heredia**.

Su objetivo es simplificar la experiencia de compra, reducir la necesidad de hacer cola para registrar pedidos y ayudar al personal a organizar la preparación y entrega de productos.

> **Alcance:** pedidos para recoger en el local; no contempla delivery.

## El problema

El proceso presencial tradicional obliga a los clientes a esperar para solicitar y pagar sus pedidos. Además, el uso de tickets físicos y la coordinación manual entre atención, cocina y despacho pueden dificultar el seguimiento oportuno de cada orden, especialmente en horas de alta demanda.

## La solución

AlInstant plantea digitalizar el recorrido del pedido, desde la selección de productos y el pago hasta su preparación y entrega en la sede elegida. De esta manera, el cliente puede planificar su compra y el personal cuenta con información del pedido y de su estado.

<div align="center">

```mermaid
flowchart LR
    A["Cliente selecciona<br/>sede y productos"] --> B["Identificación<br/>y datos de contacto"]
    B --> C["Pago"]
    C --> D{"¿Pago aprobado?"}
    D -->|Sí| E["Pedido enviado<br/>a cocina"]
    D -->|No| F["Pago no aprobado"]
    E --> G["Preparación"]
    G --> H["Despacho marca<br/>pedido listo"]
    H --> I["Recojo y entrega"]
    classDef principal fill:#422719,color:#FFFFFF,stroke:#D93600,stroke-width:2px;
    classDef accion fill:#D93600,color:#FFFFFF,stroke:#422719,stroke-width:2px;
    classDef decision fill:#F2E4D9,color:#422719,stroke:#D93600,stroke-width:2px;
    class A,B,E,G,H,I principal;
    class C accion;
    class D,F decision;
    linkStyle default stroke:#A94A25,stroke-width:2px;
```

<sub>Flujo funcional propuesto; no representa una aplicación completamente implementada.</sub>

</div>

<p align="center"><img src="https://capsule-render.vercel.app/api?type=rect&color=0:422719,100:D93600&height=4&section=header" width="100%" alt="Separador" /></p>

## Funcionalidades propuestas

| Cliente | Operación de Alesar |
|:--|:--|
| Selección de sede y productos disponibles | Control de disponibilidad de productos por sede |
| Identificación mediante DNI y registro de WhatsApp | Visualización de pedidos por sede |
| Pago digital con Yape o tarjeta | Recepción de pedidos en cocina |
| Consulta del estado y código de recojo | Actualización de estados por despacho y registro de entrega |

> Estas son funcionalidades definidas en el alcance y documentación del proyecto. Su presencia aquí **no significa que todas estén implementadas**.

## Tecnologías y herramientas

Solo se incluyen herramientas y tecnologías respaldadas por archivos o enlaces del proyecto:

| Tecnología / herramienta | Uso documentado |
|:--|:--|
| **PostgreSQL (SQL)** | Diseño de la estructura de pedidos, detalles y estados, y scripts de pruebas |
| **Neon** | Entorno de pruebas de PostgreSQL documentado mediante evidencia de ejecución |
| **Vite, React y TypeScript** | Prototipo de la web de clientes HU-01 en `Sprint 1/Codigo/frontend/` |
| **Next.js, React y TypeScript** | Pantalla local de cocina de la tarea T11.3 |
| **StarUML (UML)** | Diagramas de actividades y modelos editables (`.mdj`) |
| **Figma** | Diseño y prototipado; [abrir prototipo](https://www.figma.com/design/w1Kpyyg6ZOSXDVEe60AUfq/Untitled?node-id=0-1&p=f) |
| **GitHub** | Control de versiones y organización de entregables por sprint |

## Dos aplicaciones web

| Aplicación | Ubicación | Estado actual |
|:--|:--|:--|
| Web de clientes HU-01 | [`Sprint 1/Codigo/frontend/`](https://github.com/Marco404-Dev/Alesar/tree/main/Sprint%201/Codigo/frontend) | Prototipo independiente con Vite: selección de sede, catálogo de ejemplo, carrito, resumen y navegación al pago simulado. No registra pedidos ni procesa pagos reales. |
| Operación T11.3/T11.4 | Raíz del repositorio: `app/`, `components/` y `lib/` | Aplicación independiente con Next.js: una interfaz interactiva de cocina y despacho por sede, con PostgreSQL y SSE. |

Son dos proyectos con archivos `package.json` y `package-lock.json` separados. Cada uno requiere instalar sus dependencias en su propio directorio. La interfaz HU-01 todavía no utiliza la base Neon ni está conectada con la aplicación operativa; la integración del pago y la creación de pedidos reales corresponden a trabajo posterior.

### Ejecutar la web de clientes HU-01

Usa Node.js **20.19 o posterior** dentro de la versión 20, o **22.12 o posterior**. Desde la raíz del repositorio:

```powershell
cd "Sprint 1/Codigo/frontend"
npm install
npm run dev
```

Abre la dirección local que muestre Vite en la terminal. Este prototipo utiliza datos de ejemplo y no necesita `DATABASE_URL` ni otras credenciales de Neon.

## T11.4 — Operación vigente de cocina y despacho

La aplicación Next.js de la raíz ofrece una sola interfaz de cocina por sede: `/control-cocina/smp` y `/control-cocina/lm`. Muestra pedidos pagados `PREPARANDO` sin aviso, sus productos y cantidades, permite seleccionar un pedido y comunicar «Preparación terminada». El pedido desaparece de cocina por SSE y mantiene `PREPARANDO` hasta que despacho confirma `LISTO_RECOJO`. Despacho opera en `/despacho/smp` y `/despacho/lm`.

El esquema T11.2 original exigía `RECIBIDO` al insertar. La [migración T11.3](./Sprint%201/Codigo/T11.3_migracion_pedidos_cocina.sql), aplicada y verificada en Neon `development` según los resultados del proyecto, establece `PREPARANDO` como estado inicial y añade invalidaciones PostgreSQL que T11.4 reutiliza. Los pedidos históricos en `RECIBIDO` siguen disponibles para despacho. La [documentación técnica de T11.3](./Sprint%201/Documentacion/T11.3-implementacion-monitor-cocina.md) conserva la implementación y evidencia del monitor sustituido.

### Ejecutar la operación T11.4

1. Usa la misma versión de Node.js indicada arriba y ejecuta `npm install` **en la raíz**, no en el directorio de Vite.
2. Copia [`.env.example`](.env.example) a `.env.local` en la raíz. Este último archivo permanece fuera de Git.
3. En `DATABASE_URL`, coloca la cadena de conexión de Neon para la base que ya contiene el esquema T11.2. Conserva `sslmode=require`. **No ejecutes de nuevo el script de creación sobre esa base.**
4. Se recomienda definir `DATABASE_LISTEN_URL` con una conexión **directa** a esa misma base, sin `-pooler` en el host. Si falta y `DATABASE_URL` es una URL pooler de Neon, el servidor deriva el host directo del mismo endpoint para `LISTEN`. Una URL explícita de otra base o endpoint se rechaza.
5. Ejecuta `npm run dev` desde la raíz y abre [http://127.0.0.1:3000/control-cocina/smp](http://127.0.0.1:3000/control-cocina/smp) o [http://127.0.0.1:3000/control-cocina/lm](http://127.0.0.1:3000/control-cocina/lm).

El servidor local escucha solo en `127.0.0.1`. No hay autenticación individual. **Las rutas operativas identifican la sede, pero no autorizan al dispositivo o a la persona.** No expongas públicamente `/api/operations/[site]/stream`: antes de cualquier despliegue en red, restringe la web operativa a la red interna de ALESAR o una VPN mediante firewall/proxy y usa HTTPS. Sin esos controles, quien alcance la URL podrá consultar las listas. Las credenciales de Neon deben permanecer únicamente en variables de entorno del servidor; no incluyas `.env.local`, cadenas de conexión reales ni otros secretos en Git.

### Eventos en tiempo real

El navegador usa Server-Sent Events (SSE). El servidor abre una conexión PostgreSQL directa con `LISTEN allinstant_cocina`, envía una consulta completa al conectar y vuelve a consultar cuando recibe un `NOTIFY` de su sede. `EventSource` reconecta automáticamente y recibe otra consulta completa, de modo que recupera cambios perdidos durante el corte. Los mensajes de mantenimiento de conexión no consultan la base de datos.

La migración T11.3 añade triggers sobre `pedidos`, `detalle_pedido` y cambios relevantes en `productos.nombre`; los avisos se entregan después de confirmar la transacción. El servidor debe ejecutarse como proceso Node persistente capaz de mantener la conexión SSE y `LISTEN`.

T11.4 opera `/control-cocina/smp`, `/control-cocina/lm`, `/despacho/smp` y `/despacho/lm`. Cocina registra un aviso persistente sin cambiar `PREPARANDO`; despacho confirma `LISTO_RECOJO` y entrega con el código. Cuando existe el aviso, el pedido deja de aparecer en la única pantalla de cocina. La [documentación técnica T11.4](./Sprint%201/Documentacion/T11.4-implementacion-vista-despacho.md) detalla el flujo, las migraciones y las verificaciones.

### Pedidos de prueba T11.4

Solo un servidor local en `NODE_ENV=development` con `ENABLE_TEST_ORDERS=true`, `TEST_ORDERS_DATABASE_URL` limitada y la base `development` marcada puede mostrar el botón de pedidos sintéticos en las rutas de despacho. La conexión y la bandera se guardan únicamente en `.env.local`; no se usan ni se configuran en producción. El pedido queda identificado en la base para una futura limpieza autorizada, sin botón público de borrado.

### Verificación

```bash
npm test
npm run typecheck
npm run build
```

Las pruebas automatizadas usan dobles de base de datos y no modifican Neon. Para verificar pedidos reales, la base debe tener datos confirmados y ambas URL deben apuntar a la misma instancia. El flujo de cocina solo devuelve líneas de producto y sus IDs internos de línea/pedido para mantener la relación; no entrega código de recojo, hora, estado ni datos del cliente.

## Avances y recursos

El repositorio contiene documentación funcional, diagramas, scripts SQL y pruebas. También dispone de carpetas para las entregas de tres sprints.

| Recurso | Enlace |
|:--|:--|
| **Sprint 1** | [Documentación, modelado y pruebas](./Sprint%201) |
| **Sprint 2** | [Scripts de base de datos y entregables](./Sprint%202) |
| **Sprint 3** | [Estructura de entregables](./Sprint%203) |
| **Modelo de pedidos y estados** | [Script SQL](./Sprint%202/Codigo/Base%20de%20Datos/T11.2_estructura_pedidos_y_estados.sql) |
| **Web de clientes HU-01** | [Frontend Vite en `main`](https://github.com/Marco404-Dev/Alesar/tree/main/Sprint%201/Codigo/frontend) |
| **Modelo HU-02 de disponibilidad** | [Documentación en `main`](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Documentacion/T02.2-modelo-datos-disponibilidad.md) |
| **Testing Sprint 1** | [Pruebas automatizadas y SQL](./Sprint%201/Testing/README.md) |
| **Pruebas SQL T11.2** | [Script original](./Sprint%201/Testing/T11.2_pruebas_pedidos_y_estados.sql) |
| **Evidencias Sprint 1** | [Capturas, videos e informes](./Sprint%201/Pruebas/README.md) |
| **T11.1 actualizada** | [Reglas de visualización](./Sprint%201/Documentacion/T11.1-reglas-visualizacion-pedidos.md) |
| **T11.2 actualizada** | [Especificación PostgreSQL](./Sprint%201/Documentacion/T11.2-estructura-pedidos-estados.md) |
| **T11.3 monitor histórico sustituido** | [Documentación técnica y trazabilidad](./Sprint%201/Documentacion/T11.3-implementacion-monitor-cocina.md) |
| **T11.3 base de datos** | [Migración, pruebas y reversión](./Sprint%201/Codigo/README_T11.3_BD.md) |
| **T11.4 despacho y control** | [Implementación, trazabilidad y límites](./Sprint%201/Documentacion/T11.4-implementacion-vista-despacho.md) |
| **Prototipo en Figma** | [Ver diseño](https://www.figma.com/design/w1Kpyyg6ZOSXDVEe60AUfq/Untitled?node-id=0-1&p=f) |

<p align="center"><img src="https://capsule-render.vercel.app/api?type=rect&color=0:422719,100:D93600&height=4&section=header" width="100%" alt="Separador" /></p>

<p align="center">
  <strong>AlInstant · Experiencia de compra más ágil, preparación mejor organizada.</strong>
</p>
<p align="center"><sub>Proyecto académico en desarrollo · UPCH</sub></p>
