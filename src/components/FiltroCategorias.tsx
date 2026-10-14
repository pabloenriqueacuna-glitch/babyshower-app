import { CATEGORIAS } from '../mockData'
import type { Regalo } from '../types'
import { claveCategoria, normalizarCategoria } from '../utils/categorias'

interface Props {
  regalos: Regalo[]
  seleccionada: string | null
  onSeleccionar: (categoria: string | null) => void
}

export function FiltroCategorias({ regalos, seleccionada, onSeleccionar }: Props) {
  const presentes = new Map<string, string>()
  for (const regalo of regalos) {
    const clave = claveCategoria(regalo.categoria)
    if (clave !== '' && !presentes.has(clave)) {
      presentes.set(clave, normalizarCategoria(regalo.categoria))
    }
  }

  const categorias = [
    ...CATEGORIAS.filter((categoria) => presentes.has(claveCategoria(categoria))),
    ...[...presentes.entries()]
      .filter(([clave]) => !CATEGORIAS.some((categoria) => claveCategoria(categoria) === clave))
      .map(([, nombre]) => nombre),
  ]

  const claveSeleccionada = seleccionada ? claveCategoria(seleccionada) : null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSeleccionar(null)}
        className={`rounded-full px-3 py-1 text-sm font-medium transition ${
          seleccionada === null
            ? 'bg-celeste-500 text-white'
            : 'bg-white text-gray-600 shadow-sm hover:bg-celeste-50'
        }`}
      >
        Todos
      </button>
      {categorias.map((categoria) => (
        <button
          key={claveCategoria(categoria)}
          type="button"
          onClick={() => onSeleccionar(categoria)}
          className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
            claveSeleccionada === claveCategoria(categoria)
              ? 'bg-celeste-500 text-white'
              : 'bg-white text-gray-600 shadow-sm hover:bg-celeste-50'
          }`}
        >
          {categoria}
        </button>
      ))}
    </div>
  )
}
