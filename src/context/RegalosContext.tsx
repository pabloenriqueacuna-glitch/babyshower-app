import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { usaBackendCompartido } from '../lib/supabase'
import { mockData } from '../mockData'
import {
  cargarDatosCompartidos,
  guardarInventarioEnBackend,
  reservarEnBackend,
  suscribirDatos,
} from '../services/datos'
import type { DatosCompartidos } from '../services/datos'
import type { Regalo, Reserva } from '../types'
import { CLAVE_REGALOS, CLAVE_RESERVAS, guardarLocal, leerLocal } from '../utils/almacenLocal'
import { cantidadValida, descontarStock } from '../utils/inventario'
import { Contexto } from './regalos'

const ERROR_CARGA = 'No se pudieron cargar los datos. Revisa tu conexión e inténtalo de nuevo.'
const ERROR_GUARDADO = 'No se pudo guardar el cambio. Inténtalo de nuevo.'
const ERROR_RESERVA = 'No se pudo registrar la reserva. Inténtalo de nuevo.'
const ERROR_DISPONIBILIDAD = 'La disponibilidad cambió. Actualiza la lista e intenta de nuevo.'

export function RegalosProvider({ children }: { children: ReactNode }) {
  const [regalos, setRegalos] = useState<Regalo[]>(() =>
    usaBackendCompartido ? [] : leerLocal(CLAVE_REGALOS, mockData),
  )
  const [reservas, setReservas] = useState<Reserva[]>(() =>
    usaBackendCompartido ? [] : leerLocal(CLAVE_RESERVAS, []),
  )
  const [totalReservasCompartidas, setTotalReservasCompartidas] = useState(0)
  const [cargando, setCargando] = useState(usaBackendCompartido)
  const [error, setError] = useState('')
  const temporizador = useRef<number | null>(null)

  const aplicarDatos = useCallback((datos: DatosCompartidos) => {
    setRegalos(datos.regalos)
    setTotalReservasCompartidas(datos.totalReservas)
    setError('')
  }, [])

  const recargar = useCallback(async () => {
    if (!usaBackendCompartido) return
    try {
      const datos = await cargarDatosCompartidos()
      aplicarDatos(datos)
    } catch {
      setError(ERROR_CARGA)
    } finally {
      setCargando(false)
    }
  }, [aplicarDatos])

  const programarRecarga = useCallback(() => {
    if (temporizador.current !== null) window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(() => {
      temporizador.current = null
      void recargar()
    }, 200)
  }, [recargar])

  useEffect(() => {
    if (!usaBackendCompartido) return

    let activo = true
    cargarDatosCompartidos()
      .then((datos) => {
        if (!activo) return
        setRegalos(datos.regalos)
        setTotalReservasCompartidas(datos.totalReservas)
        setError('')
        setCargando(false)
      })
      .catch(() => {
        if (!activo) return
        setError(ERROR_CARGA)
        setCargando(false)
      })

    const desuscribir = suscribirDatos(programarRecarga)
    return () => {
      activo = false
      desuscribir()
      if (temporizador.current !== null) window.clearTimeout(temporizador.current)
    }
  }, [programarRecarga])

  useEffect(() => {
    if (usaBackendCompartido) return
    guardarLocal(CLAVE_REGALOS, regalos)
  }, [regalos])

  useEffect(() => {
    if (usaBackendCompartido) return
    guardarLocal(CLAVE_RESERVAS, reservas)
  }, [reservas])

  useEffect(() => {
    if (usaBackendCompartido) return

    const alCambiar = (evento: StorageEvent) => {
      if (evento.key === CLAVE_REGALOS) setRegalos(leerLocal(CLAVE_REGALOS, mockData))
      if (evento.key === CLAVE_RESERVAS) setReservas(leerLocal(CLAVE_RESERVAS, []))
    }

    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const guardarInventario = useCallback(
    async (nuevos: Regalo[]) => {
      setError('')
      if (usaBackendCompartido) {
        try {
          await guardarInventarioEnBackend(nuevos)
          await recargar()
          return true
        } catch {
          setError(ERROR_GUARDADO)
          return false
        }
      }

      setRegalos(nuevos)
      setReservas([])
      return true
    },
    [recargar],
  )

  const reservarRegalo = useCallback(
    async (regaloId: string, nombreInvitado: string, emailInvitado: string, cantidad: number) => {
      const regalo = regalos.find((item) => item.id === regaloId)
      if (!regalo) {
        setError(ERROR_DISPONIBILIDAD)
        return false
      }
      if (!cantidadValida(regalo, cantidad)) {
        setError(ERROR_DISPONIBILIDAD)
        return false
      }

      setError('')
      if (usaBackendCompartido) {
        try {
          const exito = await reservarEnBackend(regaloId, nombreInvitado, emailInvitado, cantidad)
          if (exito) await recargar()
          return exito
        } catch {
          setError(ERROR_RESERVA)
          return false
        }
      }

      setRegalos((actuales) =>
        actuales.map((item) => (item.id === regaloId ? descontarStock(item, cantidad) : item)),
      )
      setReservas((actuales) => [
        ...actuales,
        {
          id: crypto.randomUUID(),
          regaloId,
          nombreInvitado: nombreInvitado.trim(),
          emailInvitado: emailInvitado.trim(),
          cantidadRegalada: cantidad,
          fecha: new Date().toISOString(),
        },
      ])
      return true
    },
    [recargar, regalos],
  )

  const cargarInventario = useCallback(
    (nuevos: Regalo[]) => guardarInventario(nuevos),
    [guardarInventario],
  )

  const reiniciarTodo = useCallback(() => guardarInventario(mockData), [guardarInventario])

  const vaciarInventario = useCallback(() => guardarInventario([]), [guardarInventario])

  const valor = useMemo(
    () => ({
      regalos,
      totalReservas: usaBackendCompartido ? totalReservasCompartidas : reservas.length,
      cargando,
      error,
      modoCompartido: usaBackendCompartido,
      reservarRegalo,
      cargarInventario,
      reiniciarTodo,
      vaciarInventario,
    }),
    [
      regalos,
      totalReservasCompartidas,
      reservas.length,
      cargando,
      error,
      reservarRegalo,
      cargarInventario,
      reiniciarTodo,
      vaciarInventario,
    ],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
