# Product Backlog — AllInstant (ALESAR)

> **Documento maestro de requisitos — versión 1.1 para revisión formal.** Contiene las 15 historias HU-01 a HU-15 del archivo `HISTORIAS DE USUARIO_v2.docx`. Sus enunciados, criterios BDD originales y justificaciones se preservan; los **criterios añadidos** a HU-06, HU-07 y HU-14 aparecen separados y rotulados como **ampliaciones aprobadas el 21/10/2026**. Las prioridades MoSCoW y la asignación de sprints fueron confirmadas por el solicitante; los Story Points se mantienen como estimaciones propuestas, sujetos a validación colectiva.

## 1. Control documental

| Campo | Valor |
|---|---|
| Proyecto | AllInstant — ALESAR |
| Artefacto Scrum | Product Backlog (PB) |
| Versión | **1.1** — decisiones de alcance incorporadas |
| Fecha de elaboración | **21 de octubre de 2026** |
| Ubicación prevista | `Product Backlog/PRODUCT_BACKLOG.md` |
| Alcance | Pedidos anticipados con recojo presencial en **San Martín de Porres (SMP)** y **La Molina (LM)** |
| Fuente de HU y BDD | `HISTORIAS DE USUARIO_v2.docx` (15 HU) |
| Marco | Scrum; priorización MoSCoW; estimación relativa Fibonacci; criterios BDD |
| Estado del documento | **Decisiones confirmadas por el solicitante**; pendiente de aprobación formal por Product Owner/equipo antes de declarar versión oficial definitiva |
| Estado de las HU | **Pendiente**, por decisión de presentación; no equivale a ausencia de avances técnicos previos |

### Historial de cambios

| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | 2026-10-21 | Primera consolidación de 15 HU del Word; propuesta MoSCoW/Fibonacci, dependencias y discrepancias. |
| **1.1** | **2026-10-21** | Se ratifican MoSCoW y distribución de sprints; se mantienen SP propuestos; se incorporan ampliaciones BDD de DNI (HU-06), expiración del enlace (HU-07) y CRUD de productos (HU-14). Pago real de HU-10 pasa a trabajo pendiente de Sprint 2. Se formaliza el flujo automático `PREPARANDO` y se cierran decisiones D-01 a D-08. |

## 2. Alcance y reglas de gestión

El Product Backlog registra **qué valor espera el usuario o el negocio**. Las tareas de implementación, endpoints, tablas, migraciones y asignaciones frontend/backend pertenecen a los **Sprint Backlogs** y sus Issues. La posición o el sprint planificado puede cambiar en refinamientos posteriores sin alterar el código de HU.

- **MoSCoW:** `Must` = necesario para el flujo esencial; `Should` = importante pero no imprescindible para el primer incremento; `Could` = mejora deseable si existe capacidad; `Won’t (por ahora)` = fuera del alcance actual. **El solicitante confirmó el 21/10/2026** la clasificación reflejada en la matriz; no consta firma formal adicional del Product Owner/equipo.
- **Story Points:** escala Fibonacci `1, 2, 3, 5, 8, 13`, que mide complejidad/incertidumbre relativa, **no horas**. El solicitante decidió **mantener los valores existentes como estimaciones propuestas**, sin declararlos estimaciones colectivas definitivas.
- **Estado:** por decisión documental, todas las filas comienzan en `Pendiente`. El avance verificado o reportado de tareas se registra en GitHub Issues y Sprint Backlogs; una HU no se considera `Completada` solo porque existan prototipos o pruebas parciales.
- **Priorización y calendario:** Sprint 1 está respaldado por su planificación en GitHub; el solicitante confirmó la selección de cinco HU para Sprint 2 y las cinco restantes para Sprint 3. Se conservan los sprints **de asignación principal**; HU-06 tendrá una ampliación técnica en Sprint 2 y HU-10 arrastrará allí su pago real pendiente. Ambas intervenciones son **trabajo adicional sobre HU existentes**, no nuevas HU ni puntos sumados de nuevo. Las fechas concretas de Sprint 2 y Sprint 3 no se inventan.

## 3. Resumen ejecutivo — matriz de Product Backlog

| HU | Historia de usuario | Prioridad MoSCoW | SP* | Sprint principal | Estado |
|---|---|---|---:|---|---|
| **HU-01** | Realizar un pedido anticipado para recojo | Must | 8 | Sprint 1 | Pendiente |
| **HU-02** | Consultar disponibilidad de productos | Must | 5 | Sprint 1 | Pendiente |
| **HU-03** | Recibir el estado del pedido | Must | 8 | Sprint 2 | Pendiente |
| **HU-04** | Repetir mi almuerzo favorito | Could | 5 | Sprint 3 | Pendiente |
| **HU-05** | Encontrar un almuerzo según mi presupuesto | Could | 3 | Sprint 3 | Pendiente |
| **HU-06** | Registrar mis datos para realizar un pedido | Must | 3 | Sprint 1 | Pendiente |
| **HU-07** | Consultar el seguimiento de mi pedido desde la web | Should | 5 | Sprint 2 | Pendiente |
| **HU-08** | Obtener el comprobante de mi pedido | Should | 5 | Sprint 3 | Pendiente |
| **HU-09** | Recoger mi pedido mediante un código único | Must | 5 | Sprint 2 | Pendiente |
| **HU-10** | Pagar mi pedido desde la web | Must | 13 | Sprint 1 | Pendiente |
| **HU-11** | Visualizar los pedidos recibidos | Must | 5 | Sprint 1 | Pendiente |
| **HU-12** | Consultar el detalle de un pedido | Must | 3 | Sprint 3 | Pendiente |
| **HU-13** | Actualizar el estado de un pedido | Must | 8 | Sprint 2 | Pendiente |
| **HU-14** | Actualizar la disponibilidad de productos | Must | 8 | Sprint 2 | Pendiente |
| **HU-15** | Consultar reportes de ventas y pedidos por sede | Should | 8 | Sprint 3 | Pendiente |

\* **Story Points propuestos y conservados** a petición del solicitante, pendientes de estimación/revisión grupal. Las prioridades MoSCoW y la asignación de sprints fueron confirmadas por el solicitante el 21/10/2026. Los criterios originales proceden del Word; las ampliaciones aprobadas están diferenciadas.

### Resumen de planificación

| Sprint | HU de asignación principal | Cantidad | Story Points propuestos | Carácter de la asignación |
|---|---|---:|---:|---|
| Sprint 1 | HU-01, HU-02, HU-06, HU-10, HU-11 | 5 | 34 | Confirmada en Sprint Planning 1 |
| Sprint 2 | HU-03, HU-07, HU-09, HU-13, HU-14 | 5 | 34 | Confirmada por solicitante; además HU-06 y HU-10 arrastran trabajo específico |
| Sprint 3 | HU-04, HU-05, HU-08, HU-12, HU-15 | 5 | 24 | Confirmada por solicitante; capacidad y fechas se validarán en Sprint Planning |
| **Total** | **HU-01 a HU-15** | **15** | **92** | — |

**Nota de capacidad:** los Story Points están distribuidos **una sola vez por HU principal**: 34 + 34 + 24 = 92. Los trabajos pendientes de HU-06 y HU-10 en Sprint 2 **no están estimados por separado** en esta tabla y deben aparecer en su Sprint Backlog con tiempo y capacidad propios. Las 55 horas estimadas para las 25 tareas del Sprint 1 son otra unidad de esfuerzo; no convertir ni sumar horas con SP.

## 4. Product Backlog detallado — 15 historias de usuario

### HU-01 — Realizar un pedido anticipado para recojo

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 8 SP (propuesta) · **Sprint:** Sprint 1 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero realizar mi pedido desde mi celular antes de llegar al establecimiento, para evitar la cola de toma de pedido y acercarme principalmente a recoger mi comida.

**Criterios de aceptación BDD (texto fuente):**

**CA-01.1 — Selección de sede**

Dado que el cliente desea realizar un pedido para recojo,  
cuando inicia el proceso de compra,  
entonces debe poder seleccionar la sede de San Martín de Porres o La Molina.  

**CA-01.2 — Selección de productos**

Dado que el cliente ha seleccionado una sede,  
cuando revisa el catálogo disponible,  
entonces debe poder agregar productos al carrito y modificar sus cantidades antes de confirmar el pedido.  

**CA-01.3 — Revisión del pedido**

Dado que el cliente tiene productos en su carrito,  
cuando continúa con el pedido,  
entonces el sistema debe mostrar los productos seleccionados, sus cantidades y el monto total.  

**CA-01.4 — Confirmación del pedido**

Dado que el cliente ha revisado los productos y cantidades de su pedido,  
cuando confirma que desea continuar con la compra,  
entonces el sistema debe conservar la información del pedido y dirigirlo al proceso de pago.  

**Justificación (fuente documental):**

Esta historia busca reducir el tiempo que el cliente permanece en el local, permitiéndole realizar su pedido antes de llegar. De esta manera, ALESAR puede disminuir las colas en horas de mayor demanda y agilizar la atención de los pedidos para recojo.

**Dependencias / relaciones funcionales (propuesta):** HU-02, HU-06, HU-10.

**Motivo de priorización (propuesta):** Núcleo de selección y registro de compra.

### HU-02 — Consultar disponibilidad de productos

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 1 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero consultar los productos disponibles en una sede, para evitar seleccionar productos que no puedan ser preparados.

**Criterios de aceptación BDD (texto fuente):**

**CA-02.1 — Visualización de productos disponibles**

Dado que el cliente ha ingresado al catálogo de una sede,  
cuando consulta los productos,  
entonces el sistema debe mostrar cuáles se encuentran disponibles para realizar un pedido.  

**CA-02.2 — Identificación de productos agotados**

Dado que un producto ha sido marcado como no disponible,  
cuando el cliente visualiza el catálogo,  
entonces el sistema debe indicar claramente que el producto se encuentra agotado.  

**CA-02.3 — Restricción de productos no disponibles**

Dado que un producto se encuentra agotado,  
cuando el cliente intenta seleccionarlo,  
entonces el sistema no debe permitir agregarlo al pedido.  

**CA-02.4 — Actualización de disponibilidad**

Dado que el personal de ALESAR modifica la disponibilidad de un producto,  
cuando el cliente vuelve a consultar el catálogo,  
entonces el sistema debe mostrar el estado actualizado del producto.  

**Justificación (fuente documental):**

Esta historia permite que el cliente conozca la disponibilidad de los productos antes de realizar su pedido, evitando seleccionar opciones que no pueden ser atendidas. Además, contribuye a reducir los pedidos afectados por falta de stock, uno de los objetivos establecidos en el caso de negocio.

**Dependencias / relaciones funcionales (propuesta):** HU-01, HU-14.

**Motivo de priorización (propuesta):** Evita compras con productos agotados por sede.

### HU-03 — Recibir el estado del pedido

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 8 SP (propuesta) · **Sprint:** Sprint 2 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero recibir por WhatsApp el estado de mi pedido, para saber cuándo debo acercarme a recogerlo.

**Criterios de aceptación BDD (texto fuente):**

**CA-03.1 — Pedido recibido**

Dado que el pedido ha sido registrado correctamente,  
cuando se asigna el estado “Pedido recibido”,  
entonces el cliente debe recibir una notificación por WhatsApp indicando dicho estado.  

**CA-03.2 — Pedido en preparación**

Dado que el personal inicia la preparación del pedido,  
cuando actualiza su estado a “Preparando comida”,  
entonces el cliente debe recibir una notificación por WhatsApp con el nuevo estado.  

**CA-03.3 — Pedido listo para recojo**

Dado que el pedido ha terminado de prepararse,  
cuando el personal actualiza su estado a “Comida lista para recojo”,  
entonces el cliente debe recibir una notificación por WhatsApp informándole que puede acercarse a recogerlo.  

**CA-03.4 — Identificación del pedido**

Dado que el cliente recibe una notificación,  
cuando visualiza el mensaje en WhatsApp,  
entonces este debe permitir identificar el pedido al que corresponde.  

**CA-03.5 — Fallo en el envío de la notificación**

Dado que el estado del pedido ha sido actualizado correctamente,  
cuando la notificación por WhatsApp no pueda ser enviada,  
entonces el sistema debe registrar el fallo de envío sin modificar el estado actual del pedido.  

**Justificación (fuente documental):**

Esta historia permite que el cliente conozca el avance de su pedido sin tener que permanecer esperando en el establecimiento. Así, puede acercarse cuando su comida esté lista para recojo, contribuyendo a reducir la congestión y los tiempos de espera en ALESAR. Esto está alineado con el propósito del proyecto de agilizar la atención de los pedidos para recojo.

**Dependencias / relaciones funcionales (propuesta):** HU-06, HU-09, HU-13.

**Motivo de priorización (propuesta):** Notificaciones de estado y resiliencia ante fallos externos.

> **Aplicación de D-05 y D-06:** se conservan los criterios originales de avisos `Pedido recibido`, `Preparando comida` y `Comida lista para recojo`. Para pedidos nuevos, la confirmación real de pago origina un evento de **pedido confirmado/recibido** y su estado persistido inicial es `PREPARANDO`; se notifica esa situación sin insertar artificialmente una fila en estado `RECIBIDO`. La notificación de `LISTO_RECOJO` se origina **solo** después de que despacho confirme la transición. WhatsApp debe registrar fallos sin revertir el pedido. La cobertura de los mensajes requeridos debe verificarse con plantillas aprobadas y evidencia de envío.

### HU-04 — Repetir mi almuerzo favorito

**Prioridad:** Could (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 3 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente frecuente de ALESAR, quiero volver a realizar un pedido desde mi historial, para pedir mi almuerzo favorito sin tener que buscar nuevamente cada producto.

**Criterios de aceptación BDD (texto fuente):**

**CA-04.1 — Selección de un pedido anterior**

Dado que el cliente tiene pedidos registrados en su historial,  
cuando selecciona la opción “Volver a pedir” en uno de ellos,  
entonces el sistema debe agregar sus productos disponibles al carrito, conservando las cantidades anteriores.  

**CA-04.2 — Verificación de disponibilidad**

Dado que el cliente desea repetir un pedido,  
cuando alguno de sus productos no está disponible en la sede seleccionada,  
entonces el sistema debe identificar el producto agotado e informar que no fue agregado al carrito.  

**CA-04.3 — Actualización de precios**

Dado que el precio de un producto ha cambiado desde el pedido anterior,  
cuando el cliente repite dicho pedido,  
entonces el sistema debe aplicar el precio actual e informar el cambio antes del pago.  

**CA-04.4 — Revisión antes del pago**

Dado que los productos se han agregado al carrito,  
cuando el cliente revisa el pedido,  
entonces debe poder modificar las cantidades, eliminar productos y confirmar la sede antes de pagar.  

**Justificación (fuente documental):**

Esta historia facilita las compras recurrentes y reduce el tiempo necesario para realizar un pedido. Es una propuesta de ampliación que complementa el propósito de agilizar la atención de ALESAR, especialmente para clientes que suelen elegir los mismos platos.

**Dependencias / relaciones funcionales (propuesta):** HU-01, HU-02, HU-10.

**Motivo de priorización (propuesta):** Conveniencia y recompra, no bloqueante para el MVP.

### HU-05 — Encontrar un almuerzo según mi presupuesto

**Prioridad:** Could (ratificada por solicitante) · **Estimación:** 3 SP (propuesta) · **Sprint:** Sprint 3 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR con un presupuesto limitado, quiero filtrar los platos según el monto que puedo gastar, para encontrar rápidamente una opción de almuerzo que se ajuste a mi presupuesto.

**Criterios de aceptación BDD (texto fuente):**

**CA-05.1 — Ingreso del presupuesto**

Dado que el cliente está consultando el menú de una sede,  
cuando ingresa un monto máximo válido en soles y aplica el filtro,  
entonces el sistema debe mostrar únicamente platos disponibles cuyo precio sea igual o inferior a ese monto.  

**CA-05.2 — Ausencia de opciones**

Dado que ningún plato disponible cumple con el presupuesto ingresado,  
cuando el cliente aplica el filtro,  
entonces el sistema debe informar que no existen opciones dentro de ese monto y permitir modificarlo.  

**CA-05.3 — Validación del monto**

Dado que el cliente ingresa un valor no numérico, cero o un número negativo,  
cuando intenta aplicar el filtro,  
entonces el sistema debe solicitar un monto numérico mayor que cero.  

**CA-05.4 — Eliminación del filtro**

Dado que el cliente tiene activo un filtro de presupuesto,  
cuando selecciona la opción “Quitar filtro”,  
entonces el sistema debe volver a mostrar el menú completo de la sede seleccionada.  

**Justificación (fuente documental):**

Esta historia propone facilitar la elección de platos a clientes que necesitan controlar sus gastos. Al reducir el tiempo de búsqueda en el menú, complementa el objetivo de ofrecer un proceso de pedido más rápido y sencillo en ALESAR.

**Dependencias / relaciones funcionales (propuesta):** HU-02, HU-14.

**Motivo de priorización (propuesta):** Filtro de conveniencia sobre catálogo y disponibilidad.

### HU-06 — Registrar mis datos para realizar un pedido

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 3 SP (propuesta) · **Sprint:** Sprint 1 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero registrar mis datos de contacto al realizar un pedido, para identificar mi compra y recibir las notificaciones correspondientes.

**Criterios de aceptación BDD (texto fuente):**

**CA-06.1 — Registro de datos del cliente**

Dado que el cliente desea realizar un pedido,  
cuando ingresa sus datos de contacto,  
entonces el sistema debe solicitar como mínimo su nombre y número de WhatsApp.  

**CA-06.2 — Validación del número de WhatsApp**

Dado que el cliente ingresa su número de WhatsApp,  
cuando intenta continuar con el proceso de compra,  
entonces el sistema debe validar que el número tenga un formato válido.  

**CA-06.3 — Datos incompletos**

Dado que el cliente no ha completado los datos obligatorios,  
cuando intenta continuar con el pedido,  
entonces el sistema debe indicar qué información falta y no permitir avanzar hasta completarla.  

**CA-06.4 — Asociación de los datos al pedido**

Dado que el cliente ingresó correctamente sus datos,  
cuando el pedido sea confirmado,  
entonces el sistema debe asociar el nombre y número de WhatsApp al pedido realizado.  

**Criterios de aceptación añadidos (ampliación aprobada 2026-10-21; NO forman parte del Word original):**

**CA-06.5 — Ingreso y formato de DNI**

Dado que el cliente desea continuar con el pedido,  
cuando registra su identificación,  
entonces el sistema debe solicitar un DNI peruano de ocho dígitos y rechazar formatos inválidos antes de continuar.  

**CA-06.6 — Validación de DNI en Neon simulado**

Dado que existe una base de identidades institucionales **ficticias** en Neon `development`, con estudiantes, docentes e invitados autorizados,  
cuando el cliente ingresa su DNI y solicita validación,  
entonces el sistema debe comprobar su presencia y habilitación en dicha base y permitir continuar si es válido.  

**CA-06.7 — DNI no registrado o inactivo**

Dado que el DNI no existe, figura inactivo o la consulta no puede completarse,  
cuando el cliente intenta continuar,  
entonces el sistema debe impedir la confirmación y mostrar un mensaje adecuado sin revelar datos de otras identidades.  

**Justificación (fuente documental):**

Esta historia permite identificar al cliente y asociar sus datos de contacto al pedido sin obligarlo a crear una cuenta institucional. Además, permite que estudiantes, docentes, trabajadores y visitantes puedan utilizar AllInstant y recibir las notificaciones relacionadas con su pedido.

**Dependencias / relaciones funcionales (propuesta):** HU-01, HU-03, HU-10.

**Motivo de priorización (propuesta):** Datos de contacto para asociar e informar sobre los pedidos.

> **Acuerdo de ampliación aprobado (D-03):** se incorporan CA-06.5 a CA-06.7, conservando CA-06.1 a CA-06.4 originales. La **HU-06 sigue asignada al Sprint 1**; la validación DNI en base Neon **simulada** será trabajo adicional del Sprint 2. No se crea una HU nueva ni se utilizan datos reales en las pruebas. Se mantiene la estimación original de 3 SP como referencia histórica; la ampliación requiere revisión de esfuerzo técnico en el Sprint Backlog 2.

### HU-07 — Consultar el seguimiento de mi pedido desde la web

**Prioridad:** Should (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 2 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero consultar desde la página web el estado de mi pedido, para conocer su avance sin depender únicamente de las notificaciones por WhatsApp.

**Criterios de aceptación BDD (texto fuente):**

**CA-07.1 — Consulta del estado actual**

Dado que el cliente tiene un pedido activo,  
cuando accede al seguimiento de su pedido,  
entonces el sistema debe mostrar el estado actual del pedido.  

**CA-07.2 — Visualización de los estados**

Dado que el cliente consulta un pedido activo,  
cuando visualiza su seguimiento,  
entonces el sistema debe indicar si el pedido se encuentra en estado “Pedido recibido”, “Preparando comida” o “Comida lista para recojo”.  

**CA-07.3 — Actualización del seguimiento**

Dado que el personal de ALESAR ha actualizado el estado de un pedido,  
cuando el cliente vuelve a consultar su seguimiento,  
entonces la página debe mostrar el nuevo estado registrado.  

**CA-07.4 — Identificación del pedido**

Dado que el cliente consulta el seguimiento de un pedido,  
cuando visualiza su información,  
entonces el sistema debe mostrar un identificador que permita reconocer a qué pedido corresponde.  

**Criterio de aceptación añadido (decisión aprobada 2026-10-21; NO forma parte del Word original):**

**CA-07.5 — Vencimiento del enlace de seguimiento**

Dado que el cliente dispone del enlace único de seguimiento de su pedido,  
cuando transcurren **24 horas desde que el pedido quedó registrado en `ENTREGADO`**,  
entonces el enlace debe expirar y la página no debe revelar información del pedido.  

**Justificación (fuente documental):**

Esta historia permite que el cliente consulte directamente desde la página web el avance de su pedido, incluso si no revisa o no recibe una notificación por WhatsApp. De esta manera, la plataforma funciona como un medio adicional para conocer cuándo el pedido está listo para recojo.

**Dependencias / relaciones funcionales (propuesta):** HU-09, HU-11, HU-13.

**Motivo de priorización (propuesta):** Consulta pública adicional al canal de WhatsApp.

> **Acuerdo aprobado (D-07):** enlace único no adivinable enviado al cliente; expirará **24 horas después de la entrega**, no 24 horas después de la compra. El enlace no sustituye el código de recojo; hasta que ocurra la entrega debe permanecer consultable salvo revocación de seguridad. No se exponen DNI, WhatsApp ni datos sensibles en la vista pública.

### HU-08 — Obtener el comprobante de mi pedido

**Prioridad:** Should (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 3 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero obtener un comprobante después de confirmar mi compra, para contar con un registro del pedido realizado.

**Criterios de aceptación BDD (texto fuente):**

**CA-08.1 — Generación del comprobante**

Dado que el pago del pedido fue aprobado correctamente,  
cuando el sistema registra la compra,  
entonces debe generar un comprobante asociado al pedido.  

**CA-08.2 — Información del comprobante**

Dado que el comprobante fue generado,  
cuando el cliente lo visualiza,  
entonces debe mostrar los productos comprados, cantidades, precios y monto total pagado.  

**CA-08.3 — Consulta del comprobante**

Dado que el cliente tiene un pedido confirmado,  
cuando accede al detalle de dicho pedido,  
entonces debe poder consultar el comprobante correspondiente.  

**CA-08.4 — Pago no confirmado**

Dado que el pago fue rechazado o no llegó a confirmarse,  
cuando el cliente consulta la operación,  
entonces el sistema no debe generar un comprobante de compra.  

**Justificación (fuente documental):**

Esta historia permite que el cliente cuente con un registro de la compra realizada. El comprobante se genera únicamente cuando el pago ha sido confirmado correctamente, evitando registrar operaciones incompletas o rechazadas.

**Dependencias / relaciones funcionales (propuesta):** HU-10, HU-09.

**Motivo de priorización (propuesta):** Registro consultable de compras confirmadas.

### HU-09 — Recoger mi pedido mediante un código único

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 2 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero recibir un código único para identificar mi pedido, para recogerlo rápidamente y evitar confusiones con los pedidos de otros clientes.

**Criterios de aceptación BDD (texto fuente):**

**CA-09.1 — Generación del código**

Dado que el pago del pedido fue aprobado correctamente,  
cuando el sistema registra el pedido,  
entonces debe generar un código único asociado exclusivamente a dicha compra.  

**CA-09.2 — Envío del código**

Dado que el pedido cuenta con un código único,  
cuando la compra queda confirmada,  
entonces el sistema debe enviar el código al número de WhatsApp registrado por el cliente.  

**CA-09.3 — Identificación durante el recojo**

Dado que el pedido se encuentra en estado “Comida lista para recojo”,  
cuando el cliente proporciona su código al personal de ALESAR,  
entonces el sistema debe permitir identificar el pedido correspondiente.  

**CA-09.4 — Confirmación de entrega**

Dado que el personal de ALESAR ha identificado correctamente el pedido,  
cuando entrega la comida y selecciona la opción “Entregar pedido”,  
entonces el sistema debe cambiar su estado a “Entregado”.  

**CA-09.5 — Cierre del pedido**

Dado que un pedido ha sido marcado como “Entregado”,  
cuando se actualiza la lista de pedidos activos,  
entonces dicho pedido debe dejar de aparecer como pendiente y no debe poder regresar a un estado anterior.  

**Justificación (fuente documental):**

Esta historia completa el proceso de recojo del pedido. El código único facilita que el personal de ALESAR identifique la compra correcta y disminuye el riesgo de confundir pedidos entre clientes. Además, el estado “Entregado” permite identificar claramente cuándo finaliza la atención del pedido.

**Dependencias / relaciones funcionales (propuesta):** HU-10, HU-11, HU-13.

**Motivo de priorización (propuesta):** Identificación segura y cierre del proceso de entrega.

### HU-10 — Pagar mi pedido desde la web

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 13 SP (propuesta) · **Sprint:** Sprint 1 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como cliente de ALESAR, quiero pagar mi pedido mediante Yape o tarjeta desde la página web, para completar mi compra antes de llegar al establecimiento.

**Criterios de aceptación BDD (texto fuente):**

**CA-10.1 — Selección del medio de pago**

Dado que el cliente ha confirmado los productos de su pedido,  
cuando continúa al proceso de pago,  
entonces el sistema debe permitir seleccionar entre Yape o tarjeta.  

**CA-10.2 — Pago aprobado**

Dado que el cliente ha seleccionado un medio de pago,  
cuando la transacción sea aprobada correctamente,  
entonces el sistema debe registrar el pago como realizado y confirmar el pedido.  

**CA-10.3 — Pago rechazado**

Dado que el cliente intenta realizar el pago,  
cuando la transacción sea rechazada,  
entonces el sistema debe informar que el pago no pudo completarse y no debe confirmar el pedido.  

**CA-10.4 — Confirmación del monto**

Dado que el cliente se encuentra antes de efectuar el pago,  
cuando visualiza el resumen de compra,  
entonces el sistema debe mostrar el monto total que será pagado.  

**Justificación (fuente documental):**

Esta historia permite que el cliente complete el pago antes de acudir a la cafetería, reduciendo las actividades que debe realizar presencialmente y contribuyendo a disminuir el tiempo de atención durante el recojo.

**Dependencias / relaciones funcionales (propuesta):** HU-01, HU-02, HU-06.

**Motivo de priorización (propuesta):** Confirmación de compra supeditada a un pago aprobado.

> **Decisión aprobada (D-06):** HU-10 se seleccionó en Sprint 1 para prototipado, pero **su integración con pagos reales Yape/tarjeta queda comprometida como trabajo pendiente de Sprint 2**. Se requiere un proveedor/pasarela habilitada, confirmación verificable **desde servidor**, conciliación de estados e idempotencia de callbacks; nunca aceptar `paid: true` declarado desde el navegador. Si no existe un proveedor real habilitado, la funcionalidad no se considera completada por tener solo mocks. **El Sprint Backlog 2 existente debe recibir tareas adicionales explícitas de frontend, backend, pruebas y aceptación para cubrir este alcance antes de su ejecución.**

### HU-11 — Visualizar los pedidos recibidos

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 5 SP (propuesta) · **Sprint:** Sprint 1 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como personal de ALESAR, quiero visualizar los pedidos realizados para mi sede, para conocer qué pedidos deben ser atendidos y preparados.

**Criterios de aceptación BDD (texto fuente):**

**CA-11.1 — Visualización de pedidos de la sede**

Dado que existen pedidos registrados para una sede,  
cuando el personal accede a la sección de pedidos,  
entonces el sistema debe mostrar los pedidos correspondientes a dicha sede.  

**CA-11.2 — Identificación del pedido**

Dado que existen varios pedidos registrados,  
cuando el personal visualiza la lista,  
entonces cada pedido debe mostrar un identificador que permita diferenciarlo de los demás.  

**CA-11.3 — Visualización del estado**

Dado que un pedido se encuentra registrado,  
cuando aparece en la lista de pedidos,  
entonces el personal debe poder visualizar su estado actual.  

**CA-11.4 — Nuevos pedidos**

Dado que un cliente confirma correctamente un nuevo pedido,  
cuando el personal actualiza o vuelve a consultar la lista,  
entonces el nuevo pedido debe aparecer entre los pedidos pendientes de atención.  

**Justificación (fuente documental):**

Esta historia permite que el personal conozca los pedidos digitales que deben prepararse y facilita su organización dentro de cada sede de ALESAR.

**Dependencias / relaciones funcionales (propuesta):** HU-10, HU-12, HU-13.

**Motivo de priorización (propuesta):** Habilita a las áreas operativas a visualizar pedidos por sede.

### HU-12 — Consultar el detalle de un pedido

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 3 SP (propuesta) · **Sprint:** Sprint 3 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como personal de ALESAR, quiero consultar el detalle de un pedido recibido, para conocer los productos y cantidades que debo preparar.

**Criterios de aceptación BDD (texto fuente):**

**CA-12.1 — Acceso al detalle**

Dado que el personal visualiza la lista de pedidos de su sede,  
cuando selecciona uno de ellos,  
entonces el sistema debe mostrar el detalle del pedido seleccionado.  

**CA-12.2 — Productos y cantidades**

Dado que el personal ha abierto el detalle de un pedido,  
cuando consulta su información,  
entonces debe visualizar los productos solicitados y la cantidad correspondiente de cada uno.  

**CA-12.3 — Información para el recojo**

Dado que el pedido tiene asociado un código único,  
cuando el personal consulta sus detalles,  
entonces el sistema debe mostrar dicho código para facilitar su identificación durante el recojo.  

**CA-12.4 — Información de sede y recojo**

Dado que el pedido pertenece a una sede y posee información de recojo,  
cuando el personal consulta el detalle,  
entonces debe visualizar la sede correspondiente y, si fue seleccionado, el horario de recojo.  

**Justificación (fuente documental):**

Esta historia proporciona al personal la información necesaria para preparar correctamente cada pedido y reduce el riesgo de errores relacionados con productos, cantidades o identificación de la compra.

**Dependencias / relaciones funcionales (propuesta):** HU-11, HU-09.

**Motivo de priorización (propuesta):** Información necesaria para preparar y entregar correctamente.

### HU-13 — Actualizar el estado de un pedido

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 8 SP (propuesta) · **Sprint:** Sprint 2 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como personal de ALESAR, quiero actualizar el estado de los pedidos durante su preparación, para mantener informado al cliente sobre el avance de su compra.

**Criterios de aceptación BDD (texto fuente):**

**CA-13.1 — Inicio de preparación**

Dado que un pedido se encuentra en estado “Pedido recibido”,  
cuando el personal inicia su preparación,  
entonces debe poder cambiar el estado a “Preparando comida”.  

**CA-13.2 — Pedido listo**

Dado que un pedido se encuentra en estado “Preparando comida”,  
cuando la preparación haya finalizado,  
entonces el personal debe poder cambiar su estado a “Comida lista para recojo”.  

**CA-13.3 — Actualización visible para el cliente**

Dado que el personal ha actualizado correctamente el estado de un pedido,  
cuando el cliente consulta el seguimiento desde la web,  
entonces debe visualizar el nuevo estado registrado.  

**CA-13.4 — Notificación del cambio**

Dado que el estado del pedido fue actualizado,  
cuando el cambio quede registrado correctamente,  
entonces el sistema debe iniciar el envío de la notificación correspondiente al cliente por WhatsApp.  

**Justificación (fuente documental):**

Esta historia permite registrar el avance real de cada pedido y conecta el trabajo del personal con las funciones de seguimiento y notificación utilizadas por el cliente.

**Dependencias / relaciones funcionales (propuesta):** HU-11, HU-12, HU-09, HU-03.

**Motivo de priorización (propuesta):** Coordina preparación, despacho y cambios visibles.

> **Decisión operacional aprobada (D-05):** para pedidos **nuevos**, el pago validado da de alta el pedido directamente en `PREPARANDO` (T11.3); cocina **solo comunica** preparación finalizada, sin cambiar el estado; despacho confirma `LISTO_RECOJO` y luego `ENTREGADO` con código. El CA-13.1 original se conserva para trazabilidad, pero su cambio manual `RECIBIDO → PREPARANDO` no aplica al flujo normal nuevo; se comprobará para pedidos históricos solo cuando corresponda. Los criterios y pruebas de Sprint 2 deben reflejar expresamente esta equivalencia aprobada, sin fingir que se ejecutó una transición manual en la operación nueva.

### HU-14 — Actualizar la disponibilidad de productos

**Prioridad:** Must (ratificada por solicitante) · **Estimación:** 8 SP (propuesta) · **Sprint:** Sprint 2 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como personal de ALESAR, quiero actualizar la disponibilidad de los productos de mi sede, para evitar que los clientes realicen pedidos de productos que no pueden ser preparados.

**Criterios de aceptación BDD (texto fuente):**

**CA-14.1 — Marcar producto como agotado**

Dado que un producto ya no se encuentra disponible en una sede,  
cuando el personal lo marque como agotado,  
entonces el sistema debe actualizar su disponibilidad.  

**CA-14.2 — Restricción para el cliente**

Dado que un producto fue marcado como agotado,  
cuando un cliente consulte el menú de esa sede,  
entonces debe visualizarlo como no disponible y no debe poder agregarlo a su pedido.  

**CA-14.3 — Restablecer disponibilidad**

Dado que un producto previamente agotado vuelve a estar disponible,  
cuando el personal cambie su estado a disponible,  
entonces el cliente debe poder visualizarlo nuevamente como una opción seleccionable.  

**CA-14.4 — Actualización por sede**

Dado que un producto puede tener distinta disponibilidad entre SMP y La Molina,  
cuando el personal actualice su disponibilidad,  
entonces el cambio debe aplicarse únicamente a la sede correspondiente.  

**Criterios de aceptación añadidos (ampliación aprobada 2026-10-21; NO forman parte del Word original):**

**CA-14.5 — Agregar producto al catálogo de una sede**

Dado que el personal autorizado administra el catálogo de su sede,  
cuando registra un producto con nombre, categoría, descripción y precio válidos,  
entonces el sistema debe incorporarlo al catálogo de esa sede sin habilitarlo automáticamente en otra sede.  

**CA-14.6 — Editar producto de una sede**

Dado que un producto está asociado a la sede del personal autorizado,  
cuando modifica sus datos editables y guarda los cambios,  
entonces el sistema debe actualizar la información del catálogo de su sede y conservar los importes históricos de pedidos ya confirmados.  

**CA-14.7 — Eliminar (retirar lógicamente) un producto de una sede**

Dado que un producto se ofrece en una sede,  
cuando el personal solicita eliminarlo y confirma la operación,  
entonces el sistema debe retirarlo de las futuras compras **de esa sede** sin borrar los productos de pedidos históricos ni afectar la oferta de otras sedes.  

**Justificación (fuente documental):**

Esta historia ayuda a mantener actualizado el catálogo y evita que se confirmen pedidos de productos agotados. Además, está directamente relacionada con el objetivo del proyecto de mantener en 5 % o menos los pedidos afectados por falta de disponibilidad.

**Dependencias / relaciones funcionales (propuesta):** HU-02.

**Motivo de priorización (propuesta):** Permite al personal corregir agotados y restaurar la oferta.

> **Acuerdo aprobado (D-04):** se añaden CA-14.5 a CA-14.7 sin eliminar CA-14.1 a CA-14.4. La eliminación se interpreta como **retiro lógico por sede** para preservar relaciones y pedidos históricos. La edición de productos compartidos entre sedes requiere un modelo de datos que distinga atributos globales y atributos por sede; no se permite modificar LM indirectamente desde SMP. La ampliación requiere comprobar capacidad y pruebas en el Sprint Backlog 2.

### HU-15 — Consultar reportes de ventas y pedidos por sede

**Prioridad:** Should (ratificada por solicitante) · **Estimación:** 8 SP (propuesta) · **Sprint:** Sprint 3 · **Estado:** Pendiente

**Historia de usuario (fuente documental):**

> Como administrador de ALESAR, quiero consultar reportes de ventas y pedidos realizados mediante AllInstant, para evaluar el desempeño de cada sede y tomar decisiones que mejoren la atención y los ingresos del negocio.

**Criterios de aceptación BDD (texto fuente):**

**CA-15.1 — Visualización del reporte de ventas**

Dado que el administrador ha iniciado sesión en el sistema,  
cuando accede a la sección de reportes,  
entonces el sistema debe mostrar la cantidad de pedidos realizados y el monto total de ventas confirmadas mediante AllInstant.  

**CA-15.2 — Filtrado por sede**

Dado que el administrador está consultando los reportes,  
cuando selecciona la sede de San Martín de Porres o La Molina,  
entonces el sistema debe mostrar únicamente los pedidos y ventas correspondientes a la sede seleccionada.  

**CA-15.3 — Filtrado por fechas**

Dado que el administrador desea analizar un periodo específico,  
cuando selecciona una fecha de inicio y una fecha de fin válidas,  
entonces el sistema debe mostrar los resultados correspondientes al periodo seleccionado.  

**CA-15.4 — Identificación de productos más vendidos**

Dado que existen pedidos con pagos confirmados en el periodo seleccionado,  
cuando el administrador consulta el reporte de productos,  
entonces el sistema debe mostrar los productos más vendidos, ordenados según la cantidad de unidades vendidas.  

**CA-15.5 — Exclusión de pagos no confirmados**

Dado que existen intentos de pago rechazados o no confirmados,  
cuando el sistema genera los reportes de ventas,  
entonces no debe incluir dichas operaciones en el monto total de ventas confirmadas.  

**Justificación (fuente documental):**

Esta historia permite al administrador evaluar el rendimiento de AllInstant en ambas sedes de ALESAR. Mediante los reportes de ventas, pedidos y productos más vendidos, podrá identificar patrones de consumo y tomar decisiones para mejorar la operación del negocio. Además, facilitará la medición de resultados económicos del proyecto.

**Dependencias / relaciones funcionales (propuesta):** HU-10, HU-08, HU-09.

**Motivo de priorización (propuesta):** Medición comercial y de productos vendidos sin pagos rechazados.

## 5. Relaciones entre HU y plan de entregas

### 5.1. Sprint 1 — selección histórica verificada

**HU-01, HU-02, HU-06, HU-10, HU-11.** El Sprint Planning oficial del repositorio registra **25 tareas** y **55 horas estimadas**, del **15 al 16 de octubre de 2026**. La documentación define entregas con alcance acotado; esto no prueba que pagos reales y el flujo completo cliente→backend estén terminados.

### 5.2. Sprint 2 — cinco historias confirmadas y trabajos trasladados

| HU | Funcionalidad oficial del Word | Relación con las cinco líneas de trabajo acordadas |
|---|---|---|
| **HU-03** | Recibir el estado del pedido | Notificaciones reales por WhatsApp |
| **HU-07** | Consultar el seguimiento de mi pedido desde la web | Seguimiento por enlace único |
| **HU-09** | Recoger mi pedido mediante un código único | Identificación y confirmación de entrega por despacho |
| **HU-13** | Actualizar el estado de un pedido | Estados y flujo operativo de despacho |
| **HU-14** | Actualizar la disponibilidad de productos | Disponibilidad y CRUD por sede — ampliación aprobada |

**Trabajos adicionales aprobados para Sprint 2 que no cambian el conjunto de cinco HU principales:**

- **HU-06 (arrastre/ampliación):** implementar validación de DNI con base **simulada** de estudiantes, docentes e invitados en Neon, según nuevos CA-06.5 a CA-06.7. No existe HU-16.
- **HU-10 (trabajo no completado en Sprint 1):** integrar pago **real** mediante Yape o tarjeta, de forma que solo pagos confirmados por servidor permitan crear un pedido confirmado. Es una dependencia crítica de HU-03, HU-07 y HU-09.
- **Infraestructura y migración:** migrar la web de clientes Vite→Next.js y completar interconexiones existentes; son tareas técnicas, no HU.

**Impacto de capacidad:** el Sprint Backlog 2 creado antes de esta decisión contiene tareas de catálogo, seguimiento y WhatsApp, **pero no contempla como entrega propia todo el pago real**. Debe actualizarse con responsables, contratos, integración con proveedor real y pruebas de pago aprobado/rechazado. Por tanto, aunque la selección de 5 HU principales se confirma, **la capacidad de una semana no está validada** hasta reestimar este trabajo incorporado.

### 5.3. Sprint 3 — asignación confirmada por solicitante

**HU-04, HU-05, HU-08, HU-12, HU-15**. El solicitante confirmó esta selección. La capacidad, dependencias y fechas deberán concretarse en Sprint Planning 3. Aunque HU-12 figure como PBI pendiente, hay visualización parcial de productos/cantidades en tareas del Sprint 1; debe auditarse para evitar duplicaciones.

## 6. Registro de decisiones — discrepancias resueltas

**Fecha de decisiones:** 21/10/2026. **Fuente:** respuestas del solicitante en la planificación del Product Backlog. Son decisiones aprobadas para la **especificación del proyecto**; ello no implica que los trabajos estén implementados ni sustituye la aceptación formal del Product Owner/equipo sobre el documento versionado.

| ID | Tema | Decisión confirmada | Impacto / seguimiento |
|---|---|---|---|
| **D-01** | Prioridades MoSCoW | **Mantener** la clasificación existente. | Prioridad confirmada por solicitante; registrar aceptación formal en revisión del backlog. |
| **D-02** | Story Points | **Mantener** Fibonacci y los SP incluidos como **estimaciones propuestas**. | Refinar colectivamente; no presentarlos como horas ni valores medidos. |
| **D-03** | DNI institucional | **Ampliar HU-06** con BDD adicionales. | CA-06.5 a CA-06.7; Neon ficticio; ejecución Sprint 2. |
| **D-04** | Productos | **Ampliar HU-14** para crear, editar y eliminar productos por sede. | CA-14.5 a CA-14.7; eliminación lógica y preservación histórica. |
| **D-05** | Estados operativos | **Conservar** alta automática `PREPARANDO`; cocina avisa; despacho marca `LISTO_RECOJO` y `ENTREGADO`. | Criterios originales se preservan; se documenta equivalencia para pedidos nuevos. |
| **D-06** | Pago real | **Implementar en Sprint 2** el pago real de HU-10, que tuvo prototipo en Sprint 1. | Añadir tareas al Sprint Backlog 2 y habilitar proveedor/entorno seguro; sin falsificar confirmaciones. |
| **D-07** | Seguimiento por enlace | **Enlace único con vencimiento 24 h después de `ENTREGADO`**. | CA-07.5; revocación y no exposición de información personal. |
| **D-08** | Sprint 3 | **Confirmar** HU-04, HU-05, HU-08, HU-12 y HU-15. | Fechas/capacidad a detallar en su Sprint Planning. |

### 6.1. Alineación obligatoria de documentación y desarrollo

1. **Actualizar Sprint Backlog 2:** reemplazar aliases `HU.A`…`HU.E` por códigos oficiales y distribuir las tareas relacionadas con HU-06 y HU-10. Correspondencias principales: **notificaciones → HU-03**, **seguimiento → HU-07**, **código de recojo → HU-09**, **estados/despacho → HU-13**, **disponibilidad/CRUD → HU-14**.
2. **No dar por terminada HU-10:** el pago real debe verificar aprobación con un proveedor legítimo desde servidor; manejar rechazados, duplicados e interrupciones. Ningún botón o mock puede convertir un pago en aprobado.
3. **Confirmar dependencias externas al inicio del sprint:** proveedor de pago compatible con el alcance Yape/tarjeta, credenciales/entorno de prueba; Meta WhatsApp Business, plantillas y webhook seguro; migraciones Neon limitadas a `development`. Sin estos elementos, registrar bloqueos y no atribuir evidencia de pagos o mensajes reales.
4. **Conservar el historial:** los cambios de productos, estados y enlaces deben ser aditivos, proteger pedidos ya confirmados y mantener las pruebas del Sprint 1.
5. **Actualizar la fuente maestra de HU:** este Markdown registra las ampliaciones aprobadas, pero el Word `HISTORIAS DE USUARIO_v2.docx` **todavía no las incluye**. Si el equipo mantiene el Word como autoridad documental, publicar una versión v3 con los nuevos criterios y referencia a estas decisiones.

## 7. Definition of Ready y Definition of Done

### Definition of Ready (DoR) para seleccionar una HU en un sprint

- Código y texto del Product Backlog validados contra `HISTORIAS DE USUARIO_v2.docx`.
- Prioridad, alcance y criterios BDD revisados; las ampliaciones D-03, D-04 y D-07 quedan identificadas frente al Word original.
- Dependencias/limitaciones verificadas (pago, API de WhatsApp, Neon, acceso por sede, etc.).
- Estimación relativa propuesta o refinada de forma explícita; capacidad y responsables de ejecución registrados en Sprint Backlog (incluyendo HU-10 real en Sprint 2).
- Contratos técnicos acordados antes de implementación paralela, sin confundirlos con requisitos del PBI.

### Definition of Done (DoD) de una HU

- Criterios BDD satisfechos y evidenciados mediante pruebas reproducibles.
- Código revisado mediante Pull Request y comprobaciones automatizadas que correspondan.
- Integración comprobada en ambas sedes cuando aplique, sin afectar funcionalidades previas.
- Documentación, controles de seguridad, evidencias y limitaciones actualizadas en el sprint.
- Product Owner/equipo acepta el incremento conforme a la historia; actualizar estado de la HU en este documento a partir de esa decisión.

## 8. Trazabilidad y fuentes

| Fuente | Rol en el Product Backlog | Referencia |
|---|---|---|
| **Historias de Usuario v2** | **Fuente textual original** para enunciados, títulos, justificaciones y 63 criterios BDD HU-01 a HU-15. Las 7 ampliaciones adicionales se aprueban después y están rotuladas. | `HISTORIAS DE USUARIO_v2.docx` (archivo aportado por el equipo) |
| Sprint Planning — Sprint 1 | **Autoridad** para selección 5 HU, 25 tareas, 55 h y fechas del Sprint 1. | [Ver en GitHub](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Sprint%20Planning/README.md) |
| Product Backlog Items — Sprint 1 | Corrobora alcance y referencias del Sprint 1; declara pendiente la prioridad relativa de PBI. | [Ver en GitHub](https://github.com/Marco404-Dev/Alesar/blob/main/Sprint%201/Product%20Backlog%20Item/README.md) |
| Diseño de disponibilidad y operación T11.3/T11.4 | Contexto técnico para dependencias y discrepancias, no reemplaza el texto de HU. | [Documentación en GitHub](https://github.com/Marco404-Dev/Alesar/tree/main/Sprint%201/Documentacion) |
| Acuerdos del solicitante — 21/10/2026 | **Decisiones ratificadas D-01 a D-08**: MoSCoW, SP propuestos, sprints, BDD añadidos, pago real, estados y caducidad. | Respuestas registradas en la conversación del proyecto; `SPRINT_2_BACKLOG.md` requiere alineación para HU-10 real |

## 9. Publicación y gobierno de cambios

1. Subir este archivo a **`Product Backlog/PRODUCT_BACKLOG.md`** en una rama de documentación y abrir PR.
2. Hacer constar que **el solicitante confirmó MoSCoW, distribución y decisiones D-01 a D-08**, pero los Story Points se mantienen propuestos y la aceptación formal del Product Owner/equipo aún debe registrarse.
3. Actualizar el Sprint Backlog 2 para incluir el **pago real HU-10** y alinear los códigos oficiales (HU-03/06/07/09/10/13/14). Revisar capacidad de la semana antes de comprometer todas las entregas.
4. Tras la revisión del equipo, registrar fecha, aprobadores y versión aceptada; conservar explícita la diferencia entre BDD originales del Word y criterios añadidos en v1.1.
5. Enlazar desde README y Sprint Planning; los Issues deben usar **HU-01…HU-15**, sin alias `HU.A…HU.E`.
6. Revisar tras cada Sprint Review; no registrar `Done` por cerrar solo las tareas técnicas si los criterios BDD no han sido verificados.

---

*Documento maestro de requisitos AllInstant — ALESAR, v1.1. Fuente de las 15 HU: Word v2. Las 63 condiciones BDD originales se preservan y se distinguen de 7 criterios añadidos por decisiones expresas de 21/10/2026. MoSCoW y sprints ratificados por el solicitante; Story Points propuestos para refinamiento. Su aprobación formal y la sincronización del Sprint Backlog 2 siguen pendientes.*
