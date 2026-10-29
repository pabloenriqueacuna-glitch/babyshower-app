import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const usaBackendCompartido = Boolean(url && anonKey)

export const supabase = usaBackendCompartido ? createClient(url, anonKey) : null
