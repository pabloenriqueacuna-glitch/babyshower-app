export interface DatosReserva {
  nombre: string
  producto: string
  cantidad: number
}

export function enviarNotificacionReserva({ nombre, producto, cantidad }: DatosReserva) {
  const url = 'https://formsubmit.co/pabloenriqueacuna@gmail.com'

  const datos = new FormData()
  datos.append('_subject', `Nueva reserva: ${producto} (${cantidad})`)
  datos.append('nombre', nombre)
  datos.append('producto', producto)
  datos.append('cantidad', String(cantidad))

  void fetch(url, {
    method: 'POST',
    body: datos,
  }).catch(() => {
    // Fire-and-forget: ignorar errores para no interrumpir el flujo
  })
}
