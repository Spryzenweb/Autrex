import { Theme, ThemeMode, ThemeConfig } from './types'

// Enhanced theme configuration with modern UI features
export interface EnhancedThemeConfig extends ThemeConfig {
  // Visual effects
  effects: {
    glassmorphism: {
      enabled: boolean
      blurRadius: number // 4-24px
      opacity: number // 0.1-0.4
    }
    neumorphism: {
      enabled: boolean
      shadowIntensity: number // 0-100
    }
    glow: {
      enabled: boolean
      intensity: number // 0-100
    }
  }

  // Gradient configuration
  gradient: {
    enabled: boolean
    type: 'linear' | 'radial'
    angle?: number // 0-360 for linear
    position?: string // for radial
    stops: Array<{
      color: string
      position: number // 0-100
    }>
    animated: boolean
    animationSpeed: 'slow' | 'medium' | 'fast' // 10s, 5s, 2s
  }

  // Layout preferences
  layout: {
    sidebarPosition: 'left' | 'right'
    componentSize: 'compact' | 'normal' | 'comfortable'
    spacingScale: number // 0.75-1.5
  }

  // Typography
  typography: {
    fontFamily: string
    fontWeight: number // 300-700
    lineHeight: number // 1.2-2.0
    letterSpacing: number // -0.05-0.2em
  }

  // Border styling
  borders: {
    width: number // 0-4px
    radius: number // 0-24px
    style: 'solid' | 'dashed' | 'dotted'
  }

  // Accent colors
  accents: {
    primary: string
    secondary: string
    tertiary: string
  }

  // Background customization
  background: {
    type: 'solid' | 'gradient' | 'image'
    value: string // color, gradient definition, or image URL
    opacity: number // 0.5-1.0
    blur: number // 0-20px
    position?: 'center' | 'cover' | 'contain'
  }

  // Accessibility
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
  }

  // Metadata
  metadata: {
    name: string
    author?: string
    createdAt: string
    version: string
  }
}

// Enhanced theme context type
export interface EnhancedThemeContextType {
  theme: Theme
  themeConfig: EnhancedThemeConfig
  availableThemes: Theme[]
  customThemes: EnhancedThemeConfig[]

  // Theme management
  setTheme: (themeId: string) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void

  // Custom theme management
  createCustomTheme: (config: Partial<EnhancedThemeConfig>) => Promise<void>
  updateCustomTheme: (id: string, config: Partial<EnhancedThemeConfig>) => Promise<void>
  deleteCustomTheme: (id: string) => Promise<void>

  // Effect toggles
  toggleGlassmorphism: (enabled: boolean) => void
  toggleNeumorphism: (enabled: boolean) => void
  updateEffectConfig: (effect: string, config: any) => void

  // Gradient management
  updateGradient: (gradient: Partial<EnhancedThemeConfig['gradient']>) => void

  // Layout management
  updateLayout: (layout: Partial<EnhancedThemeConfig['layout']>) => void

  // Import/Export
  exportTheme: () => Promise<string>
  importTheme: (json: string) => Promise<void>

  // Preview
  previewTheme: (config: EnhancedThemeConfig) => void
  applyPreview: () => void
  cancelPreview: () => void
}

// Validation rules for theme configuration
export const themeValidationRules = {
  effects: {
    glassmorphism: {
      blurRadius: { min: 4, max: 24 },
      opacity: { min: 0.1, max: 0.4 }
    },
    neumorphism: {
      shadowIntensity: { min: 0, max: 100 }
    },
    glow: {
      intensity: { min: 0, max: 100 }
    }
  },
  gradient: {
    stops: { min: 2, max: 5 },
    angle: { min: 0, max: 360 }
  },
  layout: {
    spacingScale: { min: 0.75, max: 1.5, step: 0.25 }
  },
  typography: {
    fontWeight: { min: 300, max: 700 },
    lineHeight: { min: 1.2, max: 2.0 },
    letterSpacing: { min: -0.05, max: 0.2 }
  },
  borders: {
    width: { min: 0, max: 4 },
    radius: { min: 0, max: 24 }
  },
  background: {
    opacity: { min: 0.5, max: 1.0 },
    blur: { min: 0, max: 20 },
    imageMaxSize: 5 * 1024 * 1024 // 5MB
  },
  metadata: {
    name: { minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9\s-_]+$/ }
  },
  customThemes: {
    maxCount: 10
  }
} as const

// Default enhanced theme configuration
export const defaultEnhancedConfig: Omit<EnhancedThemeConfig, 'themeId' | 'mode'> = {
  effects: {
    glassmorphism: {
      enabled: false,
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
    fontFamily: 'system-ui, -apple-system, sans-serif',
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
    name: 'Default',
    createdAt: new Date().toISOString(),
    version: '1.0.0'
  }
}
