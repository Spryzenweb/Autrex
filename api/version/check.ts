import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[Version Check API] Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      url: supabaseUrl?.substring(0, 30) + '...'
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch app version from site_settings table (key-value structure)
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'app_version')
      .limit(1)
      .maybeSingle()

    console.log('[Version Check API] Query result:', { data, error })

    if (error) {
      console.error('[Version Check API] Supabase error:', error)
      return res.status(500).json({
        error: 'Failed to fetch version',
        app_version: null,
        debug: error.message
      })
    }

    // Return the app version
    return res.status(200).json({
      app_version: data?.value || null,
      checked_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Version Check API] Exception:', error)
    return res.status(500).json({
      error: 'Internal server error',
      app_version: null
    })
  }
}
