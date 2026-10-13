import { useState } from 'react'
import { useRegalos } from '../../context/regalos'
import { useAuthAdmin } from '../../hooks/useAuthAdmin'
import { CargadorXlsx } from './CargadorXlsx'
import { LoginAdmin } from './LoginAdmin'

export function PanelAdmin() {
  const { estaAutenticado, iniciarSesion, cerrarSesion } = useAuthAdmin()
  const { regalos, reservas, cargarInventario, reiniciarTodo } = useRegalos()
  const [mensaje, setMensaje] = useState('')

  if (!estaAutenticado) {
    return <LoginAdmin onIniciarSesion={iniciarSesion} />
  }

  const importar = (nuevos: typeof regalos) => {
    cargarInventario(nuevos)
    setMensaje(`Inventario actualizado: ${nuevos.length} productos. Se reiniciaron las reservas.`)
  }

  const reiniciar = () => {
    reiniciarTodo()
    setMensaje('Inventario restaurado a los datos de ejemplo y reservas borradas.')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-celeste-700">Panel de administración</h2>
        <div className="flex gap-2">
          <a
            href="#"
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Ver lista
          </a>
          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-celeste-700">{regalos.length}</p>
          <p className="text-sm text-gray-500">Productos</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-menta-500">{reservas.length}</p>
          <p className="text-sm text-gray-500">Reservas registradas</p>
        </div>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-xl bg-menta-100 p-3 text-sm font-medium text-menta-500">
          {mensaje}
        </p>
      )}

      <CargadorXlsx onCargar={importar} />

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Zona de riesgo</h3>
        <p className="mb-3 text-sm text-gray-500">
          Restaura el inventario de ejemplo y borra todas las reservas.
        </p>
        <button
          type="button"
          onClick={reiniciar}
          className="rounded-xl border border-rosado-300 px-4 py-2 text-sm font-semibold text-rosado-500 hover:bg-rosado-100"
        >
          Reiniciar datos
        </button>
      </div>
    </div>
  )
}
