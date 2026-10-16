# Sprint Planning — Sprint 1

**Proyecto:** AllInstant — ALESAR  
**Metodología:** Scrum  
**Técnica de priorización:** MoSCoW  
**Fecha de inicio:** 15 de octubre de 2026  
**Fecha de finalización:** 16 de octubre de 2026  
**Duración:** 2 días calendario.

## 1. Propósito del Sprint Planning

Durante la planificación del Sprint 1 se revisaron las historias de usuario del Product Backlog, se utilizó la técnica **MoSCoW** para orientar la priorización y se seleccionaron cinco historias para desarrollar. Luego se descompusieron en tareas, se estimó su esfuerzo y se organizaron en GitHub Projects.

## 2. Objetivo del Sprint 1

**Objetivo propuesto:** construir y validar las funcionalidades iniciales del pedido anticipado de ALESAR: selección de sede y productos, consulta de disponibilidad, registro de datos del cliente, navegación hacia el pago y visualización de pedidos recibidos por el personal.

El alcance de cada entrega depende de las tareas acordadas. En particular, la HU-01 comprende un **prototipo frontend navegable**; no implica pagos reales ni registro de pedidos en base de datos.

## 3. Técnica de priorización MoSCoW

Se eligió MoSCoW para distinguir las funcionalidades imprescindibles de aquellas que pueden desarrollarse en incrementos posteriores, considerando el valor para el cliente, la operación de ALESAR, las dependencias funcionales y el esfuerzo disponible.

| Categoría | Significado | Criterio aplicado |
|---|---|---|
| **M — Must Have** | Imprescindible | Necesario para el flujo principal de compra o su atención inicial. |
| **S — Should Have** | Importante | Aporta valor operativo o mejora significativamente la experiencia, pero puede desarrollarse después del primer incremento. |
| **C — Could Have** | Deseable | Complementa la experiencia o la gestión si existe capacidad disponible. |
| **W — Won't Have (por ahora)** | Fuera del alcance actual | No se abordará en el incremento planificado; puede reevaluarse en otro Sprint. |

### Matriz de priorización de las historias

La siguiente es una **propuesta de clasificación MoSCoW para validar con el equipo**, elaborada a partir de las historias del documento proporcionado y de las cinco HU efectivamente elegidas para el Sprint 1. **El documento original no especifica sus categorías MoSCoW**, por lo que esta tabla no debe presentarse como una decisión ya aprobada.

| Historia | Historia de usuario | MoSCoW propuesto | Justificación breve | Sprint 1 |
|---|---|---|---|---|
| HU-01 | Realizar un pedido anticipado para recojo | **M** | Es el flujo central de compra anticipada. | Sí |
| HU-02 | Consultar disponibilidad de productos | **M** | Evita seleccionar productos agotados. | Sí |
| HU-03 | Recibir el estado del pedido | **S** | Informa al cliente mediante WhatsApp. | No |
| HU-04 | Repetir mi almuerzo favorito | **W** | Es una función complementaria basada en historial. | No |
| HU-05 | Encontrar un almuerzo según mi presupuesto | **W** | Añade un filtro opcional de búsqueda. | No |
| HU-06 | Registrar mis datos para realizar un pedido | **M** | Permite identificar al cliente y asociarlo al pedido. | Sí |
| HU-07 | Consultar el seguimiento de mi pedido desde la web | **C** | Ofrece un canal adicional de seguimiento. | No |
| HU-08 | Obtener el comprobante de mi pedido | **C** | Complementa la compra una vez confirmado el pago. | No |
| HU-09 | Recoger mi pedido mediante un código único | **S** | Facilita la identificación y entrega del pedido. | No |
| HU-10 | Pagar mi pedido desde la web | **M** | Define cómo se completa y confirma la compra. | Sí |
| HU-11 | Visualizar los pedidos recibidos | **M** | Permite al personal conocer los pedidos por atender. | Sí |
| HU-12 | Consultar el detalle de un pedido | **S** | Ayuda a preparar productos y cantidades correctamente. | No |
| HU-13 | Actualizar el estado de un pedido | **S** | Registra el progreso de la preparación. | No |
| HU-14 | Actualizar la disponibilidad de productos | **S** | Permite al personal mantener actualizado el catálogo por sede. | No |
| HU-15 | Consultar reportes de ventas y pedidos por sede | **C** | Proporciona información de gestión y análisis. | No |

**Nota de revisión:** el archivo de historias recibido contiene la HU-05. Si el equipo decidió retirarla del Product Backlog vigente, debe eliminarse esa fila y registrarse únicamente las 14 historias aprobadas.

## 4. Historias seleccionadas para el Sprint 1

Se seleccionaron **5 historias de usuario**, descompuestas en **25 tareas**. Las estimaciones suman **55 horas de esfuerzo**, que no equivalen necesariamente a la duración del Sprint.

| Historia | Alcance de trabajo planificado | Tareas | Estimación |
|---|---|---|---:|
| **HU-01** | Flujo, diagrama UML, selección de sede, catálogo, carrito, resumen y navegación al pago. | T01.1–T01.5 | **13 h** |
| **HU-02** | Reglas de disponibilidad, modelo de datos, indicadores de agotado y restricciones de selección. | T02.1–T02.5 | **10 h** |
| **HU-06** | Reglas, formulario y validación de nombre y WhatsApp; asociación con el pedido. | T06.1–T06.5 | **9 h** |
| **HU-10** | Flujo de pago, diagrama UML, pantallas Yape/tarjeta y escenarios aprobado/rechazado. | T10.1–T10.5 | **12 h** |
| **HU-11** | Reglas y estructura de pedidos, vistas de cocina y despacho, y validaciones. | T11.1–T11.5 | **11 h** |
| **Total** | **5 HU y 25 tareas** | | **55 h** |

La descomposición detallada, los responsables y el estado de cada tarea se consultan en [GitHub Issues](https://github.com/Marco404-Dev/Alesar/issues) y en el tablero GitHub Projects del equipo.

## 5. Organización y dependencias

- **Gestión:** seguimiento de las tareas mediante las columnas `To do`, `WIP` y `Done` en GitHub Projects.
- **Control de versiones:** desarrollo en ramas de trabajo e integración mediante Pull Requests hacia `main`.
- **Documentación:** archivos de las historias y sus evidencias en `Sprint 1/Documentacion/`.
- **Pruebas:** capturas, registros y videos en `Sprint 1/Pruebas/`.
- **Coordinación:** reuniones Daily Scrum para comunicar avances, próximos pasos e impedimentos.

Las historias deben coordinarse entre sí: la **HU-02** condiciona los productos seleccionables en la **HU-01**; la **HU-06** proporciona los datos del cliente; la **HU-10** aborda el pago; y la **HU-11** contempla la visualización de pedidos para el personal. Esta relación no significa que toda la integración técnica esté terminada en el Sprint 1.

## 6. Entregables y criterio de revisión

Para revisar cada historia se considerarán sus **criterios de aceptación**, las tareas efectivamente asignadas, la documentación, la demostración funcional y los resultados de las pruebas correspondientes. La finalización de una tarea no implica, por sí sola, que todo el sistema esté integrado.

**Evidencia disponible de HU-01:**

- [Documentación de HU-01](../Documentacion/HU01/README.md).
- [Video de funcionamiento de HU-01](../Pruebas/videos/HU01_Funcionamiento.mp4).

## 7. Acuerdos por confirmar con el equipo

- Clasificación **MoSCoW definitiva** de las historias, si difiere de la propuesta presentada.
- Si la HU-05 continúa en el Product Backlog o fue retirada.
- Responsables y cualquier acuerdo adicional de capacidad o definición de terminado del Sprint.

**Referencia:** documento *Historias de Usuario v2* proporcionado por el equipo y tareas registradas en GitHub para el Sprint 1.
