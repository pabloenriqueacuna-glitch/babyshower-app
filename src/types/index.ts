export interface Regalo {
  id: string
  categoria: string
  nombre: string
  descripcion?: string
  precioEstimado?: number
  imagenUrl?: string
  cantidadTotal: number
  cantidadDisponible: number
}

export interface Reserva {
  id: string
  regaloId: string
  nombreInvitado: string
  emailInvitado: string
  cantidadRegalada: number
  fecha: string
}

export interface ResultadoImportacion {
  regalos: Regalo[]
  errores: string[]
  advertencias: string[]
}
