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
      valid: false,
      error: 'Missing required fields: key and hardwareId'
    })
  }

  try {
    const { getSupabaseClient } = await import('../lib/supabase.js')
    const supabase = getSupabaseClient()

    // Check if license exists in database
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', key)
      .single()

    if (error || !license) {
      return res.status(404).json({
        valid: false,
        active: false,
        message: 'Lisans bulunamadı'
      })
    }

    const licenseData = license as any

    // Check if license is active
    if (!licenseData.is_active) {
      return res.status(403).json({
        valid: false,
        active: false,
        message: 'Lisans devre dışı bırakılmış'
      })
    }

    // Check hardware ID match
    if (licenseData.hardware_id && licenseData.hardware_id !== hardwareId) {
      return res.status(403).json({
        valid: false,
        active: false,
        message: 'Bu lisans başka bir cihazda kullanılıyor'
      })
    }

    // Check expiration
    if (licenseData.expires_at) {
      const expiresAt = new Date(licenseData.expires_at)
      if (expiresAt < new Date()) {
        return res.status(403).json({
          valid: false,
          active: false,
          message: 'Lisans süresi dolmuş'
        })
      }
    }

    // Update last validation time
    await supabase
      .from('licenses')
      .update({ last_validation: new Date().toISOString() } as any)
      .eq('id', licenseData.id)

    // License is valid
    return res.status(200).json({
      valid: true,
      active: true,
      type: licenseData.type,
      expiresAt: licenseData.expires_at,
      message: 'Lisans geçerli'
    })
  } catch (error) {
    console.error('Validation error:', error)
    return res.status(500).json({
      valid: false,
      error: 'Internal server error'
    })
  }
}
