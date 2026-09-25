import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id?: number
  name: string
  email: string
  phone: string
  interest: 'pack' | 'curso' | 'ambos'
  created_at?: string
}

export type Member = {
  id: string
  name: string
  email: string
  plan: 'pack' | 'curso' | 'ambos'
  active: boolean
  auth_id: string
  created_at: string
  expires_at: string | null
}

export type Video = {
  id: string
  title: string
  youtube_url: string
  modulo: string
  ordem: number
  plan: 'pack' | 'curso' | 'ambos'
  created_at: string
}

export type Plugin = {
  id: string
  name: string
  description: string
  file_url: string
  plan: 'pack' | 'curso' | 'ambos'
  versao?: string
  created_at: string
}

export type Progress = {
  id: string
  member_id: string
  video_id: string
  concluido: boolean
  assistido_em: string
}
