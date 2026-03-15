import * as crypto from 'crypto'

const ENCRYPTION_KEY = crypto.scryptSync('autrex-license-key-v1', 'salt', 32)
const IV_LENGTH = 16

export class EncryptionService {
  /**
   * Encrypt data
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  /**
   * Decrypt data
   */
  static decrypt(text: string): string {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift()!, 'hex')
    const encryptedText = parts.join(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  /**
   * Hash data (one-way)
   */
  static hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex')
  }

  /**
   * Generate integrity checksum
   */
  static generateChecksum(data: any): string {
    const str = JSON.stringify(data)
    return crypto.createHmac('sha256', ENCRYPTION_KEY).update(str).digest('hex')
  }

  /**
   * Verify integrity checksum
   */
  static verifyChecksum(data: any, checksum: string): boolean {
    return this.generateChecksum(data) === checksum
  }
}
