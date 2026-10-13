import { useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { mockData } from '../mockData'
import type { Regalo, Reserva } from '../types'
import { cantidadValida, descontarStock } from '../utils/inventario'
import { Contexto } from './regalos'

const CLAVE_REGALOS = 'babyShower.regalos'
const CLAVE_RESERVAS = 'babyShower.reservas'

export function RegalosProvider({ children }: { children: ReactNode }) {
  const [regalos, setRegalos] = useLocalStorage<Regalo[]>(CLAVE_REGALOS, mockData)
  const [reservas, setReservas] = useLocalStorage<Reserva[]>(CLAVE_RESERVAS, [])

  const reservarRegalo = useCallback(
    (regaloId: string, nombreInvitado: string, cantidad: number) => {
      const regalo = regalos.find((item) => item.id === regaloId)
      if (!regalo || !cantidadValida(regalo, cantidad)) return false

      setRegalos((actuales) =>
        actuales.map((item) => (item.id === regaloId ? descontarStock(item, cantidad) : item)),
      )
      setReservas((actuales) => [
        ...actuales,
        {
          id: crypto.randomUUID(),
          regaloId,
          nombreInvitado: nombreInvitado.trim(),
          cantidadRegalada: cantidad,
          fecha: new Date().toISOString(),
        },
      ])
      return true
    },
    [regalos, setRegalos, setReservas],
  )

  const cargarInventario = useCallback(
    (nuevos: Regalo[]) => {
      setRegalos(nuevos)
      setReservas([])
    },
    [setRegalos, setReservas],
  )

  const reiniciarTodo = useCallback(() => {
    setRegalos(mockData)
    setReservas([])
  }, [setRegalos, setReservas])

  const valor = useMemo(
    () => ({ regalos, reservas, reservarRegalo, cargarInventario, reiniciarTodo }),
    [regalos, reservas, reservarRegalo, cargarInventario, reiniciarTodo],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
