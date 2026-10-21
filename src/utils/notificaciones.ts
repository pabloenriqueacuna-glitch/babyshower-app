export interface DatosReserva {
  nombre: string
  email: string
  producto: string
  cantidad: number
}

const FORMSUBMIT_TOKEN = "498dc909d3c03d4e2796d91c86f53773"
const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/submit/${FORMSUBMIT_TOKEN}`

export async function enviarCorreoAgradecimiento({
  nombre,
  email,
}: {
  nombre: string
  email: string
}) {
  const formData = new FormData()
  formData.append("_to", email.trim())
  formData.append("_subject", `Muchísimas gracias ${nombre.trim()}!`)
  formData.append("mensaje", "Te agradecemos enormemente el regalito para Emilia ❤️.")
  formData.append("_captcha", "false")

  try {
    await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      body: formData,
    })
  } catch {
    // Ignorar errores de notificación
  }
}

export async function enviarNotificacionAdmins({
  nombre,
  email,
  producto,
  cantidad,
}: DatosReserva) {
  const formData = new FormData()
  formData.append(
    "_to",
    "pabloenriqueacuna@gmail.com,fonoaudiologia.fernanda.b@gmail.com",
  )
  formData.append("_subject", `Nueva reserva: ${producto} (${cantidad})`)
  formData.append("nombre", nombre.trim())
  formData.append("email", email.trim())
  formData.append("producto", producto)
  formData.append("cantidad", String(cantidad))
  formData.append("_captcha", "false")

  try {
    await fetch(FORMSUBMIT_ENDPOINT, {
      method: "POST",
      body: formData,
    })
  } catch {
    // Ignorar errores de notificación
  }
}

export function enviarNotificacionReserva(datos: DatosReserva) {
  void enviarNotificacionAdmins(datos)
}
