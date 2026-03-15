import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key, hardwareId } = req.body

  // Validate input
  if (!key || !hardwareId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: key and hardwareId'
    })
  }

  try {
    console.log('[ACTIVATE] Starting activation for key:', key)
    console.log('[ACTIVATE] Environment check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY
    })

    const { getSupabaseClient } = await import('../lib/supabase.js')
    const supabase = getSupabaseClient()
    console.log('[ACTIVATE] Supabase client created')

    // Check if license exists
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', key)
      .single()

    console.log('[ACTIVATE] License query result:', { license, fetchError })

    if (fetchError || !license) {
      console.log('[ACTIVATE] License not found')
      return res.status(404).json({
        success: false,
        error: 'Lisans bulunamadı'
      })
    }

    // Type assertion for license
    const licenseData = license as any

    if (!licenseData.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Lisans devre dışı'
      })
    }

    // TRIAL LICENSE HWID CHECK - Strict: One HWID = One Trial Ever
    if (licenseData.type === 'TRIAL') {
      console.log('[ACTIVATE] Checking trial HWID for:', hardwareId)

      // Check if this HWID has EVER used ANY trial before
      const { data: existingTrials, error: trialCheckError } = await supabase
        .from('trial_hwid_tracking')
        .select('*')
        .eq('hardware_id', hardwareId)
        .limit(1)

      console.log('[ACTIVATE] Trial check result:', { existingTrials, trialCheckError })

      if (existingTrials && existingTrials.length > 0) {
        // HWID has used a trial before - ALWAYS REJECT
        const existingTrial = existingTrials[0] as { trial_license_id: string }
        console.log('[ACTIVATE] HWID already used trial, rejecting:', {
          hwid: hardwareId,
          previousTrial: existingTrial.trial_license_id,
          attemptedTrial: licenseData.id
        })

        // Deactivate the new trial license
        // @ts-ignore - Supabase type inference issue
        const { error: deactivateError } = await supabase
          .from('licenses')
          .update({ is_active: false })
          .eq('id', licenseData.id)

        if (deactivateError) {
          console.error('[ACTIVATE] Failed to deactivate trial:', deactivateError)
        }

        return res.status(403).json({
          success: false,
          error:
            'Bu cihazda daha önce trial lisans kullanıldı. Trial lisansı sadece bir kez kullanılabilir.'
        })
      }

      // First trial for this HWID - record it
      console.log('[ACTIVATE] First trial for HWID, recording...')
      // @ts-ignore - Supabase type inference issue
      const { error: insertError } = await supabase.from('trial_hwid_tracking').insert([
        {
          hardware_id: hardwareId,
          trial_license_id: licenseData.id
        }
      ])

      if (insertError) {
        console.error('[ACTIVATE] Failed to record trial usage:', insertError)
        // Continue anyway - don't block activation due to tracking failure
      } else {
        console.log('[ACTIVATE] Trial usage recorded successfully')
      }
    }

    // Check if already activated on different device
    if (licenseData.hardware_id && licenseData.hardware_id !== hardwareId) {
      return res.status(409).json({
        success: false,
        error: 'Bu lisans başka bir cihazda aktif'
      })
    }

    // Calculate expiration based on type (only if not already set)
    let expiresAt = licenseData.expires_at ? new Date(licenseData.expires_at) : null
    let activatedAt = licenseData.activated_at ? new Date(licenseData.activated_at) : null

    // Only calculate new expiration if this is first activation
    if (!licenseData.expires_at || !licenseData.activated_at) {
      activatedAt = new Date() // Set new activation time only for first activation

      // Get duration from metadata for TRIAL licenses, otherwise use defaults
      let duration: number | null = null

      if (licenseData.type === 'TRIAL' && licenseData.metadata) {
        try {
          const metadata =
            typeof licenseData.metadata === 'string'
              ? JSON.parse(licenseData.metadata)
              : licenseData.metadata
          const durationHours = metadata.duration_hours || 6
          duration = durationHours * 60 * 60 * 1000
        } catch (e) {
          console.log('[ACTIVATE] Failed to parse metadata, using default 6 hours')
          duration = 6 * 60 * 60 * 1000
        }
      } else {
        const durations: Record<string, number | null> = {
          REGULAR: null,
          DAILY: 24 * 60 * 60 * 1000,
          WEEKLY: 7 * 24 * 60 * 60 * 1000,
          MONTHLY: 30 * 24 * 60 * 60 * 1000,
          TRIAL: 6 * 60 * 60 * 1000
        }
        duration = durations[licenseData.type]
      }

      if (duration) {
        expiresAt = new Date(activatedAt.getTime() + duration)
      }

      // Update activated_at, expires_at and increment activation_count for first activation
      // @ts-ignore - Supabase type inference issue
      const { error: updateError } = await supabase
        .from('licenses')
        .update({
          hardware_id: hardwareId,
          activated_at: activatedAt.toISOString(),
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          activation_count: (licenseData.activation_count || 0) + 1
        })
        .eq('id', licenseData.id)

      if (updateError) {
        console.error('[ACTIVATE] Failed to update license:', updateError)
      }
    } else {
      // Just update hardware_id for reactivation
      // @ts-ignore - Supabase type inference issue
      const { error: updateError } = await supabase
        .from('licenses')
        .update({
          hardware_id: hardwareId
        })
        .eq('id', licenseData.id)

      if (updateError) {
        console.error('[ACTIVATE] Failed to update hardware_id:', updateError)
      }
    }

    // Log activation
    // @ts-ignore - Supabase type inference issue
    const { error: logError } = await supabase.from('license_activations').insert([
      {
        license_id: licenseData.id,
        hardware_id: hardwareId,
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      }
    ])

    if (logError) {
      console.error('[ACTIVATE] Failed to log activation:', logError)
    }

    return res.status(200).json({
      success: true,
      message: 'Lisans başarıyla aktive edildi',
      activatedAt: activatedAt?.toISOString() || new Date().toISOString(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null
    })
  } catch (error) {
    console.error('[ACTIVATE] Error:', error)
    console.error('[ACTIVATE] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
}
