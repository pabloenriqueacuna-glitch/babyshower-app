export const CLAVE_REGALOS = 'babyShower.regalos'
export const CLAVE_RESERVAS = 'babyShower.reservas'

export function leerLocal<T>(clave: string, valorPorDefecto: T): T {
  try {
    const guardado = window.localStorage.getItem(clave)
    return guardado !== null ? (JSON.parse(guardado) as T) : valorPorDefecto
  } catch {
    return valorPorDefecto
  }
}

export function guardarLocal<T>(clave: string, valor: T): void {
  try {
    const serializado = JSON.stringify(valor)
    if (window.localStorage.getItem(clave) !== serializado) {
      window.localStorage.setItem(clave, serializado)
    }
  } catch {
    // La persistencia no está disponible; se ignora de forma silenciosa.
  }
}

export function eliminarLocal(clave: string): void {
  try {
    window.localStorage.removeItem(clave)
  } catch {
    // La persistencia no está disponible; se ignora de forma silenciosa.
  }
}
