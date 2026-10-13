import { createContext, useContext } from 'react'
import type { Regalo, Reserva } from '../types'

export interface RegalosContexto {
  regalos: Regalo[]
  reservas: Reserva[]
  reservarRegalo: (regaloId: string, nombreInvitado: string, cantidad: number) => boolean
  cargarInventario: (regalos: Regalo[]) => void
  reiniciarTodo: () => void
}

export const Contexto = createContext<RegalosContexto | null>(null)

export function useRegalos() {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useRegalos debe usarse dentro de <RegalosProvider>.')
  }
  return contexto
}
