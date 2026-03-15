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
    const { getSupabaseClient } = await import('../lib/supabase.js')
    const supabase = getSupabaseClient()

    // Check if license exists and belongs to this hardware
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', key)
      .eq('hardware_id', hardwareId)
      .single()

    if (fetchError || !license) {
      return res.status(404).json({
        success: false,
        error: 'Lisans bulunamadı veya bu cihaza ait değil'
      })
    }

    const licenseData = license as any

    // Deactivate license (clear hardware ID only, preserve activation time)
    await supabase
      .from('licenses')
      .update({
        hardware_id: null
      } as any)
      .eq('id', licenseData.id)

    // Log deactivation
    await supabase.from('license_deactivations').insert({
      license_id: licenseData.id,
      hardware_id: hardwareId,
      reason: 'User requested deactivation'
    } as any)

    return res.status(200).json({
      success: true,
      message: 'Lisans başarıyla deaktive edildi'
    })
  } catch (error) {
    console.error('Deactivation error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
