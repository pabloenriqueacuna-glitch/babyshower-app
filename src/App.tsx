import { useEffect, useMemo, useState } from 'react'
import { FiltroCategorias } from './components/FiltroCategorias'
import { ListaRegalos } from './components/ListaRegalos'
import { ModalReserva } from './components/ModalReserva'
import { Navbar } from './components/Navbar'
import { PanelAdmin } from './components/admin/PanelAdmin'
import { useRegalos } from './context/regalos'
import type { Regalo } from './types'
import { claveCategoria } from './utils/categorias'
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
  const { regalos, reservarRegalo, cargando, error } = useRegalos()
  const [categoria, setCategoria] = useState<string | null>(null)
  const [regaloSeleccionado, setRegaloSeleccionado] = useState<Regalo | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [avisoCorreo, setAvisoCorreo] = useState('')

  const regalosFiltrados = useMemo(
    () =>
      categoria
        ? regalos.filter((regalo) => claveCategoria(regalo.categoria) === claveCategoria(categoria))
        : regalos,
    [regalos, categoria],
  )

  const notificarReserva = async (
    nombre: string,
    email: string,
    regalo: Regalo,
    cantidad: number,
  ) => {
    try {
      const resultado = await enviarNotificacionReserva({
        nombre,
        email,
        producto: regalo.nombre,
        cantidad,
      })

      if (!resultado.ok) {
        console.error('EmailJS:', resultado.mensaje)
        setAvisoCorreo(
          'La reserva quedó guardada, pero no se pudo enviar el correo de agradecimiento. Revisa tu correo y Spam; si no llega, avisa a los organizadores.',
        )
      }
    } catch (error) {
      console.error('No se pudo enviar la notificación:', error)
      setAvisoCorreo(
        'La reserva quedó guardada, pero no se pudo enviar el aviso por correo.',
      )
    }
  }

  const confirmar = async (nombre: string, email: string, cantidad: number) => {
    if (!regaloSeleccionado) return false

    setAvisoCorreo('')
    const regalo = regaloSeleccionado
    const exito = await reservarRegalo(regalo.id, nombre, email, cantidad)
    if (!exito) return false

    const nombreLimpio = nombre.trim()
    const emailLimpio = email.trim()
    setMensaje(
      `¡Gracias ${nombreLimpio}! Reservaste ${cantidad} × ${regalo.nombre}. Revisa tu correo y Spam para ver el agradecimiento.`,
    )
    setRegaloSeleccionado(null)
    void notificarReserva(nombreLimpio, emailLimpio, regalo, cantidad)
    return true
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 rounded-2xl bg-rosado-100 p-4 text-center">
        <p className="text-sm text-gray-600">
          💕 Lo más importante para nosotros es contar con tu compañía y cariño en la bienvenida de nuestra princesa 🎀👶🏻
          <br />
          Te dejamos una lista de ideas para inspirarte. Elige un regalo y anótate para evitar repetir obsequios.
          <br />
          Y si algo no está disponible o prefieres elegir otra cosita, eres totalmente libre de hacerlo:  la lista es solo una guía y cualquier detalle para nuestra bebita será recibido con muchísimo amor. 🩷
          <br />
          Si puedes, recuerda pedir ticket de cambio por si necesitamos cambiar talla o modelo. 🥰
          <br />
          Si prefieres enviar el regalo a nuestro domicilio, aquí tienes la dirección: Pasaje Juan Francisco González 1965, Peñaflor.
          <br />
          ¡Gracias por ser parte de este momento tan especial para nosotros! ✨💕
        </p>
      </div>

      {cargando && (
        <p className="mb-4 rounded-xl bg-celeste-50 p-3 text-center text-sm font-medium text-celeste-700">
          Cargando lista de regalos…
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-rosado-100 p-3 text-center text-sm font-medium text-rosado-500">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="mb-4 rounded-xl bg-menta-100 p-3 text-center text-sm font-medium text-menta-500">
          {mensaje}
        </p>
      )}

      {avisoCorreo && (
        <p className="mb-4 rounded-xl bg-crema-100 p-3 text-center text-sm font-medium text-gray-700">
          {avisoCorreo}
        </p>
      )}

      {!cargando && (
        <div className="mb-6">
          <FiltroCategorias regalos={regalos} seleccionada={categoria} onSeleccionar={setCategoria} />
        </div>
      )}

      {!cargando && (
        <ListaRegalos regalos={regalosFiltrados} onReservar={setRegaloSeleccionado} />
      )}

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
