import { CATEGORIAS } from '../mockData'

interface Props {
  seleccionada: string | null
  onSeleccionar: (categoria: string | null) => void
}

export function FiltroCategorias({ seleccionada, onSeleccionar }: Props) {
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
      {CATEGORIAS.map((categoria) => (
        <button
          key={categoria}
          type="button"
          onClick={() => onSeleccionar(categoria)}
          className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
            seleccionada === categoria
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
