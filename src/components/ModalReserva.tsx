import { useEffect, useState } from 'react'
import type { Regalo } from '../types'

interface Props {
  regalo: Regalo
  onCerrar: () => void
  onConfirmar: (nombre: string, email: string, cantidad: number) => Promise<boolean>
}

export function ModalReserva({ regalo, onCerrar, onConfirmar }: Props) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const cerrar = () => {
    if (!enviando) onCerrar()
  }

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape' && !enviando) onCerrar()
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [enviando, onCerrar])

  const confirmar = async () => {
    if (enviando) return
    if (nombre.trim() === '') {
      setError('Ingresa tu nombre para continuar.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > regalo.cantidadDisponible) {
      setError(`La cantidad debe estar entre 1 y ${regalo.cantidadDisponible}.`)
      return
    }

    setError('')
    setEnviando(true)
    const exito = await onConfirmar(nombre, email, cantidad)
    if (!exito) {
      setError('No se pudo registrar la reserva. Revisa la disponibilidad e inténtalo de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={cerrar}
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
            onClick={cerrar}
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

        <label className="mb-1 block text-sm font-medium text-gray-700">Tu correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder="Ej: maria@correo.com"
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
            onClick={cerrar}
            disabled={enviando}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={enviando}
            className="flex-1 rounded-xl bg-celeste-500 px-4 py-2 text-sm font-semibold text-white hover:bg-celeste-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando ? 'Guardando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
