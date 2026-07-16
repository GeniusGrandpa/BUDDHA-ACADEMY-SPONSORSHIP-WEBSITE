import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

let _client: SupabaseClient<Database> | null = null

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function getEnvVar(name: string): string {
  const value = (import.meta.env as unknown as Record<string, string | undefined>)[name]
  if (!value) {
    const msg = `Missing required environment variable: ${name}. Check your .env file.`
    throw new Error(msg)
  }
  return value
}

function getStorageAdapter() {
  if (isBrowser) return undefined
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
}

export function getSupabaseClient() {
  if (_client) return _client

  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
  const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

  if (supabaseUrl === 'https://your-project.supabase.co') {
    const msg = 'VITE_SUPABASE_URL still has the placeholder value. Set it to your actual Supabase project URL in .env'
    throw new Error(msg)
  }

  _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
      storage: getStorageAdapter(),
    },
  })

  return _client
}

export const supabase = getSupabaseClient()
