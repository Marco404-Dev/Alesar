import { useState } from 'react'
import './App.css'

type Pantalla = 'sedes' | 'catalogo'

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

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('sedes')
  const [sede, setSede] = useState('San Martín de Porres')
  const [cantidades, setCantidades] = useState<Record<number, number>>({})

  const cambiarCantidad = (id: number, cambio: number) => {
    setCantidades((anteriores) => ({
      ...anteriores,
      [id]: Math.max(0, (anteriores[id] || 0) + cambio),
    }))
  }

  const totalUnidades = productos.reduce(
    (suma, producto) => suma + (cantidades[producto.id] || 0), 0,
  )

  const totalPagar = productos.reduce(
    (suma, producto) => suma + producto.precio * (cantidades[producto.id] || 0), 0,
  )

  const elegirSede = (nuevaSede: string) => {
    if (nuevaSede !== sede) setCantidades({})
    setSede(nuevaSede)
  }

  const verCarrito = () => {
    const detalle = productos
      .filter((producto) => (cantidades[producto.id] || 0) > 0)
      .map((producto) => `${cantidades[producto.id]} x ${producto.nombre}`)
      .join('\n')

    alert(`Tu pedido para ${sede}:\n\n${detalle}\n\nTotal: S/ ${totalPagar.toFixed(2)}`)
  }

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
          <button type="button" className="boton-principal" onClick={() => setPantalla('catalogo')}>
            Continuar
          </button>
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
                <img
                  className="producto-imagen"
                  src={producto.imagen}
                  alt={producto.nombre}
                />
                <div className="producto-info">
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>
                  <strong>S/ {producto.precio.toFixed(2)}</strong>
                </div>
                <div className="producto-acciones">
                  {cantidad === 0 ? (
                    <button
                      className="boton-agregar"
                      type="button"
                      onClick={() => cambiarCantidad(producto.id, 1)}
                    >
                      Agregar
                    </button>
                  ) : (
                    <div className="control-cantidad">
                      <button
                        type="button"
                        aria-label={`Quitar ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto.id, -1)}
                      >−</button>
                      <span>{cantidad}</span>
                      <button
                        type="button"
                        aria-label={`Agregar ${producto.nombre}`}
                        onClick={() => cambiarCantidad(producto.id, 1)}
                      >+</button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <footer className="barra-carrito">
        <button
          className="boton-carrito"
          type="button"
          disabled={totalUnidades === 0}
          onClick={verCarrito}
        >
          <span className="texto-carrito">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="8" width="16" height="13" rx="2" />
              <path d="M8 9V6a4 4 0 0 1 8 0v3" />
            </svg>
            Ver carrito ({totalUnidades})
          </span>
          <strong>S/ {totalPagar.toFixed(2)}</strong>
        </button>
      </footer>
    </div>
  )
}

export default App
