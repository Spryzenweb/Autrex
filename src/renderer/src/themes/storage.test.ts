import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeStorageService } from './storage'
import { EnhancedThemeConfig } from './enhanced-types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock window.api
const mockApi = {
  invoke: vi.fn()
}

Object.defineProperty(global, 'window', {
  value: {
    api: mockApi
  },
  writable: true
})

describe('ThemeStorageService', () => {
  let service: ThemeStorageService

  const mockThemeConfig: EnhancedThemeConfig = {
    themeId: 'test-theme',
    mode: 'dark',
    effects: {
      glassmorphism: {
        enabled: true,
        blurRadius: 12,
        opacity: 0.2
      },
      neumorphism: {
        enabled: false,
        shadowIntensity: 50
      },
      glow: {
        enabled: false,
        intensity: 50
      }
    },
    gradient: {
      enabled: false,
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ],
      animated: false,
      animationSpeed: 'medium'
    },
    layout: {
      sidebarPosition: 'left',
      componentSize: 'normal',
      spacingScale: 1.0
    },
    typography: {
      fontFamily: 'system-ui',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0
    },
    borders: {
      width: 1,
      radius: 8,
      style: 'solid'
    },
    accents: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      tertiary: '#06b6d4'
    },
    background: {
      type: 'solid',
      value: '#ffffff',
      opacity: 1.0,
      blur: 0
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false
    },
    metadata: {
      name: 'Test Theme',
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  beforeEach(() => {
    service = new ThemeStorageService()
    localStorageMock.clear()
    mockApi.invoke.mockClear()
  })

  afterEach(() => {
    service.clearPendingSave()
  })

  describe('loadThemeConfig', () => {
    it('should return null when no config exists', async () => {
      const result = await service.loadThemeConfig()
      expect(result).toBeNull()
    })

    it('should load valid theme config from localStorage', async () => {
      localStorage.setItem('autrex_theme_config', JSON.stringify(mockThemeConfig))
      
      const result = await service.loadThemeConfig()
      expect(result).toEqual(mockThemeConfig)
    })

    it('should return null for corrupted data', async () => {
      localStorage.setItem('autrex_theme_config', 'invalid json')
      
      const result = await service.loadThemeConfig()
      expect(result).toBeNull()
    })

    it('should return null for incomplete config (missing required properties)', async () => {
      const incompleteConfig = { metadata: { name: 'Test' } }
      localStorage.setItem('autrex_theme_config', JSON.stringify(incompleteConfig))
      
      const result = await service.loadThemeConfig()
      expect(result).toBeNull()
    })

    it('should return null for config with invalid values', async () => {
      const invalidConfig = {
        ...mockThemeConfig,
        effects: {
          ...mockThemeConfig.effects,
          glassmorphism: { ...mockThemeConfig.effects.glassmorphism, blurRadius: 100 }
        }
      }
      localStorage.setItem('autrex_theme_config', JSON.stringify(invalidConfig))
      
      const result = await service.loadThemeConfig()
      expect(result).toBeNull()
    })
  })

  describe('saveThemeConfig', () => {
    it('should save theme config to localStorage', async () => {
      await service.saveThemeConfig(mockThemeConfig)
      
      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600))
      
      const stored = localStorage.getItem('autrex_theme_config')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toEqual(mockThemeConfig)
    })

    it('should reject invalid theme config', async () => {
      const invalidConfig = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'ab' }
      }
      
      await expect(service.saveThemeConfig(invalidConfig as any)).rejects.toThrow(
        'Cannot save invalid theme configuration'
      )
    })

    it('should debounce multiple rapid saves', async () => {
      const config1 = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'Config 1' }
      }
      const config2 = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'Config 2' }
      }
      const config3 = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'Config 3' }
      }
      
      // Trigger multiple saves rapidly
      await service.saveThemeConfig(config1)
      await service.saveThemeConfig(config2)
      await service.saveThemeConfig(config3)
      
      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600))
      
      // Only the last config should be saved
      const stored = localStorage.getItem('autrex_theme_config')
      expect(JSON.parse(stored!).metadata.name).toBe('Config 3')
    })

    it('should call IPC handler to sync with main process', async () => {
      mockApi.invoke.mockResolvedValue({ success: true })
      
      await service.saveThemeConfig(mockThemeConfig)
      
      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600))
      
      expect(mockApi.invoke).toHaveBeenCalledWith('theme:save', mockThemeConfig)
    })

    it('should retry IPC call on failure with exponential backoff', async () => {
      // Mock IPC to fail twice then succeed
      mockApi.invoke
        .mockRejectedValueOnce(new Error('IPC failed'))
        .mockRejectedValueOnce(new Error('IPC failed'))
        .mockResolvedValueOnce({ success: true })
      
      await service.saveThemeConfig(mockThemeConfig)
      
      // Wait for debounce and retries
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Should have been called 3 times (initial + 2 retries)
      expect(mockApi.invoke).toHaveBeenCalledTimes(3)
    })

    it('should continue with localStorage only if all IPC retries fail', async () => {
      // Mock IPC to always fail
      mockApi.invoke.mockRejectedValue(new Error('IPC failed'))
      
      await service.saveThemeConfig(mockThemeConfig)
      
      // Wait for debounce and all retries
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Config should still be in localStorage
      const stored = localStorage.getItem('autrex_theme_config')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toEqual(mockThemeConfig)
    })
  })

  describe('loadCustomThemes', () => {
    it('should return empty array when no custom themes exist', async () => {
      const result = await service.loadCustomThemes()
      expect(result).toEqual([])
    })

    it('should load custom themes from localStorage', async () => {
      const themes = [mockThemeConfig]
      localStorage.setItem('autrex_custom_themes', JSON.stringify(themes))
      
      const result = await service.loadCustomThemes()
      expect(result).toEqual(themes)
    })

    it('should return empty array for corrupted data', async () => {
      localStorage.setItem('autrex_custom_themes', 'invalid json')
      
      const result = await service.loadCustomThemes()
      expect(result).toEqual([])
    })

    it('should return empty array if data is not an array', async () => {
      localStorage.setItem('autrex_custom_themes', JSON.stringify({ notAnArray: true }))
      
      const result = await service.loadCustomThemes()
      expect(result).toEqual([])
    })
  })

  describe('saveCustomTheme', () => {
    it('should add new custom theme to list', async () => {
      await service.saveCustomTheme(mockThemeConfig)
      
      const stored = localStorage.getItem('autrex_custom_themes')
      const themes = JSON.parse(stored!)
      expect(themes).toHaveLength(1)
      expect(themes[0]).toEqual(mockThemeConfig)
    })

    it('should reject theme with invalid name', async () => {
      const invalidTheme = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'ab' }
      }
      
      await expect(service.saveCustomTheme(invalidTheme as any)).rejects.toThrow('Invalid theme name')
    })

    it('should update existing theme with same name', async () => {
      const theme1 = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'Test Theme' }
      }
      const theme2 = {
        ...mockThemeConfig,
        metadata: { ...mockThemeConfig.metadata, name: 'Test Theme', version: '2.0.0' }
      }
      
      await service.saveCustomTheme(theme1)
      await service.saveCustomTheme(theme2)
      
      const stored = localStorage.getItem('autrex_custom_themes')
      const themes = JSON.parse(stored!)
      expect(themes).toHaveLength(1)
      expect(themes[0].metadata.version).toBe('2.0.0')
    })
  })

  describe('deleteCustomTheme', () => {
    it('should remove theme by name', async () => {
      const theme1 = { ...mockThemeConfig, metadata: { ...mockThemeConfig.metadata, name: 'Theme 1' } }
      const theme2 = { ...mockThemeConfig, metadata: { ...mockThemeConfig.metadata, name: 'Theme 2' } }
      
      await service.saveCustomTheme(theme1)
      await service.saveCustomTheme(theme2)
      await service.deleteCustomTheme('Theme 1')
      
      const themes = await service.loadCustomThemes()
      expect(themes).toHaveLength(1)
      expect(themes[0].metadata.name).toBe('Theme 2')
    })
  })

  describe('exportTheme', () => {
    it('should export theme as formatted JSON string', () => {
      const json = service.exportTheme(mockThemeConfig)
      
      expect(json).toBeTruthy()
      expect(JSON.parse(json)).toEqual(mockThemeConfig)
      expect(json).toContain('\n') // Should be formatted with newlines
    })
  })

  describe('importTheme', () => {
    it('should import valid theme JSON', () => {
      const json = JSON.stringify(mockThemeConfig)
      const result = service.importTheme(json)
      
      expect(result).toEqual(mockThemeConfig)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => service.importTheme('invalid json')).toThrow('Invalid JSON format')
    })

    it('should throw error for missing required properties', () => {
      const invalidConfig = { metadata: { name: 'Test' } }
      const json = JSON.stringify(invalidConfig)
      
      expect(() => service.importTheme(json)).toThrow('Invalid theme configuration')
    })

    it('should throw error for missing theme name', () => {
      const invalidConfig = { ...mockThemeConfig, metadata: {} }
      const json = JSON.stringify(invalidConfig)
      
      expect(() => service.importTheme(json)).toThrow('Invalid theme configuration')
    })

    it('should throw error for invalid theme values', () => {
      const invalidConfig = {
        ...mockThemeConfig,
        effects: {
          ...mockThemeConfig.effects,
          glassmorphism: { ...mockThemeConfig.effects.glassmorphism, blurRadius: 100 }
        }
      }
      const json = JSON.stringify(invalidConfig)
      
      expect(() => service.importTheme(json)).toThrow('Invalid theme configuration')
    })
  })

  describe('clearPendingSave', () => {
    it('should clear pending save timer', async () => {
      await service.saveThemeConfig(mockThemeConfig)
      service.clearPendingSave()
      
      // Wait past debounce time
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Config should not be saved
      const stored = localStorage.getItem('autrex_theme_config')
      expect(stored).toBeNull()
    })
  })
})
