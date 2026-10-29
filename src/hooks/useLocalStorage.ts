import { useCallback, useEffect, useState } from 'react'
import { guardarLocal, leerLocal } from '../utils/almacenLocal'

export function useLocalStorage<T>(clave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => leerLocal(clave, valorInicial))

  useEffect(() => {
    guardarLocal(clave, valor)
  }, [clave, valor])

  useEffect(() => {
    const alCambiar = (evento: StorageEvent) => {
      if (evento.key !== clave) return
      setValor(leerLocal(clave, valorInicial))
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [clave, valorInicial])

  const reiniciar = useCallback(() => setValor(valorInicial), [valorInicial])

  return [valor, setValor, reiniciar] as const
}
