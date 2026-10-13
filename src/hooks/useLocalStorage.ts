import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage<T>(clave: string, valorInicial: T) {
  const [valor, setValor] = useState<T>(() => {
    try {
      const guardado = window.localStorage.getItem(clave)
      return guardado !== null ? (JSON.parse(guardado) as T) : valorInicial
    } catch {
      return valorInicial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      // La persistencia no está disponible; se ignora de forma silenciosa.
    }
  }, [clave, valor])

  const reiniciar = useCallback(() => setValor(valorInicial), [valorInicial])

  return [valor, setValor, reiniciar] as const
}
