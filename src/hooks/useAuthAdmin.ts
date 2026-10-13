import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

const CLAVE_SESION = 'babyShower.adminSesion'
const CLAVE_CLAVE = 'babyShower.adminClave'
const CLAVE_POR_DEFECTO = 'baby2026'

export function useAuthAdmin() {
  const [sesion, setSesion] = useLocalStorage<boolean>(CLAVE_SESION, false)
  const [clave] = useLocalStorage<string>(CLAVE_CLAVE, CLAVE_POR_DEFECTO)

  const iniciarSesion = useCallback(
    (intento: string) => {
      if (intento === clave) {
        setSesion(true)
        return true
      }
      return false
    },
    [clave, setSesion],
  )

  const cerrarSesion = useCallback(() => setSesion(false), [setSesion])

  return { estaAutenticado: sesion, iniciarSesion, cerrarSesion }
}
