# HU-01 — Realizar un pedido anticipado para recojo

**Proyecto:** AlInstant — ALESAR  
**Sprint:** 1

## Descripción

La HU-01 permite al cliente seleccionar una sede de ALESAR, consultar el catálogo de productos, agregar productos al carrito, modificar cantidades y revisar su pedido antes de continuar al proceso de pago.

## Entregables

| Tarea | Descripción | Evidencia |
|---|---|---|
| T01.1 | Documentar el flujo de compra anticipada | [Flujo de compra](T01.1_Flujo_Compra_Anticipada_ALESAR.md) |
| T01.2 | Elaborar el diagrama de actividades UML | [Diagrama PNG](T01.2_HU01_Diagrama_Actividades.png) · [Archivo StarUML](T01.2_HU01_Diagrama_Actividades.mdj) |
| T01.3 | Diseñar las interfaces de selección de sede y catálogo | [Documentación de interfaces](T01.3_Interfaces_Sede_Catalogo_Responsive.md) |
| T01.4 | Diseñar y enlazar el carrito y resumen de compra | [Carrito y resumen](T01.4_Carrito_y_Resumen_Compra.md) |
| T01.5 | Validar la navegación hacia el proceso de pago | [Validación de navegación](T01.5_Validacion_Navegacion_Pago_Final.md) |

## Funcionalidades implementadas

- Selección de sede: San Martín de Porres o La Molina.
- Visualización del catálogo con productos y precios.
- Adición de productos al carrito y modificación de cantidades.
- Cálculo del total y visualización del resumen del pedido.
- Restricción para continuar con el carrito vacío.
- Navegación hacia una pantalla de pago simulada, con opción de regresar sin perder el pedido.
- Diseño adaptable a celular, tablet y computadora.

## Tecnologías

React, TypeScript, Vite y CSS.

**Código:** [Frontend de AlInstant](../../Codigo/frontend/).

## Evidencia de funcionamiento

[Ver video completo de la HU-01](../../Pruebas/videos/HU01_Funcionamiento.mp4).

## Resultado y alcance

Se implementó y validó el recorrido de compra anticipada de la HU-01 hasta el inicio del pago simulado. El prototipo funciona en el frontend; **no procesa pagos reales ni registra pedidos en una base de datos**.

