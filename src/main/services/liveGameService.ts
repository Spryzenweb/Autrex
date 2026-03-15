import https from 'https'
import axios, { AxiosInstance } from 'axios'

// Live Client Data API Types
export interface AllGameData {
  activePlayer: ActivePlayer
  allPlayers: Player[]
  events: { Events: GameEvent[] }
  gameData: GameData
}

export interface ActivePlayer {
  summonerName: string
  level: number
  currentGold: number
  championStats: ChampionStats
  abilities: Record<string, unknown>
  fullRunes: Record<string, unknown>
}

export interface ChampionStats {
  abilityPower: number
  abilityHaste: number
  attackDamage: number
  attackSpeed: number
  armor: number
  magicResist: number
  maxHealth: number
  currentHealth: number
  moveSpeed: number
  attackRange: number
  critChance: number
  critDamage: number
  lifeSteal: number
  spellVamp: number
  tenacity: number
  armorPenetrationFlat: number
  armorPenetrationPercent: number
  magicPenetrationFlat: number
  magicPenetrationPercent: number
  resourceType: string
  resourceValue: number
  resourceMax: number
  resourceRegenRate: number
  healthRegenRate: number
  omnivamp: number
  physicalLethality: number
  magicLethality: number
  physicalVamp: number
  healShieldPower: number
}

export interface Player {
  summonerName: string
  championName: string
  rawChampionName: string
  level: number
  team: 'ORDER' | 'CHAOS'
  position: string
  isDead: boolean
  isBot: boolean
  respawnTimer: number
  skinID: number
  items: Item[]
  scores: Scores
  runes: Record<string, unknown>
  summonerSpells: Record<string, unknown>
}

export interface Item {
  canUse: boolean
  consumable: boolean
  count: number
  displayName: string
  itemID: number
  price: number
  rawDescription: string
  rawDisplayName: string
  slot: number
}

export interface Scores {
  kills: number
  deaths: number
  assists: number
  creepScore: number
  wardScore: number
}

export interface GameData {
  gameMode: string
  gameTime: number
  mapName: string
  mapNumber: number
  mapTerrain: string
}

export interface GameEvent {
  EventID: number
  EventName: string
  EventTime: number
  [key: string]: unknown
}

export type ConnectionState = 'disconnected' | 'searching' | 'connected'

class LiveGameService {
  private client: AxiosInstance
  private pollingInterval: NodeJS.Timeout | null = null
  private connectionState: ConnectionState = 'disconnected'
  private lastGameData: AllGameData | null = null
  private listeners: Set<(data: AllGameData) => void> = new Set()
  private stateListeners: Set<(state: ConnectionState) => void> = new Set()

  constructor() {
    // Create axios client with SSL bypass for local API
    this.client = axios.create({
      baseURL: 'https://127.0.0.1:2999',
      timeout: 2000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    })
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state
      console.log(`[LiveGameService] Connection state: ${state}`)
      this.stateListeners.forEach((listener) => listener(state))
    }
  }

  private async fetchGameData(): Promise<AllGameData | null> {
    try {
      const response = await this.client.get<AllGameData>('/liveclientdata/allgamedata')
      return response.data
    } catch (error) {
      return null
    }
  }

  private async poll(): Promise<void> {
    const data = await this.fetchGameData()

    if (data) {
      this.setConnectionState('connected')
      this.lastGameData = data
      this.listeners.forEach((listener) => listener(data))
    } else {
      if (this.connectionState === 'connected') {
        // Game ended - set to disconnected
        this.setConnectionState('disconnected')
        // After disconnecting, go back to searching for next game
        setTimeout(() => {
          if (this.connectionState === 'disconnected') {
            this.setConnectionState('searching')
          }
        }, 3000) // Wait 3 seconds before searching again
      }
      this.lastGameData = null
    }
  }

  public startPolling(intervalMs: number = 1000): void {
    if (this.pollingInterval) {
      return
    }

    console.log('[LiveGameService] Starting polling...')
    this.setConnectionState('searching')

    // Initial poll
    this.poll()

    // Start interval
    this.pollingInterval = setInterval(() => {
      this.poll()
    }, intervalMs)
  }

  public stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.setConnectionState('disconnected')
      this.lastGameData = null
      console.log('[LiveGameService] Polling stopped')
    }
  }

  public onGameData(listener: (data: AllGameData) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  public onConnectionState(listener: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(listener)
    // Send current state immediately
    listener(this.connectionState)
    return () => this.stateListeners.delete(listener)
  }

  public getLastGameData(): AllGameData | null {
    return this.lastGameData
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState
  }
}

export const liveGameService = new LiveGameService()
