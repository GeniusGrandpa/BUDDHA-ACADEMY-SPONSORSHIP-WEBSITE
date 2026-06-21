import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

let _client: SupabaseClient<Database> | null = null

function getEnvVar(name: string): string {
  const value = import.meta.env[name] as string | undefined
  if (!value) {
    const msg = `Missing required environment variable: ${name}. Check your .env file.`
    console.error(`[Supabase] ${msg}`)
    throw new Error(msg)
  }
  return value
}

export function getSupabaseClient() {
  if (_client) return _client

  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

  if (supabaseUrl === 'https://your-project.supabase.co') {
    const msg = 'VITE_SUPABASE_URL still has the placeholder value. Set it to your actual Supabase project URL in .env'
    console.error(`[Supabase] ${msg}`)
    throw new Error(msg)
  }

  _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return _client
}

export const supabase = getSupabaseClient()
