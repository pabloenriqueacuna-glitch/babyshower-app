import { readSheet } from 'read-excel-file/browser'
import type { Regalo, ResultadoImportacion } from '../types'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const aNumero = (valor: unknown): number | null => {
  if (valor === null || valor === undefined || valor === '') return null
  const numero = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'))
  return Number.isFinite(numero) ? numero : null
}

const aTexto = (valor: unknown): string =>
  valor === null || valor === undefined ? '' : String(valor).trim()

export async function parseXlsx(archivo: File): Promise<ResultadoImportacion> {
  const filas = await readSheet(archivo)

  if (filas.length < 2) {
    return { regalos: [], errores: ['El archivo no contiene filas de productos.'], advertencias: [] }
  }

  const encabezados = filas[0].map((celda) => normalizar(aTexto(celda)))
  const indice = {
    categoria: encabezados.indexOf('categoria'),
    nombre: encabezados.indexOf('producto'),
    total: encabezados.indexOf('cantidad'),
    disponible: encabezados.indexOf('cantidad disponible'),
  }

  if (indice.nombre === -1 || indice.total === -1) {
    return {
      regalos: [],
      errores: [
        'No se encontraron las columnas obligatorias "Producto" y "Cantidad".',
        `Encabezados detectados: ${encabezados.join(', ') || '(ninguno)'}.`,
      ],
      advertencias: [],
    }
  }

  const regalos: Regalo[] = []
  const errores: string[] = []
  const advertencias: string[] = []

  for (let i = 1; i < filas.length; i += 1) {
    const fila = filas[i]
    const numeroFila = i + 1
    const nombre = aTexto(fila[indice.nombre])

    if (nombre === '') {
      errores.push(`Fila ${numeroFila}: el "Producto" está vacío.`)
      continue
    }

    const total = aNumero(fila[indice.total])
    if (total === null || total < 0) {
      errores.push(`Fila ${numeroFila}: "Cantidad" debe ser un número mayor o igual a 0.`)
      continue
    }

    const categoria = indice.categoria !== -1 ? aTexto(fila[indice.categoria]) : ''

    let disponible = indice.disponible !== -1 ? aNumero(fila[indice.disponible]) : null
    if (disponible === null) disponible = total
    if (disponible > total) {
      advertencias.push(
        `Fila ${numeroFila}: "Cantidad disponible" (${disponible}) supera "Cantidad" (${total}); se usa ${total}.`,
      )
      disponible = total
    }

    regalos.push({
      id: crypto.randomUUID(),
      categoria,
      nombre,
      cantidadTotal: total,
      cantidadDisponible: disponible,
    })
  }

  if (regalos.length === 0 && errores.length === 0) {
    errores.push('No se encontraron productos válidos en el archivo.')
  }

  return { regalos, errores, advertencias }
}
