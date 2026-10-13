import type { Regalo } from '../types'

export function estaAgotado(regalo: Regalo): boolean {
  return regalo.cantidadDisponible <= 0
}

export function hayDisponibilidad(regalo: Regalo): boolean {
  return !estaAgotado(regalo)
}

export function cantidadValida(regalo: Regalo, cantidad: number): boolean {
  return Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= regalo.cantidadDisponible
}

export function descontarStock(regalo: Regalo, cantidad: number): Regalo {
  return {
    ...regalo,
    cantidadDisponible: Math.max(0, regalo.cantidadDisponible - cantidad),
  }
}
