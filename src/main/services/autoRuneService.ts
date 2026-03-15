import { EventEmitter } from 'events'
import { lcuConnector } from './lcuConnector'
import { runeService } from './runeService'
import { settingsService } from './settingsService'

class AutoRuneService extends EventEmitter {
  private static instance: AutoRuneService
  private isActive: boolean = false
  private checkInterval: NodeJS.Timeout | null = null
  private lastPhase: string = 'None'
  private targetPageId: number | null = null

  private constructor() {
    super()
  }

  static getInstance(): AutoRuneService {
    if (!AutoRuneService.instance) {
      AutoRuneService.instance = new AutoRuneService()
    }
    return AutoRuneService.instance
  }

  /**
   * Start auto rune service
   */
  start(): void {
    if (this.isActive) return

    this.isActive = true
    settingsService.set('autoRuneEnabled', true)
    console.log('[AutoRune] Service started')

    // Load target page from settings
    this.targetPageId = settingsService.get('autoRunePageId')
    console.log('[AutoRune] Loaded target page from settings:', this.targetPageId)

    // Start checking
    this.startChecking()
  }

  /**
   * Stop auto rune service
   */
  stop(): void {
    if (!this.isActive) return

    this.isActive = false
    settingsService.set('autoRuneEnabled', false)
    console.log('[AutoRune] Service stopped')

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Set target rune page
   */
  setTargetPage(pageId: number | null): void {
    this.targetPageId = pageId
    settingsService.set('autoRunePageId', pageId)
    console.log('[AutoRune] Target page set to:', pageId)

    // If service is already running, reload the target page
    if (this.isActive && pageId) {
      console.log('[AutoRune] Service is active, target page updated')
    }
  }

  /**
   * Get target rune page
   */
  getTargetPage(): number | null {
    return this.targetPageId
  }

  /**
   * Start checking for champ select
   */
  private startChecking(): void {
    // Check every 2 seconds
    this.checkInterval = setInterval(async () => {
      if (!this.isActive || !this.targetPageId) {
        if (!this.targetPageId) {
          console.log('[AutoRune] No target page set, skipping check')
        }
        return
      }

      try {
        const phase = await lcuConnector.getGameflowPhase()

        // Detect phase change to ChampSelect
        if (phase === 'ChampSelect' && this.lastPhase !== 'ChampSelect') {
          console.log(
            '[AutoRune] Entered champ select, applying target rune page:',
            this.targetPageId
          )
          await this.applyTargetPage()
        }

        this.lastPhase = phase
      } catch (error) {
        // Ignore errors, LCU might not be connected
        console.log('[AutoRune] Error checking phase:', error)
      }
    }, 2000)
  }

  /**
   * Apply target rune page
   */
  private async applyTargetPage(): Promise<void> {
    if (!this.targetPageId) {
      console.log('[AutoRune] No target page ID set')
      return
    }

    try {
      console.log('[AutoRune] ===== Starting rune page application =====')
      console.log('[AutoRune] Target page ID:', this.targetPageId)

      // Wait a bit for champ select to fully load
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get current page
      const currentPage = await runeService.getCurrentRunePage()
      console.log('[AutoRune] Current page before change:', currentPage?.id, currentPage?.name)

      // If already on target page, skip
      if (currentPage && currentPage.id === this.targetPageId) {
        console.log('[AutoRune] Already on target page, skipping')
        return
      }

      console.log('[AutoRune] Calling setCurrentRunePage with ID:', this.targetPageId)

      // Set target page as current
      const success = await runeService.setCurrentRunePage(this.targetPageId)

      console.log('[AutoRune] setCurrentRunePage returned:', success)

      if (success) {
        console.log('[AutoRune] ✓ Successfully applied target rune page:', this.targetPageId)

        // Re-apply multiple times to ensure it sticks
        // LCU sometimes reverts the rune page, so we need to be persistent
        const reapplyAttempts = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000] // Re-apply every second for 8 seconds

        for (const delay of reapplyAttempts) {
          setTimeout(async () => {
            try {
              const currentCheck = await runeService.getCurrentRunePage()
              console.log(
                '[AutoRune] Re-check at',
                delay,
                'ms - Current page:',
                currentCheck?.id,
                currentCheck?.name
              )

              if (currentCheck && currentCheck.id !== this.targetPageId) {
                console.log('[AutoRune] ⚠ Rune page changed back! Re-applying target page')
                if (this.targetPageId) {
                  const reapplySuccess = await runeService.setCurrentRunePage(this.targetPageId)
                  console.log('[AutoRune] Re-apply result:', reapplySuccess)
                }
              } else {
                console.log('[AutoRune] ✓ Rune page still correct at', delay, 'ms')
              }
            } catch (error) {
              console.error('[AutoRune] Error during re-apply check:', error)
            }
          }, delay)
        }

        this.emit('rune-page-applied', this.targetPageId)
      } else {
        console.error('[AutoRune] ✗ Failed to apply target rune page')
      }

      console.log('[AutoRune] ===== Finished rune page application =====')
    } catch (error) {
      console.error('[AutoRune] ✗ Error applying target rune page:', error)
    }
  }

  /**
   * Check if service is active
   */
  isRunning(): boolean {
    return this.isActive
  }
}

export const autoRuneService = AutoRuneService.getInstance()
