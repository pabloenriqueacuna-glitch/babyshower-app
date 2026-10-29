import { createContext, useContext } from 'react'
import type { Regalo } from '../types'

export interface RegalosContexto {
  regalos: Regalo[]
  totalReservas: number
  cargando: boolean
  error: string
  modoCompartido: boolean
  reservarRegalo: (
    regaloId: string,
    nombreInvitado: string,
    emailInvitado: string,
    cantidad: number,
  ) => Promise<boolean>
  cargarInventario: (regalos: Regalo[]) => Promise<boolean>
  reiniciarTodo: () => Promise<boolean>
  vaciarInventario: () => Promise<boolean>
}

export const Contexto = createContext<RegalosContexto | null>(null)

export function useRegalos() {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useRegalos debe usarse dentro de <RegalosProvider>.')
  }
  return contexto
}
