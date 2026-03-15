import { EventEmitter } from 'events'
import { lcuConnector } from './lcuConnector'
import { gameflowMonitor } from './gameflowMonitor'
import { settingsService } from './settingsService'

interface AutoMessageSettings {
  enabled: boolean
  messages: string[]
  delay: number // milliseconds
  sendOnLobbyJoin: boolean
}

export class AutoMessageService extends EventEmitter {
  private monitoringActive: boolean = false
  private messageTimeout: NodeJS.Timeout | null = null
  private lastLobbyId: string | null = null

  constructor() {
    super()
    this.setupEventListeners()
  }

  async start(): Promise<void> {
    this.monitoringActive = true
    console.log('[AutoMessageService] Started monitoring')
  }

  stop(): void {
    this.monitoringActive = false
    this.clearMessageTimeout()
    console.log('[AutoMessageService] Stopped monitoring')
  }

  private setupEventListeners(): void {
    // Listen for phase changes
    gameflowMonitor.on('phase-changed', async (phase: string, previousPhase: string) => {
      if (!this.monitoringActive) return

      // Detect champion select (game lobby) entry
      if (phase === 'ChampSelect' && previousPhase !== 'ChampSelect') {
        console.log('[AutoMessageService] Entered champion select, triggering auto message')
        await this.handleChampSelectEntered()
      }
    })

    // Listen for LCU connection events
    lcuConnector.on('connected', () => {
      if (this.monitoringActive) {
        this.start()
      }
    })

    lcuConnector.on('disconnected', () => {
      this.clearMessageTimeout()
      this.lastLobbyId = null
    })
  }

  private async handleChampSelectEntered(): Promise<void> {
    console.log('[AutoMessageService] handleChampSelectEntered called')
    const settings = this.getSettings()

    console.log('[AutoMessageService] Settings:', settings)

    if (!settings.enabled || !settings.sendOnLobbyJoin) {
      console.log(
        '[AutoMessageService] Auto message disabled in settings - enabled:',
        settings.enabled,
        'sendOnLobbyJoin:',
        settings.sendOnLobbyJoin
      )
      return
    }

    if (!settings.messages || settings.messages.length === 0) {
      console.log('[AutoMessageService] No messages configured')
      return
    }

    console.log(
      '[AutoMessageService] Will send',
      settings.messages.length,
      'messages:',
      settings.messages
    )

    try {
      // Get champ select session to get chat room ID
      console.log('[AutoMessageService] Getting champ select session...')
      const champSelectSession = await lcuConnector.getChampSelectSession()

      if (!champSelectSession) {
        console.log('[AutoMessageService] No champ select session available')
        return
      }

      console.log('[AutoMessageService] Champ select session received')

      // Try multiple ways to get the chat room ID
      let chatRoomId = null

      // Method 1: From chatDetails
      if (champSelectSession.chatDetails) {
        console.log(
          '[AutoMessageService] Chat details:',
          JSON.stringify(champSelectSession.chatDetails, null, 2)
        )
        chatRoomId =
          champSelectSession.chatDetails.chatRoomName ||
          champSelectSession.chatDetails.multiUserChatId ||
          champSelectSession.chatDetails.mucJwtDto?.channelClaim
      }

      // Method 2: Try to get conversations and find champ select chat
      if (!chatRoomId) {
        console.log('[AutoMessageService] Trying to get conversations list...')
        try {
          const conversations = await lcuConnector.request('GET', '/lol-chat/v1/conversations')
          console.log('[AutoMessageService] Conversations:', JSON.stringify(conversations, null, 2))

          // Find the champ select conversation (type: championSelect or customGame)
          const champSelectConvo = conversations?.find(
            (c: any) => c.type === 'championSelect' || c.type === 'customGame'
          )

          if (champSelectConvo) {
            chatRoomId = champSelectConvo.id
            console.log('[AutoMessageService] Found champ select conversation:', chatRoomId)
          }
        } catch (error) {
          console.error('[AutoMessageService] Failed to get conversations:', error)
        }
      }

      if (!chatRoomId) {
        console.log('[AutoMessageService] No chat room ID found')
        console.log(
          '[AutoMessageService] Full session data:',
          JSON.stringify(champSelectSession, null, 2)
        )
        return
      }

      console.log('[AutoMessageService] Found chat room ID:', chatRoomId)

      // Prevent sending messages multiple times to the same lobby
      if (chatRoomId === this.lastLobbyId) {
        console.log('[AutoMessageService] Already sent messages to this champ select')
        return
      }

      this.lastLobbyId = chatRoomId
      console.log(
        '[AutoMessageService] New champ select detected, scheduling messages with delay:',
        settings.delay,
        'ms'
      )

      // Clear any existing timeout
      this.clearMessageTimeout()

      // Schedule message sending with delay
      this.messageTimeout = setTimeout(async () => {
        console.log('[AutoMessageService] Delay finished, sending messages now...')
        await this.sendMessages(settings.messages, chatRoomId)
      }, settings.delay)
    } catch (error) {
      console.error('[AutoMessageService] Error handling champ select entry:', error)
    }
  }

  private async sendMessages(messages: string[], chatRoomId: string): Promise<void> {
    if (!lcuConnector.isConnected()) {
      console.log('[AutoMessageService] Not connected to LCU')
      return
    }

    try {
      console.log('[AutoMessageService] Using chat room ID:', chatRoomId)

      // Send each message with a small delay between them
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i].trim()
        if (!message) continue

        try {
          await this.sendChatMessage(chatRoomId, message)
          console.log(`[AutoMessageService] Sent message ${i + 1}/${messages.length}: "${message}"`)

          // Wait 1 second between messages to avoid rate limiting
          if (i < messages.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        } catch (error) {
          console.error(`[AutoMessageService] Failed to send message ${i + 1}:`, error)
        }
      }

      this.emit('messages-sent', { count: messages.length })
    } catch (error) {
      console.error('[AutoMessageService] Error sending messages:', error)
      this.emit('error', error)
    }
  }

  private async sendChatMessage(chatRoomId: string, message: string): Promise<void> {
    try {
      console.log('[AutoMessageService] Attempting to send message to:', chatRoomId)
      console.log('[AutoMessageService] Message content:', message)

      // LCU Chat API endpoint - try with body field
      const response = await lcuConnector.request(
        'POST',
        `/lol-chat/v1/conversations/${chatRoomId}/messages`,
        {
          body: message
        }
      )
      console.log('[AutoMessageService] Message sent successfully:', response)
    } catch (error: any) {
      console.error('[AutoMessageService] Failed to send chat message:', error)
      console.error('[AutoMessageService] Error details:', error.response?.data || error.message)

      // Try alternative format with "message" field instead of "body"
      try {
        console.log('[AutoMessageService] Trying alternative message format...')
        const response = await lcuConnector.request(
          'POST',
          `/lol-chat/v1/conversations/${chatRoomId}/messages`,
          {
            message: message
          }
        )
        console.log('[AutoMessageService] Message sent with alternative format:', response)
      } catch (altError: any) {
        console.error('[AutoMessageService] Alternative format also failed:', altError)
        throw error
      }
    }
  }

  private clearMessageTimeout(): void {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout)
      this.messageTimeout = null
    }
  }

  private getSettings(): AutoMessageSettings {
    const settings = settingsService.get('autoMessage')
    return {
      enabled: settings?.enabled ?? false,
      messages: settings?.messages ?? [],
      delay: settings?.delay ?? 2000,
      sendOnLobbyJoin: settings?.sendOnLobbyJoin ?? true
    }
  }

  updateSettings(settings: Partial<AutoMessageSettings>): void {
    const currentSettings = this.getSettings()
    const newSettings = { ...currentSettings, ...settings }
    settingsService.set('autoMessage', newSettings)
    console.log('[AutoMessageService] Settings updated:', newSettings)
  }

  getStatus(): { active: boolean; settings: AutoMessageSettings } {
    return {
      active: this.monitoringActive,
      settings: this.getSettings()
    }
  }
}

// Singleton instance
export const autoMessageService = new AutoMessageService()
