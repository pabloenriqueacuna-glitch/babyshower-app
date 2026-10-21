export interface DatosReserva {
  nombre: string
  email: string
  producto: string
  cantidad: number
}

export async function enviarCorreoAgradecimiento({
  nombre,
  email,
}: {
  nombre: string
  email: string
}) {
  const formData = new FormData()
  formData.append("_subject", `Muchísimas gracias ${nombre.trim()}!`)
  formData.append("mensaje", "Te agradecemos enormemente el regalito para Emilia ❤️.")
  formData.append("_captcha", "false")

  try {
    await fetch(`https://formsubmit.co/${encodeURIComponent(email.trim())}`, {
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
  formData.append("_subject", `Nueva reserva: ${producto} (${cantidad})`)
  formData.append("nombre", nombre.trim())
  formData.append("email", email.trim())
  formData.append("producto", producto)
  formData.append("cantidad", String(cantidad))
  formData.append("_captcha", "false")

  try {
    await fetch("https://formsubmit.co/pabloenriqueacuna@gmail.com", {
      method: "POST",
      body: formData,
    })
  } catch {
    // Ignorar errores de notificación
  }

  const formData2 = new FormData()
  formData2.append("_subject", `Nueva reserva: ${producto} (${cantidad})`)
  formData2.append("nombre", nombre.trim())
  formData2.append("email", email.trim())
  formData2.append("producto", producto)
  formData2.append("cantidad", String(cantidad))
  formData2.append("_captcha", "false")

  try {
    await fetch("https://formsubmit.co/fonoaudiologia.fernanda.b@gmail.com", {
      method: "POST",
      body: formData2,
    })
  } catch {
    // Ignorar errores de notificación
  }
}

export function enviarNotificacionReserva(datos: DatosReserva) {
  void enviarNotificacionAdmins(datos)
}
