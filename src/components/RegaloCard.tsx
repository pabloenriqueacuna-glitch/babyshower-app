import type { Regalo } from '../types'
import { estaAgotado } from '../utils/inventario'

interface Props {
  regalo: Regalo
  onReservar: (regalo: Regalo) => void
}

export function RegaloCard({ regalo, onReservar }: Props) {
  const agotado = estaAgotado(regalo)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
      <div className="relative flex h-40 items-center justify-center bg-celeste-100">
        {regalo.imagenUrl ? (
          <img
            src={regalo.imagenUrl}
            alt={regalo.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="text-5xl">
            🎁
          </span>
        )}
        {agotado && (
          <span className="absolute top-2 right-2 rounded-full bg-rosado-500 px-3 py-1 text-xs font-bold text-white uppercase">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-menta-100 px-2 py-0.5 text-xs font-medium text-menta-500 capitalize">
          {regalo.categoria || 'sin categoría'}
        </span>
        <h3 className="text-base font-semibold text-gray-800">{regalo.nombre}</h3>
        {regalo.descripcion && <p className="text-sm text-gray-500">{regalo.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="text-gray-500">Total: {regalo.cantidadTotal}</span>
          <span
            className={`font-semibold ${agotado ? 'text-rosado-500' : 'text-menta-500'}`}
          >
            Disponible: {regalo.cantidadDisponible}
          </span>
        </div>

        <button
          type="button"
          disabled={agotado}
          onClick={() => onReservar(regalo)}
          className={`mt-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            agotado
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-celeste-500 text-white hover:bg-celeste-700'
          }`}
        >
          {agotado ? 'Lista completa' : 'Me anoto'}
        </button>
      </div>
    </article>
  )
}
