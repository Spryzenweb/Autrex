import { EventEmitter } from 'events'
import { lcuConnector } from './lcuConnector'
import { spellService } from './spellService'
import { settingsService } from './settingsService'

class AutoSpellService extends EventEmitter {
  private static instance: AutoSpellService
  private isActive: boolean = false
  private checkInterval: NodeJS.Timeout | null = null
  private lastPhase: string = 'None'
  private targetSpell1Id: number | null = null
  private targetSpell2Id: number | null = null

  private constructor() {
    super()
  }

  static getInstance(): AutoSpellService {
    if (!AutoSpellService.instance) {
      AutoSpellService.instance = new AutoSpellService()
    }
    return AutoSpellService.instance
  }

  /**
   * Start auto spell service
   */
  start(): void {
    if (this.isActive) return

    this.isActive = true
    console.log('[AutoSpell] Service started')

    // Load target spells from settings
    this.targetSpell1Id = settingsService.get('autoSpell1Id')
    this.targetSpell2Id = settingsService.get('autoSpell2Id')

    // Start checking
    this.startChecking()
  }

  /**
   * Stop auto spell service
   */
  stop(): void {
    if (!this.isActive) return

    this.isActive = false
    console.log('[AutoSpell] Service stopped')

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Set target spells
   */
  setTargetSpells(spell1Id: number, spell2Id: number): void {
    this.targetSpell1Id = spell1Id
    this.targetSpell2Id = spell2Id
    settingsService.set('autoSpell1Id', spell1Id)
    settingsService.set('autoSpell2Id', spell2Id)
    console.log('[AutoSpell] Target spells set to:', spell1Id, spell2Id)
  }

  /**
   * Get target spells
   */
  getTargetSpells(): { spell1Id: number | null; spell2Id: number | null } {
    return {
      spell1Id: this.targetSpell1Id,
      spell2Id: this.targetSpell2Id
    }
  }

  /**
   * Start checking for champ select
   */
  private startChecking(): void {
    // Check every 2 seconds
    this.checkInterval = setInterval(async () => {
      if (!this.isActive || !this.targetSpell1Id || !this.targetSpell2Id) return

      try {
        const phase = await lcuConnector.getGameflowPhase()

        // Detect phase change to ChampSelect
        if (phase === 'ChampSelect' && this.lastPhase !== 'ChampSelect') {
          console.log('[AutoSpell] Entered champ select, applying target spells')
          await this.applyTargetSpells()
        }

        this.lastPhase = phase
      } catch {
        // Ignore errors, LCU might not be connected
      }
    }, 2000)
  }

  /**
   * Apply target spells
   */
  private async applyTargetSpells(): Promise<void> {
    if (!this.targetSpell1Id || !this.targetSpell2Id) return

    try {
      // Wait a bit for champ select to fully load
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get current spells
      const currentSpells = await spellService.getCurrentSpells()

      // If already on target spells, skip
      if (
        currentSpells &&
        currentSpells.spell1Id === this.targetSpell1Id &&
        currentSpells.spell2Id === this.targetSpell2Id
      ) {
        console.log('[AutoSpell] Already on target spells')
        return
      }

      console.log('[AutoSpell] Applying target spells:', this.targetSpell1Id, this.targetSpell2Id)

      // Set target spells
      const success = await spellService.setSpells(this.targetSpell1Id, this.targetSpell2Id)

      if (success) {
        console.log('[AutoSpell] Successfully applied target spells')

        // Re-apply multiple times to ensure it sticks
        const reapplyAttempts = [2000, 4000] // Re-apply at 2s and 4s

        for (const delay of reapplyAttempts) {
          setTimeout(async () => {
            try {
              const currentCheck = await spellService.getCurrentSpells()
              if (
                currentCheck &&
                (currentCheck.spell1Id !== this.targetSpell1Id ||
                  currentCheck.spell2Id !== this.targetSpell2Id)
              ) {
                console.log(
                  '[AutoSpell] Spells changed, re-applying target spells (attempt at',
                  delay,
                  'ms)'
                )
                if (this.targetSpell1Id && this.targetSpell2Id) {
                  await spellService.setSpells(this.targetSpell1Id, this.targetSpell2Id)
                }
              } else {
                console.log('[AutoSpell] Spells still correct at', delay, 'ms')
              }
            } catch (error) {
              console.error('[AutoSpell] Error during re-apply check:', error)
            }
          }, delay)
        }

        this.emit('spells-applied', {
          spell1Id: this.targetSpell1Id,
          spell2Id: this.targetSpell2Id
        })
      } else {
        console.error('[AutoSpell] Failed to apply target spells')
      }
    } catch (error) {
      console.error('[AutoSpell] Error applying target spells:', error)
    }
  }

  /**
   * Check if service is active
   */
  isRunning(): boolean {
    return this.isActive
  }
}

export const autoSpellService = AutoSpellService.getInstance()
