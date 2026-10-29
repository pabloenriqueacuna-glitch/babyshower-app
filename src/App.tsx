import { useEffect, useMemo, useState } from 'react'
import { FiltroCategorias } from './components/FiltroCategorias'
import { ListaRegalos } from './components/ListaRegalos'
import { ModalReserva } from './components/ModalReserva'
import { Navbar } from './components/Navbar'
import { PanelAdmin } from './components/admin/PanelAdmin'
import { useRegalos } from './context/regalos'
import type { Regalo } from './types'
import { claveCategoria } from './utils/categorias'
import { enviarCorreoAgradecimiento, enviarNotificacionAdmins } from './utils/notificaciones'

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
    () =>
      categoria
        ? regalos.filter((regalo) => claveCategoria(regalo.categoria) === claveCategoria(categoria))
        : regalos,
    [regalos, categoria],
  )

  const confirmar = (nombre: string, email: string, cantidad: number) => {
    if (!regaloSeleccionado) return
    const exito = reservarRegalo(regaloSeleccionado.id, nombre, email, cantidad)
    if (exito) {
      const nombreLimpio = nombre.trim()
      setMensaje(`¡Gracias ${nombreLimpio}! Reservaste ${cantidad} × ${regaloSeleccionado.nombre}.`)
      void enviarCorreoAgradecimiento({
        nombre: nombreLimpio,
        email: email.trim(),
      })
      void enviarNotificacionAdmins({
        nombre: nombreLimpio,
        email: email.trim(),
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
          💕 Lo más importante para nosotros es contar con tu compañía y cariño en la bienvenida de nuestra princesa 🎀👶🏻
          Te dejamos una lista de ideas para inspirarte. Elige un regalo y anótate para evitar repetir obsequios.
          Y si algo no está disponible o prefieres elegir otra cosita, eres totalmente libre de hacerlo:  la lista es solo una guía y cualquier detalle para nuestra bebita será recibido con muchísimo amor. 🩷
          Si puedes, recuerda pedir ticket de cambio por si necesitamos cambiar talla o modelo. 🥰
          ¡Gracias por ser parte de este momento tan especial para nosotros! ✨💕
        </p>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-xl bg-menta-100 p-3 text-center text-sm font-medium text-menta-500">
          {mensaje}
        </p>
      )}

      <div className="mb-6">
        <FiltroCategorias regalos={regalos} seleccionada={categoria} onSeleccionar={setCategoria} />
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
