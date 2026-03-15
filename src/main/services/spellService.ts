import { lcuConnector } from './lcuConnector'

export interface SummonerSpell {
  id: number
  name: string
  description: string
  iconPath: string
  gameModes: string[]
}

export class SpellService {
  private static instance: SpellService

  private constructor() {}

  static getInstance(): SpellService {
    if (!SpellService.instance) {
      SpellService.instance = new SpellService()
    }
    return SpellService.instance
  }

  /**
   * Get all available summoner spells
   */
  async getAvailableSpells(): Promise<SummonerSpell[]> {
    try {
      const response = await lcuConnector.request(
        'GET',
        '/lol-game-data/assets/v1/summoner-spells.json'
      )

      if (!response || !Array.isArray(response)) {
        console.error('[SpellService] Invalid response from LCU')
        return []
      }

      // Filter out spells that are not available in normal games
      const availableSpells = response.filter((spell: any) => {
        // Exclude spells like Poro Toss, Mark/Dash, etc.
        const excludedIds = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 54, 55]
        return !excludedIds.includes(spell.id)
      })

      return availableSpells.map((spell: any) => ({
        id: spell.id,
        name: spell.name,
        description: spell.description,
        iconPath: spell.iconPath,
        gameModes: spell.gameModes || []
      }))
    } catch (error) {
      console.error('[SpellService] Failed to get available spells:', error)
      return []
    }
  }

  /**
   * Get current summoner spells
   */
  async getCurrentSpells(): Promise<{ spell1Id: number; spell2Id: number } | null> {
    try {
      const response = await lcuConnector.request('GET', '/lol-champ-select/v1/session')

      if (!response) {
        return null
      }

      const localPlayerCellId = response.localPlayerCellId
      const myTeam = response.myTeam || []
      const localPlayer = myTeam.find((member: any) => member.cellId === localPlayerCellId)

      if (!localPlayer) {
        return null
      }

      return {
        spell1Id: localPlayer.spell1Id || 0,
        spell2Id: localPlayer.spell2Id || 0
      }
    } catch (error) {
      console.error('[SpellService] Failed to get current spells:', error)
      return null
    }
  }

  /**
   * Set summoner spells
   */
  async setSpells(spell1Id: number, spell2Id: number): Promise<boolean> {
    try {
      console.log('[SpellService] Setting spells:', { spell1Id, spell2Id })

      // Patch spell 1
      await lcuConnector.request('PATCH', '/lol-champ-select/v1/session/my-selection', {
        spell1Id
      })

      // Patch spell 2
      await lcuConnector.request('PATCH', '/lol-champ-select/v1/session/my-selection', {
        spell2Id
      })

      console.log('[SpellService] Spells set successfully')
      return true
    } catch (error) {
      console.error('[SpellService] Failed to set spells:', error)
      return false
    }
  }
}

export const spellService = SpellService.getInstance()
