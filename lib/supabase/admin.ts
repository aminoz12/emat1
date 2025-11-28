import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the service role key
 * This bypasses RLS (Row Level Security) policies
 * ⚠️ Only use this in server-side admin API routes after verifying admin access
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not configured')
    console.error('📝 Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file')
    console.error('📍 Get it from: Supabase Dashboard → Project Settings → API → service_role key')
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Please add it to your .env.local file. Get it from Supabase Dashboard → Project Settings → API → service_role key')
  }

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

