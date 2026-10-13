import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Regalo, ResultadoImportacion } from '../../types'
import { parseXlsx } from '../../utils/parseXlsx'

interface Props {
  onCargar: (regalos: Regalo[]) => void
}

export function CargadorXlsx({ onCargar }: Props) {
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [cargando, setCargando] = useState(false)

  const alSeleccionar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    setCargando(true)
    setNombreArchivo(archivo.name)
    try {
      const parseado = await parseXlsx(archivo)
      setResultado(parseado)
    } catch {
      setResultado({
        regalos: [],
        errores: ['No se pudo leer el archivo. Verifica que sea un .xlsx válido.'],
        advertencias: [],
      })
    } finally {
      setCargando(false)
      evento.target.value = ''
    }
  }

  const confirmar = () => {
    if (!resultado || resultado.errores.length > 0) return
    onCargar(resultado.regalos)
    setResultado(null)
    setNombreArchivo('')
  }

  const cancelar = () => {
    setResultado(null)
    setNombreArchivo('')
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-gray-800">Importar inventario desde Excel</h3>
      <p className="mb-4 text-sm text-gray-500">
        Columnas esperadas: <strong>Categoría</strong>, <strong>Producto</strong>,{' '}
        <strong>Cantidad</strong>, <strong>Cantidad disponible</strong>. La columna{' '}
        <strong>Me anoto</strong> se ignora.
      </p>

      <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-celeste-300 bg-celeste-50 px-4 py-6 text-sm font-medium text-celeste-700 hover:bg-celeste-100">
        <input type="file" accept=".xlsx" onChange={alSeleccionar} className="hidden" />
        {cargando ? 'Leyendo archivo…' : 'Seleccionar archivo .xlsx'}
      </label>

      {nombreArchivo && (
        <p className="mt-2 text-xs text-gray-500">Archivo: {nombreArchivo}</p>
      )}

      {resultado && (
        <div className="mt-4">
          {resultado.errores.length > 0 && (
            <div className="mb-3 rounded-xl bg-rosado-100 p-3 text-sm text-rosado-500">
              <p className="font-semibold">No se puede importar:</p>
              <ul className="mt-1 list-disc pl-5">
                {resultado.errores.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.advertencias.length > 0 && (
            <div className="mb-3 rounded-xl bg-crema-100 p-3 text-sm text-gray-600">
              <p className="font-semibold">Advertencias:</p>
              <ul className="mt-1 list-disc pl-5">
                {resultado.advertencias.map((advertencia) => (
                  <li key={advertencia}>{advertencia}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.regalos.length > 0 && (
            <div className="mb-3 overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">Cantidad</th>
                    <th className="px-3 py-2">Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.regalos.map((regalo) => (
                    <tr key={regalo.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 capitalize">{regalo.categoria}</td>
                      <td className="px-3 py-2">{regalo.nombre}</td>
                      <td className="px-3 py-2">{regalo.cantidadTotal}</td>
                      <td className="px-3 py-2">{regalo.cantidadDisponible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelar}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={resultado.errores.length > 0 || resultado.regalos.length === 0}
              onClick={confirmar}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                resultado.errores.length > 0 || resultado.regalos.length === 0
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-menta-500 hover:bg-menta-300'
              }`}
            >
              Importar {resultado.regalos.length} productos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
