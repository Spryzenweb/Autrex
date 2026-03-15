/**
 * FETCH PROTECTION SERVICE
 * Protects against fetch API monkey-patching attacks
 */

import * as crypto from 'crypto'

export class FetchProtectionService {
  private static instance: FetchProtectionService
  private originalFetch: typeof fetch
  private suspiciousPatterns: RegExp[] = [
    /mock/i,
    /fake/i,
    /bypass/i,
    /crack/i,
    /patch/i,
    /ninja/i,
    /hook/i
  ]
  private validationToken: string
  private fetchIntegrityHash: string

  private constructor() {
    // Store original fetch immediately
    this.originalFetch = global.fetch
    this.validationToken = this.generateValidationToken()
    this.fetchIntegrityHash = this.calculateFetchIntegrity()

    // Freeze the original fetch to prevent modifications
    Object.freeze(this.originalFetch)
  }

  static getInstance(): FetchProtectionService {
    if (!FetchProtectionService.instance) {
      FetchProtectionService.instance = new FetchProtectionService()
    }
    return FetchProtectionService.instance
  }

  /**
   * Generate a unique validation token for this session
   */
  private generateValidationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Calculate integrity hash of fetch function
   */
  private calculateFetchIntegrity(): string {
    const fetchString = this.originalFetch.toString()
    return crypto.createHash('sha256').update(fetchString).digest('hex')
  }

  /**
   * Verify fetch integrity
   */
  verifyFetchIntegrity(): boolean {
    try {
      const currentHash = crypto.createHash('sha256').update(global.fetch.toString()).digest('hex')

      const isIntact = currentHash === this.fetchIntegrityHash

      if (!isIntact) {
        console.error('[SECURITY] Fetch API has been tampered with!')
        console.error('[SECURITY] Expected hash:', this.fetchIntegrityHash)
        console.error('[SECURITY] Current hash:', currentHash)
      }

      return isIntact
    } catch (error) {
      console.error('[SECURITY] Failed to verify fetch integrity:', error)
      return false
    }
  }

  /**
   * Detect if fetch has been monkey-patched
   */
  detectMonkeyPatch(): boolean {
    // Check if global.fetch is the same as our stored original
    if (global.fetch !== this.originalFetch) {
      console.error('[SECURITY] Fetch API has been replaced!')
      return true
    }

    // Check fetch function string for suspicious patterns
    const fetchString = global.fetch.toString()
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(fetchString)) {
        console.error('[SECURITY] Suspicious pattern detected in fetch:', pattern)
        return true
      }
    }

    // Check if fetch has been wrapped
    if (fetchString.includes('apply') || fetchString.includes('call')) {
      const stackTrace = new Error().stack || ''
      if (stackTrace.includes('mock') || stackTrace.includes('patch')) {
        console.error('[SECURITY] Fetch wrapper detected in stack trace')
        return true
      }
    }

    return false
  }

  /**
   * Protected fetch that validates integrity before each call
   */
  async protectedFetch(url: string, options?: RequestInit): Promise<Response> {
    // Verify fetch hasn't been tampered with
    if (this.detectMonkeyPatch()) {
      this.showSecurityMessage()
      setTimeout(() => process.exit(1), 5000)
      throw new Error('[SECURITY] Fetch API tampering detected. Application will now exit.')
    }

    // Verify integrity hash
    if (!this.verifyFetchIntegrity()) {
      this.showSecurityMessage()
      setTimeout(() => process.exit(1), 5000)
      throw new Error('[SECURITY] Fetch integrity check failed. Application will now exit.')
    }

    // Add validation token to headers for license API calls
    if (url.includes('/api/licenses/')) {
      const headers = new Headers(options?.headers)
      headers.set('X-Validation-Token', this.validationToken)
      headers.set('X-Integrity-Hash', this.fetchIntegrityHash)

      options = {
        ...options,
        headers
      }
    }

    // Use the original fetch
    try {
      const response = await this.originalFetch(url, options)

      // Verify response hasn't been mocked
      if (!this.verifyResponse(response, url)) {
        this.showSecurityMessage()
        setTimeout(() => process.exit(1), 5000)
        throw new Error('[SECURITY] Response validation failed')
      }

      return response
    } catch (error) {
      // Check if error is from a mock
      const errorString = String(error)
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(errorString)) {
          this.showSecurityMessage()
          setTimeout(() => process.exit(1), 5000)
          throw new Error('[SECURITY] Suspicious error pattern detected')
        }
      }
      throw error
    }
  }

  /**
   * Verify response authenticity
   */
  private verifyResponse(response: Response, url: string): boolean {
    // Check if response is from license API
    if (!url.includes('/api/licenses/')) {
      return true
    }

    // Verify response has expected properties
    if (!response.headers || !response.status) {
      console.error('[SECURITY] Response missing expected properties')
      return false
    }

    // Check for mock response indicators
    const responseString = JSON.stringify(response)
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(responseString)) {
        console.error('[SECURITY] Suspicious pattern in response:', pattern)
        return false
      }
    }

    return true
  }

  /**
   * Install fetch protection
   */
  install(): void {
    // Replace global.fetch with protected version
    const self = this

    Object.defineProperty(global, 'fetch', {
      configurable: false,
      enumerable: true,
      get() {
        return self.originalFetch
      },
      set(_value) {
        console.error('[SECURITY] Attempt to override fetch detected and blocked!')

        // Show message to attacker
        self.showSecurityMessage()

        // Exit after 5 seconds
        setTimeout(() => process.exit(1), 5000)

        throw new Error('[SECURITY] Fetch override blocked')
      }
    })

    console.log('[SECURITY] Fetch protection installed')
  }

  /**
   * Periodic integrity check
   */
  startIntegrityMonitoring(interval: number = 10000): NodeJS.Timeout {
    return setInterval(() => {
      if (this.detectMonkeyPatch() || !this.verifyFetchIntegrity()) {
        console.error('[SECURITY] Integrity check failed! Terminating application...')

        // Show epic message to attacker
        this.showSecurityMessage()

        // Wait 5 seconds for them to read it, then exit
        setTimeout(() => {
          process.exit(1)
        }, 5000)
      }
    }, interval)
  }

  /**
   * Show security message to attacker
   */
  private showSecurityMessage(): void {
    const { dialog } = require('electron')

    const messages = [
      '🛡️ Bize Karşı Kazanamazsın! 🛡️\n\nFetch API monkey-patching tespit edildi.\nGüvenlik sistemimiz seni yakaladı.\n\nŞimdi git ve meşru bir lisans al! 😎',
      '🔒 YAKALANDI! 🔒\n\nAPI hooking denemesi başarısız.\nBu oyunu kazanamazsın.\n\nHadi şimdi git! 👋',
      '⚔️ GÜVENLİK DUVARI AKTİF ⚔️\n\nMonkey-patching bypass denemesi engellendi.\nSistemimiz her şeyi görüyor.\n\nMeşru yoldan gel! 🚪',
      '🎯 HEDEF KİLİTLENDİ 🎯\n\nFetch integrity ihlali tespit edildi.\nBypass denemesi başarısız.\n\nOyun bitti! 🎮',
      '🚨 SIZMA GİRİŞİMİ ENGELLENDİ 🚨\n\nAPI tampering algılandı.\nGüvenlik protokolleri devrede.\n\nBaşka şansını dene! 🎲'
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    dialog.showMessageBoxSync({
      type: 'error',
      title: '🛡️ Güvenlik Sistemi Aktif',
      message: randomMessage,
      buttons: ['Tamam, Anladım 😔'],
      defaultId: 0
    })
  }

  /**
   * Get original fetch for internal use
   */
  getOriginalFetch(): typeof fetch {
    return this.originalFetch
  }
}

export const fetchProtectionService = FetchProtectionService.getInstance()
