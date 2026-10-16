import { useState } from 'react'
import './App.css'

type Pantalla = 'sedes' | 'catalogo' | 'carrito' | 'confirmacion' | 'pago'

type Producto = {
  id: number
  nombre: string
  descripcion: string
  precio: number
  imagen: string
}

const productos: Producto[] = [
  {
    id: 1,
    nombre: 'Lomo Saltado',
    descripcion: 'Con arroz tierno y papas fritas crujientes',
    precio: 12,
    imagen: '/images/lomo-saltado.jpg',
  },
  {
    id: 2,
    nombre: 'Arroz con Pollo',
    descripcion: 'Delicioso arroz verde con presa de pollo y salsa criolla',
    precio: 11.5,
    imagen: '/images/arroz-con-pollo.jpg',
  },
  {
    id: 3,
    nombre: 'Ají de Gallina',
    descripcion: 'Deshilachado de gallina en crema de ají amarillo con papas',
    precio: 11,
    imagen: '/images/aji-de-gallina.jpg',
  },
  {
    id: 4,
    nombre: 'Sándwich de Pollo',
    descripcion: 'Con pollo deshilachado, mayonesa casera y lechuga',
    precio: 6.5,
    imagen: '/images/sandwich-de-pollo.jpg',
  },
  {
    id: 5,
    nombre: 'Jugo Natural',
    descripcion: 'Jugo de frutas de la estación (naranja o papaya)',
    precio: 4,
    imagen: '/images/jugo-natural.jpg',
  },
]

const formatoPrecio = (precio: number) => `S/ ${precio.toFixed(2)}`

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('sedes')
  const [sede, setSede] = useState('San Martín de Porres')
  const [cantidades, setCantidades] = useState<Record<number, number>>({})

  const cambiarCantidad = (id: number, cambio: number) => {
    setCantidades((actuales) => ({
      ...actuales,
      [id]: Math.max(0, (actuales[id] || 0) + cambio),
    }))
  }

  const elegirSede = (nuevaSede: string) => {
    if (nuevaSede !== sede) setCantidades({})
    setSede(nuevaSede)
  }

  const productosElegidos = productos.filter((producto) => (cantidades[producto.id] || 0) > 0)
  const totalUnidades = productos.reduce(
    (suma, producto) => suma + (cantidades[producto.id] || 0), 0,
  )
  const totalPagar = productos.reduce(
    (suma, producto) => suma + producto.precio * (cantidades[producto.id] || 0), 0,
  )

  // Componente reutilizable para modificar cantidades en catálogo y carrito.
  const controlesCantidad = (producto: Producto) => (
    <div className="control-cantidad">
      <button
        type="button"
        aria-label={`Quitar una unidad de ${producto.nombre}`}
        onClick={() => cambiarCantidad(producto.id, -1)}
      >
        −
      </button>
      <span aria-label={`Cantidad: ${cantidades[producto.id] || 0}`}>
        {cantidades[producto.id] || 0}
      </span>
      <button
        type="button"
        aria-label={`Agregar una unidad de ${producto.nombre}`}
        onClick={() => cambiarCantidad(producto.id, 1)}
      >
        +
      </button>
    </div>
  )

  if (pantalla === 'sedes') {
    return (
      <div className="aplicacion">
        <header className="encabezado">
          <h1>AllInstant</h1>
          <span>BY ALESAR</span>
        </header>

        <main className="contenido contenido-sedes">
          <h2>¿Dónde deseas recoger tu pedido?</h2>
          <div className="sedes">
            {['San Martín de Porres', 'La Molina'].map((opcion) => (
              <button
                key={opcion}
                type="button"
                className={`sede ${sede === opcion ? 'seleccionada' : ''}`}
                aria-pressed={sede === opcion}
                onClick={() => elegirSede(opcion)}
              >
                <span className="ubicacion" aria-hidden="true">⌖</span>
                <span className="informacion">
                  <strong>{opcion}</strong>
                  <small>
                    {opcion === 'San Martín de Porres'
                      ? 'Pabellón Central - Sótano 1'
                      : 'Cafetería Principal - Primer Piso'}
                  </small>
                </span>
                <span className="indicador" aria-hidden="true">
                  {sede === opcion ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </main>

        <footer className="pie-sedes">
          <button
            type="button"
            className="boton-principal"
            onClick={() => setPantalla('catalogo')}
          >
            Continuar
          </button>
        </footer>
      </div>
    )
  }

  if (pantalla === 'catalogo') {
    return (
      <div className="aplicacion">
        <header className="cabecera-catalogo">
          <div className="barra-catalogo">
            <button
              type="button"
              className="boton-volver"
              aria-label="Volver a seleccionar sede"
              onClick={() => setPantalla('sedes')}
            >
              ←
            </button>
            <span>Sede: {sede}</span>
          </div>
        </header>

        <main className="contenido contenido-catalogo">
          <h2>Menú de hoy</h2>
          <div className="catalogo-grid">
            {productos.map((producto) => {
              const cantidad = cantidades[producto.id] || 0
              return (
                <article
                  key={producto.id}
                  className={`producto-card ${cantidad > 0 ? 'producto-seleccionado' : ''}`}
                >
                  <img className="producto-imagen" src={producto.imagen} alt={producto.nombre} />
                  <div className="producto-info">
                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion}</p>
                    <strong>{formatoPrecio(producto.precio)}</strong>
                  </div>
                  <div className="producto-acciones">
                    {cantidad === 0 ? (
                      <button
                        type="button"
                        className="boton-agregar"
                        onClick={() => cambiarCantidad(producto.id, 1)}
                      >
                        Agregar
                      </button>
                    ) : controlesCantidad(producto)}
                  </div>
                </article>
              )
            })}
          </div>
        </main>

        <footer className="barra-carrito">
          <button
            type="button"
            className="boton-carrito"
            disabled={totalUnidades === 0}
            onClick={() => setPantalla('carrito')}
          >
            <span className="texto-carrito">▢ Ver carrito ({totalUnidades})</span>
            <strong>{formatoPrecio(totalPagar)}</strong>
          </button>
        </footer>
      </div>
    )
  }

  if (pantalla === 'carrito') {
    return (
      <div className="aplicacion">
        <header className="cabecera-catalogo">
          <div className="barra-catalogo">
            <button
              type="button"
              className="boton-volver"
              aria-label="Volver al catálogo"
              onClick={() => setPantalla('catalogo')}
            >
              ←
            </button>
            <span>Tu pedido</span>
          </div>
        </header>

        <main className="contenido contenido-carrito">
          <h2>Resumen del carrito</h2>
          {productosElegidos.length === 0 ? (
            <section className="carrito-vacio">
              <p>Tu carrito está vacío.</p>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setPantalla('catalogo')}
              >
                Explorar productos
              </button>
            </section>
          ) : (
            <div className="distribucion-carrito">
              <section className="lista-carrito" aria-label="Productos del carrito">
                {productosElegidos.map((producto) => {
                  const cantidad = cantidades[producto.id]
                  return (
                    <article className="item-carrito" key={producto.id}>
                      <div className="item-carrito-encabezado">
                        <h3>{producto.nombre}</h3>
                        <strong>{formatoPrecio(producto.precio * cantidad)}</strong>
                      </div>
                      <div className="item-carrito-detalle">
                        <span>Unidad: {formatoPrecio(producto.precio)}</span>
                        {controlesCantidad(producto)}
                      </div>
                    </article>
                  )
                })}
              </section>
              <section className="tarjeta-totales" aria-label="Totales de compra">
                <div className="fila-subtotal">
                  <span>Subtotal</span>
                  <span>{formatoPrecio(totalPagar)}</span>
                </div>
                <div className="fila-total">
                  <strong>Total</strong>
                  <strong>{formatoPrecio(totalPagar)}</strong>
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="pie-compra">
          <div className="botones-pie">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setPantalla('catalogo')}
            >
              Seguir comprando
            </button>
            <button
              type="button"
              className="boton-principal"
              disabled={totalUnidades === 0}
              onClick={() => setPantalla('confirmacion')}
            >
              Continuar
            </button>
          </div>
        </footer>
      </div>
    )
  }

  // T01.5: pantalla de destino simulada para validar el paso al pago.
  // No realiza cobros ni guarda pedidos: esa funcionalidad es independiente.
  if (pantalla === 'pago') {
    return (
      <div className="aplicacion">
        <header className="cabecera-catalogo">
          <div className="barra-catalogo">
            <button
              type="button"
              className="boton-volver"
              aria-label="Regresar a la verificación del pedido"
              onClick={() => setPantalla('confirmacion')}
            >
              ←
            </button>
            <span>Proceso de pago</span>
          </div>
        </header>

        <main className="contenido contenido-pago">
          <h2>Inicio del proceso de pago</h2>
          <section className="tarjeta-pago" aria-label="Información recibida para el pago">
            <p className="mensaje-pago">
              Llegaste correctamente al proceso de pago. Esta pantalla es una
              simulación para validar la navegación de la HU-01.
            </p>
            <span className="etiqueta-resumen">SEDE DE RECOJO:</span>
            <strong className="sede-pago">{sede}</strong>
            <div className="bloque-productos-resumen">
              <span className="etiqueta-resumen">PRODUCTOS DEL PEDIDO:</span>
              {productosElegidos.map((producto) => (
                <div className="fila-producto-resumen" key={producto.id}>
                  <span>{cantidades[producto.id]}x {producto.nombre}</span>
                  <span>{formatoPrecio(producto.precio * cantidades[producto.id])}</span>
                </div>
              ))}
            </div>
            <div className="fila-total-final">
              <strong>Total</strong>
              <strong>{formatoPrecio(totalPagar)}</strong>
            </div>
          </section>
          <p className="aviso-confirmacion">
            <span aria-hidden="true">ⓘ</span>
            No se realizará ningún cobro ni se registrará el pedido.
            La integración con el módulo de pagos queda pendiente.
          </p>
        </main>

        <footer className="pie-compra">
          <div className="botones-pie botones-pago">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => setPantalla('confirmacion')}
            >
              Volver a revisar el pedido
            </button>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="aplicacion">
      <header className="cabecera-catalogo">
        <div className="barra-catalogo">
          <button
            type="button"
            className="boton-volver"
            aria-label="Volver al carrito"
            onClick={() => setPantalla('carrito')}
          >
            ←
          </button>
          <span>Revisa tu pedido</span>
        </div>
      </header>

      <main className="contenido contenido-confirmacion">
        <h2>Verificación final</h2>
        <section className="tarjeta-confirmacion" aria-label="Resumen final del pedido">
          <div className="bloque-sede">
            <span className="etiqueta-resumen">SEDE DE RECOJO:</span>
            <strong><span aria-hidden="true">⌖</span> {sede}</strong>
          </div>
          <div className="bloque-productos-resumen">
            <span className="etiqueta-resumen">DETALLE DEL PEDIDO:</span>
            {productosElegidos.map((producto) => (
              <div className="fila-producto-resumen" key={producto.id}>
                <span><strong>{cantidades[producto.id]}x</strong> {producto.nombre}</span>
                <span>{formatoPrecio(producto.precio * cantidades[producto.id])}</span>
              </div>
            ))}
          </div>
          <div className="fila-total-final">
            <strong>Total a pagar</strong>
            <strong>{formatoPrecio(totalPagar)}</strong>
          </div>
        </section>
        <p className="aviso-confirmacion">
          <span aria-hidden="true">ⓘ</span>
          Verifica que la información sea correcta antes de continuar al pago.
        </p>
      </main>

      <footer className="pie-compra">
        <div className="botones-pie">
          <button
            type="button"
            className="boton-principal"
            disabled={totalUnidades === 0}
            onClick={() => setPantalla('pago')}
          >
            Continuar al pago
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
