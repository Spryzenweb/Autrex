import { app } from 'electron'

const API_URL =
  process.env.VITE_VERSION_CHECK_API?.replace('/api/version/check', '') ||
  process.env.LICENSE_API_URL ||
  'https://autrex.vercel.app'

export class VersionCheckService {
  private currentVersion: string

  constructor() {
    this.currentVersion = app.getVersion()
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return this.currentVersion
  }

  /**
   * Check if app version is compatible with required version
   */
  async checkVersion(): Promise<{
    isCompatible: boolean
    currentVersion: string
    requiredVersion: string | null
    message?: string
  }> {
    try {
      console.log('[VersionCheck] Checking version...')
      console.log('[VersionCheck] Current version:', this.currentVersion)
      console.log('[VersionCheck] API URL:', API_URL)

      // Fetch required version from API
      const response = await fetch(`${API_URL}/api/version/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('[VersionCheck] API response status:', response.status)

      if (!response.ok) {
        console.error('[VersionCheck] API error:', response.statusText)
        // If we can't fetch, allow usage (fail open)
        return {
          isCompatible: true,
          currentVersion: this.currentVersion,
          requiredVersion: null,
          message: 'Could not check version, allowing usage'
        }
      }

      const data = await response.json()
      const requiredVersion = data?.app_version || data?.version

      console.log('[VersionCheck] Required version from API:', requiredVersion)

      if (!requiredVersion) {
        // No required version set, allow usage
        return {
          isCompatible: true,
          currentVersion: this.currentVersion,
          requiredVersion: null
        }
      }

      // Compare versions
      const isCompatible = this.compareVersions(this.currentVersion, requiredVersion)

      console.log('[VersionCheck] Comparison result:', {
        current: this.currentVersion,
        required: requiredVersion,
        isCompatible
      })

      return {
        isCompatible,
        currentVersion: this.currentVersion,
        requiredVersion,
        message: isCompatible ? 'Version is compatible' : 'Please update to the latest version'
      }
    } catch (error) {
      console.error('[VersionCheck] Exception:', error)
      // On error, allow usage (fail open)
      return {
        isCompatible: true,
        currentVersion: this.currentVersion,
        requiredVersion: null,
        message: 'Error checking version, allowing usage'
      }
    }
  }

  /**
   * Compare two semantic versions
   * Returns true if current >= required
   */
  private compareVersions(current: string, required: string): boolean {
    // Remove any beta/alpha suffixes for comparison
    const cleanCurrent = current.replace(/-beta|-alpha|-rc\.\d+/g, '')
    const cleanRequired = required.replace(/-beta|-alpha|-rc\.\d+/g, '')

    const currentParts = cleanCurrent.split('.').map(Number)
    const requiredParts = cleanRequired.split('.').map(Number)

    // Pad arrays to same length
    while (currentParts.length < requiredParts.length) currentParts.push(0)
    while (requiredParts.length < currentParts.length) requiredParts.push(0)

    // Compare each part
    for (let i = 0; i < currentParts.length; i++) {
      if (currentParts[i] > requiredParts[i]) return true
      if (currentParts[i] < requiredParts[i]) return false
    }

    // Versions are equal
    return true
  }
}

// Singleton instance
export const versionCheckService = new VersionCheckService()
