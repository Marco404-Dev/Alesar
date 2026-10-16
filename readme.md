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
| **StarUML (UML)** | Diagramas de actividades y modelos editables (`.mdj`) |
| **Figma** | Diseño y prototipado; [abrir prototipo](https://www.figma.com/design/w1Kpyyg6ZOSXDVEe60AUfq/Untitled?node-id=0-1&p=f) |
| **GitHub** | Control de versiones y organización de entregables por sprint |

No se atribuye todavía al proyecto un framework frontend, un backend ni una pasarela de pago integrada porque no se ha verificado su implementación en este repositorio.

## Avances y recursos

El repositorio contiene documentación funcional, diagramas, scripts SQL y pruebas. También dispone de carpetas para las entregas de tres sprints.

| Recurso | Enlace |
|:--|:--|
| **Sprint 1** | [Documentación, modelado y pruebas](./Sprint%201) |
| **Sprint 2** | [Scripts de base de datos y entregables](./Sprint%202) |
| **Sprint 3** | [Estructura de entregables](./Sprint%203) |
| **Modelo de pedidos y estados** | [Script SQL](./Sprint%202/Codigo/Base%20de%20Datos/T11.2_estructura_pedidos_y_estados.sql) |
| **Pruebas SQL** | [Script de pruebas](./Sprint%201/Pruebas/Codigo/T11.2_pruebas_pedidos_y_estados.sql) |
| **Prototipo en Figma** | [Ver diseño](https://www.figma.com/design/w1Kpyyg6ZOSXDVEe60AUfq/Untitled?node-id=0-1&p=f) |

<p align="center"><img src="https://capsule-render.vercel.app/api?type=rect&color=0:422719,100:D93600&height=4&section=header" width="100%" alt="Separador" /></p>

<p align="center">
  <strong>AlInstant · Experiencia de compra más ágil, preparación mejor organizada.</strong>
</p>
<p align="center"><sub>Proyecto académico en desarrollo · UPCH</sub></p>
