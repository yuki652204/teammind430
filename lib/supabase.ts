import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids throwing at module load time during Next.js build
// when NEXT_PUBLIC_SUPABASE_URL is not yet available in the build environment.
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase env vars are not configured.')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Kept for backwards compatibility with any client-side usage
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service env vars are not configured.')
  return createClient(url, key)
}
