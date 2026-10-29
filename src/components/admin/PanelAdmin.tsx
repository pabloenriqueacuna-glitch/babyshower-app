import { useState } from 'react'
import { useRegalos } from '../../context/regalos'
import type { Regalo } from '../../types'
import { useAuthAdmin } from '../../hooks/useAuthAdmin'
import { CargadorXlsx } from './CargadorXlsx'
import { LoginAdmin } from './LoginAdmin'

export function PanelAdmin() {
  const { estaAutenticado, iniciarSesion, cerrarSesion } = useAuthAdmin()
  const {
    regalos,
    totalReservas,
    cargando,
    error,
    modoCompartido,
    cargarInventario,
    reiniciarTodo,
    vaciarInventario,
  } = useRegalos()
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [claveImportador, setClaveImportador] = useState(0)

  if (!estaAutenticado) {
    return <LoginAdmin onIniciarSesion={iniciarSesion} />
  }

  const importar = async (nuevos: Regalo[]) => {
    setGuardando(true)
    setMensaje('')
    const exito = await cargarInventario(nuevos)
    setGuardando(false)
    if (exito) {
      setMensaje(`Inventario actualizado: ${nuevos.length} productos. Se reiniciaron las reservas.`)
      setClaveImportador((valor) => valor + 1)
    }
    return exito
  }

  const reiniciar = async () => {
    setGuardando(true)
    setMensaje('')
    const exito = await reiniciarTodo()
    setGuardando(false)
    if (exito) {
      setMensaje('Inventario restaurado a los datos de ejemplo y reservas borradas.')
      setClaveImportador((valor) => valor + 1)
    }
  }

  const vaciar = async () => {
    if (!window.confirm('Se borrarán todos los productos y reservas. ¿Continuar?')) return
    setGuardando(true)
    setMensaje('')
    const exito = await vaciarInventario()
    setGuardando(false)
    if (exito) {
      setMensaje('Inventario y reservas eliminados.')
      setClaveImportador((valor) => valor + 1)
    }
  }

  const botonDeshabilitado = guardando || cargando

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-celeste-700">Panel de administración</h2>
          <p className="mt-1 text-xs text-gray-500">
            {modoCompartido
              ? 'Datos compartidos: los cambios se ven en todos los dispositivos.'
              : 'Datos locales: solo se guardan en este navegador.'}
          </p>
        </div>
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
          <p className="text-2xl font-bold text-menta-500">{totalReservas}</p>
          <p className="text-sm text-gray-500">Reservas registradas</p>
        </div>
      </div>

      {cargando && (
        <p className="mb-4 rounded-xl bg-celeste-50 p-3 text-sm font-medium text-celeste-700">
          Cargando datos…
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-rosado-100 p-3 text-sm font-medium text-rosado-500">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="mb-4 rounded-xl bg-menta-100 p-3 text-sm font-medium text-menta-500">
          {mensaje}
        </p>
      )}

      <CargadorXlsx key={claveImportador} onCargar={importar} />

      <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-gray-800">Zona de riesgo</h3>
        <p className="mb-3 text-sm text-gray-500">
          Restaura el inventario de ejemplo o elimina todos los productos y reservas.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reiniciar}
            disabled={botonDeshabilitado}
            className="rounded-xl border border-rosado-300 px-4 py-2 text-sm font-semibold text-rosado-500 hover:bg-rosado-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Restaurar datos de ejemplo
          </button>
          <button
            type="button"
            onClick={vaciar}
            disabled={botonDeshabilitado}
            className="rounded-xl border border-rosado-500 px-4 py-2 text-sm font-semibold text-rosado-500 hover:bg-rosado-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vaciar inventario
          </button>
        </div>
      </div>
    </div>
  )
}
