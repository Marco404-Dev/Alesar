# Sprint Planning — Sprint 1

**Proyecto:** AllInstant — ALESAR  
**Metodología:** Scrum  
**Técnica de descomposición:** Task Breakdown (descomposición funcional de tareas)  
**Fecha de inicio:** 15 de octubre de 2026  
**Fecha de finalización:** 16 de octubre de 2026  
**Duración:** 2 días calendario  

---

## 1. Propósito del Sprint Planning

Durante la planificación del Sprint 1 se revisaron las historias de usuario del Product Backlog y se seleccionaron cinco historias considerando su importancia para el funcionamiento inicial del sistema, sus dependencias funcionales y el esfuerzo disponible.

Posteriormente, se aplicó la técnica **Task Breakdown (descomposición funcional de tareas)** para dividir las historias seleccionadas en actividades específicas, estimables y verificables.

Las tareas resultantes se organizaron mediante GitHub Issues y GitHub Projects, permitiendo asignar responsabilidades, registrar estimaciones y realizar el seguimiento del trabajo durante el Sprint.

## 2. Objetivo del Sprint 1

**Objetivo propuesto:** construir y validar las funcionalidades iniciales del sistema de pedidos anticipados de ALESAR, incluyendo la selección de sede y productos, consulta de disponibilidad, registro de datos del cliente, navegación hacia el pago y visualización de pedidos recibidos por el personal.

El alcance de cada entrega depende de las tareas acordadas para cada historia de usuario.

En particular, la **HU-01 comprende un prototipo frontend navegable**, sin implicar necesariamente el procesamiento de pagos reales ni el registro de pedidos en la base de datos.

## 3. Técnica utilizada: Task Breakdown

### 3.1. Descripción de la técnica

Para organizar el trabajo del Sprint 1 se utilizó la técnica **Task Breakdown**, también conocida como descomposición funcional de tareas.

Esta técnica consiste en dividir una historia de usuario en actividades más pequeñas y manejables, identificando los trabajos necesarios para implementar y verificar las funcionalidades solicitadas.

La descomposición se realizó tomando como referencia la descripción de cada historia de usuario y sus criterios de aceptación definidos mediante **BDD (Behavior-Driven Development)**, utilizando la estructura Given, When, Then (Dado, Cuando, Entonces).

De esta manera, cada tarea representa una actividad concreta que contribuye al cumplimiento de la historia correspondiente.

### 3.2. Criterios para seleccionar las historias de usuario

La selección de las historias del Sprint 1 consideró los siguientes aspectos:

- **Valor funcional:** importancia de la historia para el funcionamiento inicial del sistema de pedidos anticipados.
- **Dependencias:** relación entre las funcionalidades que deben desarrollarse o representarse conjuntamente.
- **Esfuerzo estimado:** tiempo necesario para completar las actividades identificadas.
- **Capacidad del equipo:** disponibilidad para desarrollar y verificar las tareas durante el Sprint.
- **Alcance del incremento:** funcionalidades que pueden demostrarse mediante prototipos, implementaciones y pruebas.

Estos criterios orientaron la selección de historias del Product Backlog. La técnica Task Breakdown se aplicó posteriormente para descomponerlas en tareas.

### 3.3. Procedimiento aplicado

Para realizar la descomposición funcional se siguieron los siguientes pasos:

1. **Revisión de historias:** se analizaron las historias de usuario seleccionadas del Product Backlog.
2. **Análisis de criterios de aceptación:** se revisaron los escenarios BDD para identificar los comportamientos esperados.
3. **Identificación de actividades:** se determinaron las tareas necesarias de documentación, diseño, base de datos, frontend, backend y pruebas, según correspondiera.
4. **Descomposición de historias:** cada historia seleccionada se dividió en cinco tareas específicas.
5. **Estimación del esfuerzo:** se asignó una duración estimada en horas a cada tarea.
6. **Registro en GitHub:** las tareas se organizaron mediante Issues y se incorporaron al tablero del proyecto.
7. **Seguimiento:** se utilizaron los estados `To do`, `WIP` y `Done` para controlar el progreso.

### 3.4. Ejemplo de aplicación

**Historia de usuario HU-11: Visualizar los pedidos recibidos**

A partir de esta historia se identificaron actividades relacionadas con:

- Definir las reglas de visualización de pedidos.
- Revisar la estructura de datos necesaria para obtener los pedidos.
- Implementar la interfaz de cocina.
- Desarrollar la visualización correspondiente al despacho.
- Realizar las validaciones y pruebas de funcionamiento.

Este procedimiento permitió transformar una funcionalidad general en tareas técnicas concretas, facilitando su estimación, asignación y seguimiento.

## 4. Historias seleccionadas para el Sprint 1

Se seleccionaron **5 historias de usuario**, descompuestas en **25 tareas**, con una estimación total de **55 horas de esfuerzo**.

| Historia | Alcance de trabajo planificado | Tareas | Estimación |
|---|---|---|---:|
| **HU-01** | Flujo, diagrama UML, selección de sede, catálogo, carrito, resumen y navegación al pago. | T01.1–T01.5 | **13 h** |
| **HU-02** | Reglas de disponibilidad, modelo de datos, indicadores de agotado y restricciones de selección. | T02.1–T02.5 | **10 h** |
| **HU-06** | Reglas, formulario y validación de datos del cliente; asociación con el pedido. | T06.1–T06.5 | **9 h** |
| **HU-10** | Flujo de pago, diagrama UML, pantallas Yape/tarjeta y escenarios aprobado/rechazado. | T10.1–T10.5 | **12 h** |
| **HU-11** | Reglas y estructura de pedidos, vistas de cocina y despacho, y validaciones. | T11.1–T11.5 | **11 h** |
| **Total** | **5 historias de usuario** | **25 tareas** | **55 h** |

Las 55 horas representan el esfuerzo estimado acumulado de las tareas, no la duración calendario del Sprint. Las actividades pueden desarrollarse en paralelo según su asignación y dependencias.

La descomposición detallada, los responsables y los estados de las tareas se consultan en:

- [GitHub Issues — Alesar](https://github.com/Marco404-Dev/Alesar/issues)
- [Repositorio del proyecto](https://github.com/Marco404-Dev/Alesar)

## 5. Organización y dependencias

### 5.1. Gestión de tareas

Para el seguimiento de las actividades se utilizó GitHub Projects, organizando las tareas mediante los siguientes estados:

| Estado | Descripción |
|---|---|
| `To do` | Tarea pendiente de iniciar. |
| `WIP` | Tarea en proceso de desarrollo. |
| `Done` | Tarea finalizada de acuerdo con el alcance y las verificaciones correspondientes. |

### 5.2. Herramientas de trabajo

- **Gestión:** GitHub Issues y GitHub Projects.
- **Control de versiones:** Git y GitHub.
- **Desarrollo:** ramas de trabajo e integración mediante Pull Requests hacia `main`.
- **Documentación:** archivos correspondientes a cada historia en `Sprint 1/Documentacion/`.
- **Pruebas:** capturas, registros y videos en `Sprint 1/Pruebas/`.
- **Coordinación:** reuniones Daily Scrum para comunicar avances, próximas actividades e impedimentos.

### 5.3. Dependencias funcionales

Las historias seleccionadas mantienen relaciones funcionales dentro del proceso de pedidos anticipados:

- **HU-01:** establece el flujo principal de selección de sede, productos y generación del pedido.
- **HU-02:** determina la disponibilidad de productos que pueden seleccionarse en la HU-01.
- **HU-06:** permite registrar los datos necesarios para identificar al cliente y asociarlo con su pedido.
- **HU-10:** contempla el proceso de pago y los escenarios de aprobación o rechazo.
- **HU-11:** permite al personal visualizar los pedidos recibidos para su atención.

Estas dependencias orientan la organización de las tareas, pero no implican que toda la integración técnica entre las historias esté finalizada durante el Sprint 1.

## 6. Entregables y criterios de revisión

Cada historia de usuario será evaluada considerando:

- Cumplimiento de sus criterios de aceptación definidos en BDD.
- Finalización de las tareas comprometidas según el alcance planificado.
- Disponibilidad de la documentación técnica correspondiente.
- Evidencias de funcionamiento mediante capturas o videos.
- Resultados de las pruebas realizadas.
- Registro y seguimiento de actividades mediante GitHub Issues.

La finalización individual de una tarea no implica necesariamente que toda la historia o el sistema completo estén integrados.

### Evidencias de HU-01

- [Documentación de HU-01](../Documentacion/HU01/README.md)
- [Video de funcionamiento de HU-01](../Pruebas/videos/HU01_Funcionamiento.mp4)

Las evidencias de las demás historias se incorporan en sus respectivas carpetas de documentación y pruebas.

## 7. Acuerdos y consideraciones

Durante la planificación del Sprint 1 se establecieron los siguientes lineamientos de trabajo:

- Utilizar Scrum como marco de trabajo para organizar el desarrollo.
- Seleccionar cinco historias de usuario del Product Backlog.
- Aplicar **Task Breakdown** para descomponer las historias en tareas técnicas.
- Utilizar los criterios de aceptación BDD como referencia para identificar y verificar actividades.
- Estimar el esfuerzo en horas para cada tarea.
- Registrar las actividades mediante GitHub Issues.
- Controlar su avance mediante GitHub Projects.
- Mantener documentación y evidencias de las funcionalidades desarrolladas.

Los responsables específicos, la capacidad efectiva del equipo y los acuerdos de definición de terminado deberán corresponder con lo establecido por los integrantes durante la planificación.

---

**Referencias:**

- Documento *Historias de Usuario v2* del proyecto AllInstant.
- [Repositorio GitHub — Alesar](https://github.com/Marco404-Dev/Alesar)
- Tareas registradas en GitHub Issues para el Sprint 1.

**Técnica aplicada:** Task Breakdown (descomposición funcional de tareas).  
**Marco de trabajo:** Scrum.  
**Sprint:** 1 — Del 15 al 16 de octubre de 2026.
