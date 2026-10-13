import { useState } from 'react'

interface Props {
  onIniciarSesion: (clave: string) => boolean
}

export function LoginAdmin({ onIniciarSesion }: Props) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')

  const enviar = () => {
    if (!onIniciarSesion(clave)) {
      setError('Contraseña incorrecta.')
      setClave('')
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-1 text-lg font-bold text-gray-800">Acceso administrador</h2>
      <p className="mb-4 text-sm text-gray-500">Ingresa la contraseña para gestionar el inventario.</p>

      <input
        type="password"
        value={clave}
        onChange={(evento) => setClave(evento.target.value)}
        onKeyDown={(evento) => evento.key === 'Enter' && enviar()}
        placeholder="Contraseña"
        className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-celeste-500 focus:outline-none"
      />

      {error && <p className="mb-3 text-sm font-medium text-rosado-500">{error}</p>}

      <button
        type="button"
        onClick={enviar}
        className="w-full rounded-xl bg-celeste-500 px-4 py-2 text-sm font-semibold text-white hover:bg-celeste-700"
      >
        Ingresar
      </button>

      <a href="#" className="mt-4 block text-center text-xs text-gray-400 hover:text-gray-600">
        ← Volver a la lista de regalos
      </a>
    </div>
  )
}
