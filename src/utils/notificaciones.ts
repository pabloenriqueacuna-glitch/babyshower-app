export interface DatosReserva {
  nombre: string
  email: string
  producto: string
  cantidad: number
}

export type ResultadoEnvio =
  | { ok: true }
  | { ok: false; mensaje: string }

const SERVICIO = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || ""
const CLAVE_PUBLICA = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || ""
const PLANTILLA_AVISO = import.meta.env.VITE_EMAILJS_TEMPLATE_AVISO?.trim() || ""

function describirError(status: number, texto: string) {
  if (status === 400) {
    return "La configuración de EmailJS no es válida (service, plantilla o Public Key)."
  }
  if (status === 412) {
    return "Gmail rechazó el envío. Hay que reconectar la cuenta en EmailJS."
  }
  if (status === 422) {
    return "El correo del invitado no es válido o la plantilla no tiene destinatario."
  }
  if (status === 429) {
    return "Se alcanzó el límite de envíos de EmailJS."
  }

  const detalle = texto.trim()
  return detalle !== "" ? detalle : `EmailJS respondió HTTP ${status}.`
}

async function enviarEmail(parametros: Record<string, string>): Promise<ResultadoEnvio> {
  if (SERVICIO === "" || CLAVE_PUBLICA === "" || PLANTILLA_AVISO === "") {
    return { ok: false, mensaje: "EmailJS no está configurado." }
  }

  try {
    const respuesta = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: SERVICIO,
        template_id: PLANTILLA_AVISO,
        user_id: CLAVE_PUBLICA,
        template_params: parametros,
      }),
    })

    if (respuesta.ok) return { ok: true }

    const texto = await respuesta.text()
    return { ok: false, mensaje: describirError(respuesta.status, texto) }
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error ? error.message : "No se pudo conectar con EmailJS.",
    }
  }
}

export async function enviarNotificacionReserva({
  nombre,
  email,
  producto,
  cantidad,
}: DatosReserva): Promise<ResultadoEnvio> {
  return enviarEmail({
    nombre: nombre.trim(),
    email: email.trim(),
    producto,
    cantidad: String(cantidad),
  })
}
