import { CATEGORIAS } from '../mockData'
import type { Regalo } from '../types'
import { claveCategoria, normalizarCategoria } from '../utils/categorias'
import { RegaloCard } from './RegaloCard'

interface Props {
  regalos: Regalo[]
  onReservar: (regalo: Regalo) => void
}

export function ListaRegalos({ regalos, onReservar }: Props) {
  const porClave = new Map<string, { nombre: string; regalos: Regalo[] }>()
  for (const regalo of regalos) {
    const clave = claveCategoria(regalo.categoria)
    const grupo = porClave.get(clave)
    if (grupo) {
      grupo.regalos.push(regalo)
    } else {
      porClave.set(clave, { nombre: normalizarCategoria(regalo.categoria), regalos: [regalo] })
    }
  }

  const grupos = [
    ...CATEGORIAS.filter((categoria) => porClave.has(claveCategoria(categoria))),
    ...[...porClave.entries()]
      .filter(([clave]) => !CATEGORIAS.some((categoria) => claveCategoria(categoria) === clave))
      .map(([, grupo]) => grupo.nombre),
  ].map((nombre) => ({ nombre, regalos: porClave.get(claveCategoria(nombre))?.regalos ?? [] }))

  if (regalos.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
        No hay regalos disponibles.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {grupos.map((grupo) => (
        <section key={claveCategoria(grupo.nombre)}>
          <h2 className="mb-3 text-lg font-bold text-celeste-700 capitalize">{grupo.nombre}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grupo.regalos.map((regalo) => (
              <RegaloCard key={regalo.id} regalo={regalo} onReservar={onReservar} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
