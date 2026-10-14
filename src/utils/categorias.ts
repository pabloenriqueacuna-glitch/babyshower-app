export const normalizarCategoria = (valor: string) => valor.trim().toLowerCase()

export const claveCategoria = (valor: string) =>
  normalizarCategoria(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
