import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Regalo, ResultadoImportacion } from '../../types'
import { parseInventario } from '../../utils/parseInventario'

interface Props {
  onCargar: (regalos: Regalo[]) => Promise<boolean>
}

export function CargadorXlsx({ onCargar }: Props) {
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [leyendo, setLeyendo] = useState(false)
  const [importando, setImportando] = useState(false)
  const [errorGuardado, setErrorGuardado] = useState('')

  const alSeleccionar = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    setLeyendo(true)
    setErrorGuardado('')
    setNombreArchivo(archivo.name)
    try {
      const parseado = await parseInventario(archivo)
      setResultado(parseado)
    } catch {
      setResultado({
        regalos: [],
        errores: ['No se pudo leer el archivo. Verifica que sea un .xlsx o .numbers válido.'],
        advertencias: [],
      })
    } finally {
      setLeyendo(false)
      evento.target.value = ''
    }
  }

  const confirmar = async () => {
    if (!resultado || resultado.errores.length > 0 || importando) return

    setImportando(true)
    setErrorGuardado('')
    const exito = await onCargar(resultado.regalos)
    setImportando(false)

    if (exito) {
      setResultado(null)
      setNombreArchivo('')
    } else {
      setErrorGuardado('No se pudo guardar el inventario. Inténtalo de nuevo.')
    }
  }

  const cancelar = () => {
    setResultado(null)
    setNombreArchivo('')
    setErrorGuardado('')
  }

  const sinProductos = !resultado || resultado.regalos.length === 0

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-gray-800">Importar inventario desde Excel o Numbers</h3>
      <p className="mb-4 text-sm text-gray-500">
        Columnas esperadas: <strong>Categoría</strong>, <strong>Producto</strong>,{' '}
        <strong>Cantidad</strong>, <strong>Cantidad disponible</strong>. La columna{' '}
        <strong>Me anoto</strong> se ignora.
      </p>

      <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-celeste-300 bg-celeste-50 px-4 py-6 text-sm font-medium text-celeste-700 hover:bg-celeste-100">
        <input
          type="file"
          accept=".xlsx,.numbers"
          onChange={alSeleccionar}
          disabled={importando}
          className="hidden"
        />
        {leyendo ? 'Leyendo archivo…' : 'Seleccionar archivo .xlsx o .numbers'}
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

          {errorGuardado && (
            <p className="mb-3 rounded-xl bg-rosado-100 p-3 text-sm font-medium text-rosado-500">
              {errorGuardado}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelar}
              disabled={importando}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={sinProductos || resultado.errores.length > 0 || importando}
              onClick={confirmar}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                sinProductos || resultado.errores.length > 0 || importando
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-menta-500 hover:bg-menta-300'
              }`}
            >
              {importando ? 'Guardando…' : `Importar ${resultado.regalos.length} productos`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
