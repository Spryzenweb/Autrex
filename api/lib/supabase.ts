import { createClient } from '@supabase/supabase-js'

// Supabase client singleton
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

// Database types
export interface License {
  id: string
  key: string
  type: 'REGULAR' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TRIAL'
  created_at: string
  activated_at: string | null
  expires_at: string | null
  hardware_id: string | null
  is_active: boolean
  activation_count: number
  last_validation: string | null
  metadata: Record<string, any>
}

export interface LicenseActivation {
  id: string
  license_id: string
  hardware_id: string
  activated_at: string
  ip_address: string | null
  user_agent: string | null
}

export interface LicenseDeactivation {
  id: string
  license_id: string
  hardware_id: string
  deactivated_at: string
  reason: string | null
}
