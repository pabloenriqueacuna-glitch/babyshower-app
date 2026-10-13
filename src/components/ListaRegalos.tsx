import { CATEGORIAS } from '../mockData'
import type { Regalo } from '../types'
import { RegaloCard } from './RegaloCard'

interface Props {
  regalos: Regalo[]
  onReservar: (regalo: Regalo) => void
}

export function ListaRegalos({ regalos, onReservar }: Props) {
  const categoriasPresentes = Array.from(
    new Set([...CATEGORIAS, ...regalos.map((regalo) => regalo.categoria)]),
  ).filter((categoria) => regalos.some((regalo) => regalo.categoria === categoria))

  if (regalos.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
        No hay regalos en esta categoría.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {categoriasPresentes.map((categoria) => (
        <section key={categoria}>
          <h2 className="mb-3 text-lg font-bold text-celeste-700 capitalize">{categoria}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regalos
              .filter((regalo) => regalo.categoria === categoria)
              .map((regalo) => (
                <RegaloCard key={regalo.id} regalo={regalo} onReservar={onReservar} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
