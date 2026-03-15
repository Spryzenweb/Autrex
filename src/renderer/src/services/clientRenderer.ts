/**
 * Client Renderer Service
 * Website ile Electron app arasında köprü görevi görür
 * Login key'leri geçici olarak saklar ve Electron app'e sunar
 */

interface LoginKeyData {
  key: string
  userId: number
  username: string
  subscriptionStatus: string
  expiresAt: Date
  createdAt: Date
}

interface ClientRendererConfig {
  websiteUrl: string
  keyExpirationMinutes: number
}

class ClientRendererService {
  private config: ClientRendererConfig
  private activeKeys: Map<string, LoginKeyData> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: ClientRendererConfig) {
    this.config = config
    this.startCleanupTimer()
  }

  /**
   * Website'den login key alır ve geçici olarak saklar
   */
  async receiveLoginKey(keyData: {
    key: string
    userId: number
    username: string
    subscriptionStatus: string
    expiresAt: string
  }): Promise<boolean> {
    try {
      const loginKeyData: LoginKeyData = {
        key: keyData.key,
        userId: keyData.userId,
        username: keyData.username,
        subscriptionStatus: keyData.subscriptionStatus,
        expiresAt: new Date(keyData.expiresAt),
        createdAt: new Date()
      }

      // Key'i sakla
      this.activeKeys.set(keyData.key, loginKeyData)

      console.log(`Login key received and stored: ${keyData.key}`)
      return true
    } catch (error) {
      console.error('Error storing login key:', error)
      return false
    }
  }

  /**
   * Electron app'in login key sorgusu
   */
  async getLoginKey(requestedKey: string): Promise<LoginKeyData | null> {
    const keyData = this.activeKeys.get(requestedKey)

    if (!keyData) {
      console.log(`Login key not found: ${requestedKey}`)
      return null
    }

    // Key'in süresi dolmuş mu kontrol et
    if (new Date() > keyData.expiresAt) {
      console.log(`Login key expired: ${requestedKey}`)
      this.activeKeys.delete(requestedKey)
      return null
    }

    console.log(`Login key found and valid: ${requestedKey}`)
    return keyData
  }

  /**
   * Login key'i kullanıldıktan sonra sil (tek kullanımlık)
   */
  async consumeLoginKey(key: string): Promise<boolean> {
    const keyData = this.activeKeys.get(key)

    if (!keyData) {
      return false
    }

    // Key'i sil
    this.activeKeys.delete(key)
    console.log(`Login key consumed and removed: ${key}`)
    return true
  }

  /**
   * Aktif key'leri listele (debug için)
   */
  getActiveKeys(): string[] {
    return Array.from(this.activeKeys.keys())
  }

  /**
   * Süresi dolmuş key'leri temizle
   */
  private cleanupExpiredKeys(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    for (const [key, data] of this.activeKeys.entries()) {
      if (now > data.expiresAt) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => {
      this.activeKeys.delete(key)
      console.log(`Expired key cleaned up: ${key}`)
    })

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired keys`)
    }
  }

  /**
   * Temizlik timer'ını başlat
   */
  private startCleanupTimer(): void {
    // Her dakika süresi dolmuş key'leri temizle
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredKeys()
    }, 60 * 1000)
  }

  /**
   * Servisi kapat
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.activeKeys.clear()
  }

  /**
   * Website'den key alma endpoint'i için HTTP server başlat
   */
  async startHttpServer(port: number = 3002): Promise<void> {
    // Bu kısım Node.js HTTP server gerektirir
    // Electron main process'te implement edilecek
    console.log(`Client Renderer HTTP server should start on port ${port}`)
  }
}

// Singleton instance
const clientRendererService = new ClientRendererService({
  websiteUrl: 'https://autrex.kesug.com',
  keyExpirationMinutes: 5
})

export { ClientRendererService, clientRendererService }
export type { LoginKeyData, ClientRendererConfig }
