# Product Backlog Items — Sprint 1

**Proyecto:** AllInstant — ALESAR  
**Sprint:** 1

## Descripción

En esta carpeta se documentan los **Product Backlog Items (PBI)** seleccionados para el Sprint 1. Cada PBI corresponde a una historia de usuario que aporta una funcionalidad al sistema de pedidos anticipados de ALESAR.

Las tareas técnicas de cada historia se gestionan por separado mediante **GitHub Issues / GitHub Projects**.

## Historias de usuario seleccionadas

| PBI | Funcionalidad | Estimación de las tareas | Referencia |
|---|---|---:|---|
| HU-01 | Realizar un pedido anticipado para recojo | 13 h | [Tareas T01.1–T01.5](https://github.com/Marco404-Dev/Alesar/issues/1) |
| HU-02 | Gestionar la disponibilidad de productos por sede | 10 h | [Tareas T02.1–T02.5](https://github.com/Marco404-Dev/Alesar/issues/18) |
| HU-06 | Registrar los datos del cliente | 9 h | [Tareas T06.1–T06.5](https://github.com/Marco404-Dev/Alesar/issues/6) |
| HU-10 | Gestionar el proceso de pago | 12 h | [Tareas T10.1–T10.5](https://github.com/Marco404-Dev/Alesar/issues/23) |
| HU-11 | Visualizar los pedidos recibidos | 11 h | [Tareas T11.1–T11.5](https://github.com/Marco404-Dev/Alesar/issues/11) |

**Estimación total de tareas:** 55 horas. Estas horas corresponden a las 25 tareas asignadas, no a puntos de historia.

> La prioridad relativa de los PBI debe confirmarse con el Product Owner y el equipo; el orden de la tabla no representa una priorización aprobada.

## Alcance de cada PBI

### HU-01 — Realizar un pedido anticipado para recojo
Permite seleccionar la sede, visualizar el catálogo, agregar y modificar productos en el carrito, revisar el resumen y navegar hasta el inicio del pago simulado.

**Entregables:** [Documentación HU-01](../Documentacion/HU01/README.md) · [Video de funcionamiento](../Pruebas/videos/HU01_Funcionamiento.mp4).

### HU-02 — Disponibilidad de productos por sede
Contempla las reglas de disponibilidad, el diseño de datos para productos y sedes, la identificación visual de productos agotados y la restricción de agregarlos al carrito.

### HU-06 — Registro de datos del cliente
Contempla el formulario de nombre y WhatsApp, las validaciones de campos obligatorios y formato, y la asociación de estos datos con el pedido.

### HU-10 — Proceso de pago
Contempla el flujo de pago, la selección entre Yape y tarjeta, los escenarios de aprobación o rechazo y la confirmación del pedido únicamente cuando el pago sea aprobado.

### HU-11 — Visualización de pedidos recibidos
Contempla el almacenamiento de pedidos y estados, la identificación de pedidos por sede y las vistas correspondientes a cocina y despacho.

## Seguimiento

El avance de las tareas se registra en el [repositorio de GitHub](https://github.com/Marco404-Dev/Alesar/issues) y en el tablero GitHub Projects del equipo.

La HU-01 cuenta con prototipo frontend y evidencia de navegación. La integración completa entre historias, el backend y los pagos reales no se consideran terminados por este documento.

**Nota:** Los criterios de aceptación completos y las prioridades oficiales deben consultarse en las historias de usuario aprobadas por el equipo.
