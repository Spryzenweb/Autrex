import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import WebSocket from 'ws'
import { app } from 'electron'
import axios from 'axios'
import { GamePathService } from './gamePathService'

interface LCUCredentials {
  protocol: string
  address: string
  port: number
  username: string
  password: string
}

interface LCUConnectionOptions {
  pollInterval?: number
  maxRetries?: number
  connectionTimeout?: number
}

export class LCUConnector extends EventEmitter {
  private credentials: LCUCredentials | null = null
  private ws: WebSocket | null = null
  private connected: boolean = false
  private pollInterval: NodeJS.Timeout | null = null
  private subscriptions: Set<string> = new Set()
  private options: Required<LCUConnectionOptions>
  private axiosInstance: any = null
  // private _reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 2000
  private autoConnectInterval: NodeJS.Timeout | null = null

  constructor(options: LCUConnectionOptions = {}) {
    super()
    this.options = {
      pollInterval: options.pollInterval ?? 3000,
      maxRetries: options.maxRetries ?? 10,
      connectionTimeout: options.connectionTimeout ?? 10000
    }
  }

  async connect(): Promise<boolean> {
    try {
      console.log('[LCUConnector] Attempting to connect to League Client...')

      // Try to find and read the lockfile
      const credentials = await this.findLockfile()
      if (!credentials) {
        console.log('[LCUConnector] League client lockfile not found')
        if (!this.autoConnectInterval) {
          this.emit('error', new Error('League client not found'))
        }
        return false
      }

      console.log(`[LCUConnector] Found credentials: ${credentials.address}:${credentials.port}`)
      this.credentials = credentials

      // Create axios instance with improved configuration
      this.axiosInstance = axios.create({
        baseURL: `https://${credentials.address}:${credentials.port}`,
        auth: {
          username: credentials.username,
          password: credentials.password
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          keepAlive: true,
          timeout: this.options.connectionTimeout
        }),
        timeout: this.options.connectionTimeout,
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses
      })

      // Test connection with retry logic
      const isConnected = await this.testConnectionWithRetry()
      if (!isConnected) {
        console.log('[LCUConnector] Failed to establish connection after retries')
        if (!this.autoConnectInterval) {
          this.emit('error', new Error('Failed to connect to League client'))
        }
        return false
      }

      // Establish WebSocket connection with retry
      await this.connectWebSocketWithRetry()

      this.connected = true
      // this._reconnectAttempts = 0
      console.log('[LCUConnector] Successfully connected to League Client')
      this.emit('connected', credentials)

      // Start monitoring for client disconnection
      this.startPolling()

      return true
    } catch (error) {
      console.error('[LCUConnector] Connection failed:', error)
      if (!this.autoConnectInterval) {
        this.emit(
          'error',
          error instanceof Error ? error : new Error('Failed to connect to League client')
        )
      }
      return false
    }
  }

  disconnect(): void {
    console.log('[LCUConnector] Disconnecting...')
    this.stopPolling()

    if (this.ws) {
      this.ws.removeAllListeners()
      this.ws.close()
      this.ws = null
    }

    this.connected = false
    this.credentials = null
    this.axiosInstance = null
    // this._reconnectAttempts = 0
    this.emit('disconnected')
  }

  async subscribe(eventName: string): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      this.ws.send(JSON.stringify([5, eventName]))
      this.subscriptions.add(eventName)
      return true
    } catch {
      return false
    }
  }

  async unsubscribe(eventName: string): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      this.ws.send(JSON.stringify([6, eventName]))
      this.subscriptions.delete(eventName)
      return true
    } catch {
      return false
    }
  }

  async request(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.axiosInstance) {
      throw new Error('Not connected to League client')
    }

    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
        timeout: this.options.connectionTimeout
      })
      return response.data
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('[LCUConnector] Connection lost, attempting to reconnect...')
        this.handleDisconnection()
        throw new Error('Connection lost to League client')
      }

      if (error.response?.status === 404) {
        // 404 is often expected for some endpoints
        return null
      }

      console.error(`[LCUConnector] Request failed: ${method} ${endpoint}`, error.message)
      throw error
    }
  }

  async requestRaw(method: string, endpoint: string, data?: any): Promise<any> {
    if (!this.axiosInstance) {
      throw new Error('Not connected to League client')
    }

    try {
      const response = await this.axiosInstance.request({
        method,
        url: endpoint,
        data,
        timeout: this.options.connectionTimeout,
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [
          (data) => {
            // For raw numbers or primitives, convert to JSON string
            if (typeof data === 'number' || typeof data === 'string' || typeof data === 'boolean') {
              return JSON.stringify(data)
            }
            return JSON.stringify(data)
          }
        ]
      })
      return response.data
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.log('[LCUConnector] Connection lost, attempting to reconnect...')
        this.handleDisconnection()
        throw new Error('Connection lost to League client')
      }

      if (error.response?.status === 404) {
        // 404 is often expected for some endpoints
        return null
      }

      console.error(`[LCUConnector] Request failed: ${method} ${endpoint}`, error.message)
      throw error
    }
  }

  async getGameflowPhase(): Promise<string> {
    try {
      const phase = await this.request('GET', '/lol-gameflow/v1/gameflow-phase')
      return phase || 'None'
    } catch {
      return 'None'
    }
  }

  async getGameflowSession(): Promise<any> {
    try {
      const session = await this.request('GET', '/lol-gameflow/v1/session')
      return session
    } catch {
      return null
    }
  }

  async getChampSelectSession(): Promise<any> {
    try {
      return await this.request('GET', '/lol-champ-select/v1/session')
    } catch {
      return null
    }
  }

  async getLobbySession(): Promise<any> {
    try {
      return await this.request('GET', '/lol-lobby/v2/lobby')
    } catch {
      return null
    }
  }

  async performChampSelectAction(actionId: number, championId: number): Promise<any> {
    try {
      return await this.request('PATCH', `/lol-champ-select/v1/session/actions/${actionId}`, {
        championId,
        completed: true
      })
    } catch (error) {
      console.error('[LCUConnector] Failed to perform champ select action:', error)
      throw error
    }
  }

  async pickChampion(championId: number): Promise<any> {
    try {
      const session = await this.getChampSelectSession()
      if (!session) throw new Error('No active champ select session')

      // Find pick action for local player
      const pickAction = session.actions
        .flat()
        .find(
          (action: any) =>
            action.type === 'pick' &&
            action.actorCellId === session.localPlayerCellId &&
            !action.completed
        )

      if (!pickAction) throw new Error('No available pick action')

      return await this.performChampSelectAction(pickAction.id, championId)
    } catch (error) {
      console.error('[LCUConnector] Failed to pick champion:', error)
      throw error
    }
  }

  async banChampion(championId: number): Promise<any> {
    try {
      const session = await this.getChampSelectSession()
      if (!session) throw new Error('No active champ select session')

      // Find ban action for local player
      const banAction = session.actions
        .flat()
        .find(
          (action: any) =>
            action.type === 'ban' &&
            action.actorCellId === session.localPlayerCellId &&
            !action.completed
        )

      if (!banAction) throw new Error('No available ban action')

      return await this.performChampSelectAction(banAction.id, championId)
    } catch (error) {
      console.error('[LCUConnector] Failed to ban champion:', error)
      throw error
    }
  }

  async hoverChampion(championId: number): Promise<any> {
    try {
      const session = await this.getChampSelectSession()
      if (!session) throw new Error('No active champ select session')

      // Find current action for local player
      const currentAction = session.actions
        .flat()
        .find(
          (action: any) => action.actorCellId === session.localPlayerCellId && action.isInProgress
        )

      if (!currentAction) throw new Error('No current action')

      return await this.request(
        'PATCH',
        `/lol-champ-select/v1/session/actions/${currentAction.id}`,
        {
          championId,
          completed: false
        }
      )
    } catch (error) {
      console.error('[LCUConnector] Failed to hover champion:', error)
      throw error
    }
  }

  async getOwnedChampions(): Promise<any> {
    try {
      const result = await this.request('GET', '/lol-champions/v1/owned-champions-minimal')
      console.log('[LCUConnector] Owned champions raw response:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('[LCUConnector] Failed to get owned champions:', error)
      return []
    }
  }

  async getAllChampions(): Promise<any> {
    try {
      const result = await this.request('GET', '/lol-game-data/assets/v1/champion-summary.json')
      console.log(
        '[LCUConnector] All champions raw response length:',
        Array.isArray(result) ? result.length : 'Not an array'
      )
      if (Array.isArray(result) && result.length > 0) {
        console.log('[LCUConnector] First champion sample:', JSON.stringify(result[0], null, 2))
      }
      return result
    } catch (error) {
      console.error('[LCUConnector] Failed to get all champions:', error)
      return []
    }
  }

  async getCurrentSummoner(): Promise<any> {
    try {
      const result = await this.request('GET', '/lol-summoner/v1/current-summoner')
      console.log('[LCUConnector] Current summoner full response:', JSON.stringify(result, null, 2))

      // Riot uses gameName#tagLine format now
      const displayName =
        result.gameName && result.tagLine
          ? `${result.gameName}#${result.tagLine}`
          : result.displayName || result.internalName || 'Unknown'

      return {
        success: true,
        summoner: {
          displayName: displayName,
          summonerLevel: result.summonerLevel,
          profileIconId: result.profileIconId,
          puuid: result.puuid
        }
      }
    } catch (error) {
      console.error('[LCUConnector] Failed to get current summoner:', error)
      return { success: false, error: 'Failed to get summoner info' }
    }
  }

  async getMatchmakingSearchState(): Promise<any> {
    try {
      return await this.request('GET', '/lol-lobby/v2/lobby/matchmaking/search-state')
    } catch {
      return null
    }
  }

  async getLobbyData(): Promise<any> {
    try {
      return await this.request('GET', '/lol-lobby/v2/lobby')
    } catch {
      return null
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  private async findLockfile(): Promise<LCUCredentials | null> {
    const possiblePaths: string[] = []

    // Use the centralized GamePathService
    try {
      const gamePathService = GamePathService.getInstance()
      const lockfilePath = await gamePathService.getLockfilePath()

      if (lockfilePath) {
        possiblePaths.push(lockfilePath)
        console.log('LCU: Using detected lockfile path:', lockfilePath)
      }
    } catch (error) {
      console.error('Failed to get lockfile path from GamePathService:', error)
    }

    // Add common fallback paths if detection failed
    if (possiblePaths.length === 0) {
      const fallbackPaths = [
        'C:\\Riot Games\\League of Legends\\lockfile',
        'D:\\Riot Games\\League of Legends\\lockfile',
        'E:\\Riot Games\\League of Legends\\lockfile',
        'F:\\Riot Games\\League of Legends\\lockfile',
        'G:\\Riot Games\\League of Legends\\lockfile',
        'H:\\Riot Games\\League of Legends\\lockfile',
        'C:\\Program Files\\Riot Games\\League of Legends\\lockfile',
        'C:\\Program Files (x86)\\Riot Games\\League of Legends\\lockfile',
        'D:\\Program Files\\Riot Games\\League of Legends\\lockfile',
        'D:\\Program Files (x86)\\Riot Games\\League of Legends\\lockfile',
        '/Applications/League of Legends.app/Contents/LoL/lockfile',
        path.join(app.getPath('home'), 'Riot Games/League of Legends/lockfile')
      ]

      possiblePaths.push(...fallbackPaths)
    }

    for (const lockfilePath of possiblePaths) {
      try {
        const lockfileContent = await fs.promises.readFile(lockfilePath, 'utf-8')
        const parts = lockfileContent.split(':')

        if (parts.length < 5) {
          console.error('LCU: Invalid lockfile format:', lockfileContent)
          continue
        }

        // Lockfile format: ProcessName:ProcessId:Port:Password:Protocol
        const [, , port, password, protocol] = parts

        return {
          protocol: protocol?.trim() || 'https',
          address: '127.0.0.1',
          port: parseInt(port, 10),
          username: 'riot',
          password: password.trim() // Trim any whitespace/newlines
        }
      } catch {
        // Continue to next path
      }
    }

    // Try to find using process
    return this.findLockfileFromProcess()
  }

  private async findLockfileFromProcess(): Promise<LCUCredentials | null> {
    if (process.platform === 'win32') {
      try {
        const { exec } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(exec)

        // Use WMIC to find the League client process and its command line
        const { stdout } = await execAsync(
          'wmic process where "name=\'LeagueClientUx.exe\'" get CommandLine /format:list'
        )

        if (stdout) {
          // Extract port and auth token from command line
          const portMatch = stdout.match(/--app-port=(\d+)/)
          const tokenMatch = stdout.match(/--remoting-auth-token=([a-zA-Z0-9_-]+)/)

          if (portMatch && tokenMatch) {
            return {
              protocol: 'https',
              address: '127.0.0.1',
              port: parseInt(portMatch[1], 10),
              username: 'riot',
              password: tokenMatch[1]
            }
          }
        }
      } catch {
        // Failed to find process, continue
      }
    }

    return null
  }

  private async testConnection(): Promise<boolean> {
    try {
      await this.request('GET', '/lol-summoner/v1/current-summoner')
      return true
    } catch {
      return false
    }
  }

  private async testConnectionWithRetry(): Promise<boolean> {
    for (let i = 0; i < this.options.maxRetries; i++) {
      try {
        const result = await this.testConnection()
        if (result) return true
      } catch (error) {
        console.log(
          `[LCUConnector] Connection test attempt ${i + 1}/${this.options.maxRetries} failed`
        )
      }

      if (i < this.options.maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    return false
  }

  private async connectWebSocketWithRetry(): Promise<void> {
    for (let attempt = 0; attempt < this.maxReconnectAttempts; attempt++) {
      try {
        await this.connectWebSocket()
        return
      } catch (error) {
        console.log(
          `[LCUConnector] WebSocket connection attempt ${attempt + 1}/${this.maxReconnectAttempts} failed`
        )
        if (attempt < this.maxReconnectAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, this.reconnectDelay))
        }
      }
    }
    throw new Error('Failed to establish WebSocket connection after retries')
  }

  private async connectWebSocket(): Promise<void> {
    if (!this.credentials) {
      throw new Error('No credentials available')
    }

    const wsUrl = `wss://${this.credentials.address}:${this.credentials.port}/`
    const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString(
      'base64'
    )

    this.ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Basic ${auth}`
      },
      rejectUnauthorized: false
    })

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error('WebSocket not initialized'))

      this.ws.on('open', () => {
        resolve()
      })

      this.ws.on('message', (data) => {
        try {
          const messageStr = data.toString()
          // Skip empty messages
          if (!messageStr || messageStr.trim() === '') {
            return
          }

          const message = JSON.parse(messageStr)
          if (Array.isArray(message) && message.length >= 3) {
            const [opcode, eventName, eventData] = message
            if (opcode === 8 && eventName) {
              // Log champion select events
              if (eventName.includes('lol-champ-select')) {
                // Champion select event received
              }

              this.emit('event', eventName, eventData)

              // Emit specific events
              if (eventName === 'OnJsonApiEvent_lol-gameflow_v1_gameflow-phase') {
                this.emit('gameflow-phase', eventData?.data)
              } else if (eventName === 'OnJsonApiEvent_lol-champ-select_v1_session') {
                this.emit('champ-select-session', eventData?.data)
              } else if (eventName === 'OnJsonApiEvent_lol-lobby_v2_lobby') {
                this.emit('lobby-session', eventData?.data)
              }
            }
          }
        } catch (error) {
          // Only log if it's not an empty message error
          if (error instanceof Error && error.message !== 'Unexpected end of JSON input') {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
      })

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      })

      this.ws.on('close', () => {
        this.handleDisconnection()
      })
    })
  }

  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      if (!(await this.testConnection())) {
        this.handleDisconnection()
      }
    }, this.options.pollInterval)
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  private handleDisconnection(): void {
    const wasConnected = this.connected
    this.disconnect()

    if (wasConnected) {
      // Attempt to reconnect
      setTimeout(() => {
        this.connect()
      }, 5000)
    }
  }

  // Start polling for League client
  startAutoConnect(interval: number = 5000): void {
    this.stopAutoConnect()

    // Try immediate connection
    this.connect()

    // Set up polling
    this.autoConnectInterval = setInterval(() => {
      if (!this.connected) {
        this.connect()
      }
    }, interval)
  }

  stopAutoConnect(): void {
    if (this.autoConnectInterval) {
      clearInterval(this.autoConnectInterval)
      this.autoConnectInterval = null
    }
  }

  /**
   * Start matchmaking queue
   */
 async startQueue(queueId: number): Promise<void> {
    if (!this.connected) {
        throw new Error('Not connected to LCU')
    }

    try {
        // Mevcut lobiyi kontrol et
        const currentLobby = await this.request('GET', '/lol-lobby/v2/lobby').catch(() => null)

        // Lobi yoksa veya farklı queue ise yeni lobi oluştur
        if (!currentLobby || currentLobby?.gameConfig?.queueId !== queueId) {
            await this.request('POST', '/lol-lobby/v2/lobby', { queueId })
        }

        // Kuyruğa gir
        await this.request('POST', '/lol-lobby/v2/lobby/matchmaking/search')
        console.log('[LCU] Started queue:', queueId)
    } catch (error) {
        console.error('[LCU] Failed to start queue:', error)
        throw error
    }
}

  /**
   * Stop matchmaking queue
   */
  async stopQueue(): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to LCU')
    }

    try {
      await this.request('DELETE', '/lol-lobby/v2/lobby/matchmaking/search')
      console.log('[LCU] Stopped queue')
    } catch (error) {
      console.error('[LCU] Failed to stop queue:', error)
      throw error
    }
  }

  /**
   * Accept a trade request
   */
  async acceptTrade(tradeId: number): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to LCU')
    }

    try {
      await this.request('POST', `/lol-champ-select/v1/session/trades/${tradeId}/accept`)
      console.log('[LCU] Accepted trade:', tradeId)
    } catch (error) {
      console.error('[LCU] Failed to accept trade:', error)
      throw error
    }
  }

  /**
   * Decline a trade request
   */
  async declineTrade(tradeId: number): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to LCU')
    }

    try {
      await this.request('POST', `/lol-champ-select/v1/session/trades/${tradeId}/decline`)
      console.log('[LCU] Declined trade:', tradeId)
    } catch (error) {
      console.error('[LCU] Failed to decline trade:', error)
      throw error
    }
  }
  /**
   * Update position preferences in lobby
   */
  async updatePositionPreferences(
    primaryPosition: string,
    secondaryPosition: string
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to LCU')
    }

    try {
      await this.request('PUT', '/lol-lobby/v2/lobby/members/localMember/position-preferences', {
        firstPreference: primaryPosition,
        secondPreference: secondaryPosition
      })
      console.log('[LCU] Updated position preferences:', { primaryPosition, secondaryPosition })
    } catch (error) {
      console.error('[LCU] Failed to update position preferences:', error)
      throw error
    }
  }
}

export const lcuConnector = new LCUConnector()
