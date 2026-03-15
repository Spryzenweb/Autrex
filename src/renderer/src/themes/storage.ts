import { EnhancedThemeConfig } from './enhanced-types'
import { validateThemeConfig, isValidThemeName } from './validation'

const THEME_CONFIG_KEY = 'autrex_theme_config'
const CUSTOM_THEMES_KEY = 'autrex_custom_themes'

// Debounce configuration
const SAVE_DEBOUNCE_MS = 500
const IPC_RETRY_ATTEMPTS = 3
const IPC_RETRY_BASE_DELAY = 100 // ms, will be exponentially increased

/**
 * Theme Storage Service
 * Handles theme persistence to LocalStorage and synchronization with main process via IPC
 */
export class ThemeStorageService {
  private saveTimer: NodeJS.Timeout | null = null
  private pendingSave: EnhancedThemeConfig | null = null

  /**
   * Load theme configuration from LocalStorage
   * Returns null if no configuration exists or if data is corrupted
   * Validates the configuration and falls back to null on validation failure
   */
  async loadThemeConfig(): Promise<EnhancedThemeConfig | null> {
    try {
      const stored = localStorage.getItem(THEME_CONFIG_KEY)
      if (!stored) {
        return null
      }

      const config = JSON.parse(stored) as EnhancedThemeConfig
      
      // Validate the configuration
      const validationResult = validateThemeConfig(config)
      if (!validationResult.valid) {
        console.warn('[ThemeStorage] Corrupted theme config detected:', validationResult.errors)
        console.warn('[ThemeStorage] Falling back to null, default theme will be used')
        return null
      }

      return config
    } catch (error) {
      console.error('[ThemeStorage] Failed to load theme config:', error)
      return null
    }
  }

  /**
   * Save theme configuration with debouncing and IPC synchronization
   * Debounces saves to prevent excessive writes during rapid customization
   * Retries IPC calls with exponential backoff on failure
   * Validates configuration before saving
   */
  async saveThemeConfig(config: EnhancedThemeConfig): Promise<void> {
    // Validate configuration before saving
    const validationResult = validateThemeConfig(config)
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors.map(e => `${e.field}: ${e.message}`).join(', ')
      throw new Error(`Cannot save invalid theme configuration: ${errorMessages}`)
    }

    // Store the pending config
    this.pendingSave = config

    // Clear existing timer
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }

    // Set up debounced save
    this.saveTimer = setTimeout(async () => {
      if (!this.pendingSave) return

      const configToSave = this.pendingSave
      this.pendingSave = null
      this.saveTimer = null

      try {
        // Save to LocalStorage immediately
        localStorage.setItem(THEME_CONFIG_KEY, JSON.stringify(configToSave))

        // Sync to main process with retry logic
        await this.syncToMainProcess(configToSave)
      } catch (error) {
        console.error('[ThemeStorage] Failed to save theme config:', error)
        throw error
      }
    }, SAVE_DEBOUNCE_MS)
  }

  /**
   * Sync theme configuration to main process via IPC with retry logic
   * Implements exponential backoff for failed attempts
   */
  private async syncToMainProcess(config: EnhancedThemeConfig): Promise<void> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < IPC_RETRY_ATTEMPTS; attempt++) {
      try {
        // Check if window.api exists (Electron environment)
        if (typeof window !== 'undefined' && (window as any).api) {
          await (window as any).api.invoke('theme:save', config)
          console.log('[ThemeStorage] Successfully synced to main process')
          return
        } else {
          console.warn('[ThemeStorage] IPC not available, skipping main process sync')
          return
        }
      } catch (error) {
        lastError = error as Error
        console.warn(`[ThemeStorage] IPC sync attempt ${attempt + 1} failed:`, error)

        // Wait before retrying with exponential backoff
        if (attempt < IPC_RETRY_ATTEMPTS - 1) {
          const delay = IPC_RETRY_BASE_DELAY * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    console.error('[ThemeStorage] All IPC sync attempts failed, continuing with localStorage only')
    if (lastError) {
      console.error('[ThemeStorage] Last error:', lastError)
    }
  }

  /**
   * Load custom themes from LocalStorage
   * Returns empty array if no themes exist or if data is corrupted
   */
  async loadCustomThemes(): Promise<EnhancedThemeConfig[]> {
    try {
      const stored = localStorage.getItem(CUSTOM_THEMES_KEY)
      if (!stored) {
        return []
      }

      const themes = JSON.parse(stored) as EnhancedThemeConfig[]
      
      // Validate that it's an array
      if (!Array.isArray(themes)) {
        console.warn('[ThemeStorage] Custom themes data is not an array, returning empty array')
        return []
      }

      return themes
    } catch (error) {
      console.error('[ThemeStorage] Failed to load custom themes:', error)
      return []
    }
  }

  /**
   * Save a custom theme to LocalStorage
   * Adds the theme to the custom themes list
   * Validates theme name and configuration before saving
   */
  async saveCustomTheme(config: EnhancedThemeConfig): Promise<void> {
    try {
      // Validate theme name
      if (!isValidThemeName(config.metadata.name)) {
        throw new Error(
          'Invalid theme name: must be 3-30 characters and contain only alphanumeric characters, spaces, hyphens, and underscores'
        )
      }

      // Validate full configuration
      const validationResult = validateThemeConfig(config)
      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        throw new Error(`Cannot save invalid theme configuration: ${errorMessages}`)
      }

      const themes = await this.loadCustomThemes()
      
      // Check if theme with same name exists
      const existingIndex = themes.findIndex((t) => t.metadata.name === config.metadata.name)
      
      if (existingIndex >= 0) {
        // Update existing theme
        themes[existingIndex] = config
      } else {
        // Add new theme
        themes.push(config)
      }

      // Save to LocalStorage
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes))

      // Sync to main process (no retry needed for custom themes)
      if (typeof window !== 'undefined' && (window as any).api) {
        try {
          await (window as any).api.invoke('theme:save-custom', themes)
        } catch (error) {
          console.warn('[ThemeStorage] Failed to sync custom themes to main process:', error)
        }
      }
    } catch (error) {
      console.error('[ThemeStorage] Failed to save custom theme:', error)
      throw error
    }
  }

  /**
   * Delete a custom theme by name
   */
  async deleteCustomTheme(name: string): Promise<void> {
    try {
      const themes = await this.loadCustomThemes()
      const filtered = themes.filter(t => t.metadata.name !== name)

      // Save updated list
      localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(filtered))

      // Sync to main process
      if (typeof window !== 'undefined' && (window as any).api) {
        try {
          await (window as any).api.invoke('theme:save-custom', filtered)
        } catch (error) {
          console.warn('[ThemeStorage] Failed to sync custom themes deletion to main process:', error)
        }
      }
    } catch (error) {
      console.error('[ThemeStorage] Failed to delete custom theme:', error)
      throw error
    }
  }

  /**
   * Export theme configuration as JSON string
   */
  exportTheme(config: EnhancedThemeConfig): string {
    return JSON.stringify(config, null, 2)
  }

  /**
   * Import theme configuration from JSON string
   * Validates the structure before returning
   */
  importTheme(json: string): EnhancedThemeConfig {
    try {
      const config = JSON.parse(json) as EnhancedThemeConfig

      // Validate the configuration
      const validationResult = validateThemeConfig(config)
      if (!validationResult.valid) {
        const errorMessages = validationResult.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        throw new Error(`Invalid theme configuration: ${errorMessages}`)
      }

      return config
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format')
      }
      throw error
    }
  }

  /**
   * Clear the debounce timer (useful for cleanup)
   */
  clearPendingSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
    }
    this.pendingSave = null
  }
}

// Export singleton instance
export const themeStorageService = new ThemeStorageService()
