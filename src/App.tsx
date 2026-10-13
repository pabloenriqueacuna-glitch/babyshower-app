import { useEffect, useMemo, useState } from 'react'
import { FiltroCategorias } from './components/FiltroCategorias'
import { ListaRegalos } from './components/ListaRegalos'
import { ModalReserva } from './components/ModalReserva'
import { Navbar } from './components/Navbar'
import { PanelAdmin } from './components/admin/PanelAdmin'
import { useRegalos } from './context/regalos'
import type { Regalo } from './types'
import { enviarNotificacionReserva } from './utils/notificaciones'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const alCambiar = () => setHash(window.location.hash)
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return hash
}

function VistaInvitado() {
  const { regalos, reservarRegalo } = useRegalos()
  const [categoria, setCategoria] = useState<string | null>(null)
  const [regaloSeleccionado, setRegaloSeleccionado] = useState<Regalo | null>(null)
  const [mensaje, setMensaje] = useState('')

  const regalosFiltrados = useMemo(
    () => (categoria ? regalos.filter((regalo) => regalo.categoria === categoria) : regalos),
    [regalos, categoria],
  )

  const confirmar = (nombre: string, cantidad: number) => {
    if (!regaloSeleccionado) return
    const exito = reservarRegalo(regaloSeleccionado.id, nombre, cantidad)
    if (exito) {
      const nombreLimpio = nombre.trim()
      setMensaje(`¡Gracias ${nombreLimpio}! Reservaste ${cantidad} × ${regaloSeleccionado.nombre}.`)
      enviarNotificacionReserva({
        nombre: nombreLimpio,
        producto: regaloSeleccionado.nombre,
        cantidad,
      })
    }
    setRegaloSeleccionado(null)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 rounded-2xl bg-rosado-100 p-4 text-center">
        <p className="text-sm text-gray-600">
          Elige un regalo y anótate. Así evitamos repetir obsequios. ¡Gracias por acompañarnos!
        </p>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-xl bg-menta-100 p-3 text-center text-sm font-medium text-menta-500">
          {mensaje}
        </p>
      )}

      <div className="mb-6">
        <FiltroCategorias seleccionada={categoria} onSeleccionar={setCategoria} />
      </div>

      <ListaRegalos regalos={regalosFiltrados} onReservar={setRegaloSeleccionado} />

      {regaloSeleccionado && (
        <ModalReserva
          regalo={regaloSeleccionado}
          onCerrar={() => setRegaloSeleccionado(null)}
          onConfirmar={confirmar}
        />
      )}
    </div>
  )
}

function App() {
  const hash = useHash()
  const esAdmin = hash === '#admin'

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main className="px-4 pt-6">{esAdmin ? <PanelAdmin /> : <VistaInvitado />}</main>
    </div>
  )
}

export default App
