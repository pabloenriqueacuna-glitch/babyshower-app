import { useEffect, useState } from 'react'
import type { Regalo } from '../types'

interface Props {
  regalo: Regalo
  onCerrar: () => void
  onConfirmar: (nombre: string, cantidad: number) => void
}

export function ModalReserva({ regalo, onCerrar, onConfirmar }: Props) {
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [onCerrar])

  const confirmar = () => {
    if (nombre.trim() === '') {
      setError('Ingresa tu nombre para continuar.')
      return
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > regalo.cantidadDisponible) {
      setError(`La cantidad debe estar entre 1 y ${regalo.cantidadDisponible}.`)
      return
    }
    onConfirmar(nombre, cantidad)
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Me anoto con un regalo</h2>
            <p className="text-sm text-gray-500">{regalo.nombre}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full px-2 text-xl text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">Tu nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Ej: María Pérez"
          className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-celeste-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">¿Cuántos deseas regalar?</label>
        <input
          type="number"
          min={1}
          max={regalo.cantidadDisponible}
          value={cantidad}
          onChange={(evento) => setCantidad(Number(evento.target.value))}
          className="mb-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-celeste-500 focus:outline-none"
        />
        <p className="mb-4 text-xs text-gray-500">
          Disponible: {regalo.cantidadDisponible} de {regalo.cantidadTotal}
        </p>

        {error && <p className="mb-3 text-sm font-medium text-rosado-500">{error}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="flex-1 rounded-xl bg-celeste-500 px-4 py-2 text-sm font-semibold text-white hover:bg-celeste-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
