import { readSheet } from 'read-excel-file/browser'
import type { CellValue } from 'cupertino-files'
import type { Regalo, ResultadoImportacion } from '../types'
import { normalizarCategoria } from './categorias'

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

const filaVacia = (fila: unknown[]): boolean => fila.every((celda) => aTexto(celda) === '')

function construirDesdeFilas(filas: unknown[][]): ResultadoImportacion {
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

    const categoria = indice.categoria !== -1 ? normalizarCategoria(aTexto(fila[indice.categoria])) : ''

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

export async function parseXlsx(archivo: File): Promise<ResultadoImportacion> {
  const filas = (await readSheet(archivo)) as unknown[][]
  return construirDesdeFilas(filas)
}

const aValorPlano = (celda: CellValue | null): unknown => {
  if (!celda) return null
  switch (celda.type) {
    case 'number':
      return celda.value
    case 'text':
    case 'richText':
      return celda.value
    case 'bool':
      return celda.value
    case 'date':
      return celda.value
    case 'duration':
      return celda.seconds
    default:
      return null
  }
}

export async function parseNumbers(archivo: File): Promise<ResultadoImportacion> {
  const { NumbersDocument } = await import('cupertino-files')
  const bytes = new Uint8Array(await archivo.arrayBuffer())
  const documento = NumbersDocument.load(bytes)
  const tabla = documento.tables()[0]

  if (!tabla) {
    return { regalos: [], errores: ['El archivo de Numbers no contiene ninguna tabla.'], advertencias: [] }
  }

  const filas = tabla.grid().map((fila) => fila.map(aValorPlano))
  const [encabezado, ...cuerpo] = filas
  const filasUtiles = encabezado ? [encabezado, ...cuerpo.filter((fila) => !filaVacia(fila))] : filas

  return construirDesdeFilas(filasUtiles)
}

export async function parseInventario(archivo: File): Promise<ResultadoImportacion> {
  return archivo.name.toLowerCase().endsWith('.numbers') ? parseNumbers(archivo) : parseXlsx(archivo)
}
