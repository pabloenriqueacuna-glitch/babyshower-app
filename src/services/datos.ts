import { supabase } from '../lib/supabase'
import type { Regalo } from '../types'

interface FilaRegalo {
  id: string
  categoria: string | null
  nombre: string
  descripcion: string | null
  precio_estimado: number | null
  imagen_url: string | null
  cantidad_total: number
  cantidad_disponible: number
}

export interface DatosCompartidos {
  regalos: Regalo[]
  totalReservas: number
}

function cliente() {
  if (!supabase) throw new Error('El backend compartido no está configurado.')
  return supabase
}

function aRegalo(fila: FilaRegalo): Regalo {
  return {
    id: fila.id,
    categoria: fila.categoria ?? '',
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? undefined,
    precioEstimado: fila.precio_estimado ?? undefined,
    imagenUrl: fila.imagen_url ?? undefined,
    cantidadTotal: fila.cantidad_total,
    cantidadDisponible: fila.cantidad_disponible,
  }
}

export async function cargarDatosCompartidos(): Promise<DatosCompartidos> {
  const [{ data: regalos, error: errorRegalos }, { data: totalReservas, error: errorReservas }] =
    await Promise.all([
      cliente().from('regalos').select('*').order('orden', { ascending: true }),
      cliente().rpc('contar_reservas'),
    ])

  if (errorRegalos) throw errorRegalos
  if (errorReservas) throw errorReservas

  return {
    regalos: ((regalos ?? []) as FilaRegalo[]).map(aRegalo),
    totalReservas: Number(totalReservas ?? 0),
  }
}

export async function reservarEnBackend(
  regaloId: string,
  nombreInvitado: string,
  emailInvitado: string,
  cantidad: number,
): Promise<boolean> {
  const { data, error } = await cliente().rpc('reservar_regalo', {
    p_regalo_id: regaloId,
    p_nombre: nombreInvitado,
    p_email: emailInvitado,
    p_cantidad: cantidad,
  })

  if (error) throw error
  return data === true
}

export async function guardarInventarioEnBackend(regalos: Regalo[]): Promise<void> {
  const { error } = await cliente().rpc('cargar_inventario', { p_regalos: regalos })
  if (error) throw error
}

export function suscribirDatos(alCambiar: () => void): () => void {
  const clienteSupabase = supabase
  if (!clienteSupabase) return () => {}

  const canal = clienteSupabase
    .channel('datos-tiempo-real')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'regalos' }, alCambiar)
    .subscribe()

  return () => {
    void clienteSupabase.removeChannel(canal)
  }
}
