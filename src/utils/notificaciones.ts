export interface DatosReserva {
  nombre: string
  email: string
  producto: string
  cantidad: number
}

export type ResultadoEnvio =
  | { ok: true }
  | { ok: false; tipo: "activacion" | "error"; mensaje: string }

const ADMIN_1 =
  import.meta.env.VITE_FORMSUBMIT_ADMIN_1?.trim() || "pabloenriqueacuna@gmail.com"
const ADMIN_2 =
  import.meta.env.VITE_FORMSUBMIT_ADMIN_2?.trim() || "fonoaudiologia.fernanda.b@gmail.com"

function esActivacion(mensaje: string) {
  const texto = mensaje.toLowerCase()
  return texto.includes("activation") || texto.includes("activate") || texto.includes("actived")
}

async function enviarFormSubmit(
  destino: string,
  datos: Record<string, string>,
): Promise<ResultadoEnvio> {
  try {
    const respuesta = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(destino.trim())}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      },
    )

    const texto = await respuesta.text()
    let cuerpo: { success?: unknown; message?: unknown } | null = null
    try {
      cuerpo = JSON.parse(texto) as { success?: unknown; message?: unknown }
    } catch {
      cuerpo = null
    }

    if (respuesta.ok && String(cuerpo?.success) === "true") {
      return { ok: true }
    }

    const mensaje =
      typeof cuerpo?.message === "string" && cuerpo.message.trim() !== ""
        ? cuerpo.message
        : `FormSubmit respondió HTTP ${respuesta.status}.`

    return {
      ok: false,
      tipo: esActivacion(mensaje) ? "activacion" : "error",
      mensaje,
    }
  } catch (error) {
    return {
      ok: false,
      tipo: "error",
      mensaje:
        error instanceof Error ? error.message : "No se pudo conectar con FormSubmit.",
    }
  }
}

export async function enviarCorreoAgradecimiento({
  nombre,
  email,
}: {
  nombre: string
  email: string
}): Promise<ResultadoEnvio> {
  return enviarFormSubmit(email, {
    _subject: `Muchísimas gracias ${nombre.trim()}!`,
    mensaje: "Te agradecemos enormemente el regalito para Emilia ❤️.",
    _captcha: "false",
  })
}

export async function enviarNotificacionAdmins({
  nombre,
  email,
  producto,
  cantidad,
}: DatosReserva): Promise<ResultadoEnvio[]> {
  const cuerpo = {
    _subject: `Nueva reserva: ${producto} (${cantidad})`,
    nombre: nombre.trim(),
    email: email.trim(),
    producto,
    cantidad: String(cantidad),
    _captcha: "false",
  }

  return Promise.all([
    enviarFormSubmit(ADMIN_1, cuerpo),
    enviarFormSubmit(ADMIN_2, cuerpo),
  ])
}
