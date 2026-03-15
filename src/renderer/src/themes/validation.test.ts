import { describe, it, expect } from 'vitest'
import {
  isValidHexColor,
  isValidRgbColor,
  isValidHslColor,
  isValidColorFormat,
  isValidBlurRadius,
  isValidGlassmorphismOpacity,
  isValidShadowIntensity,
  isValidGlowIntensity,
  isValidGradientAngle,
  isValidSpacingScale,
  isValidFontWeight,
  isValidLineHeight,
  isValidLetterSpacing,
  isValidBorderWidth,
  isValidBorderRadius,
  isValidBackgroundOpacity,
  isValidBackgroundBlur,
  isValidThemeName,
  validateThemeConfig
} from './validation'
import { EnhancedThemeConfig } from './enhanced-types'

describe('Color Format Validation', () => {
  describe('isValidHexColor', () => {
    it('should accept valid 3-digit hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
      expect(isValidHexColor('#ABC')).toBe(true)
    })

    it('should accept valid 6-digit hex colors', () => {
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#abcdef')).toBe(true)
      expect(isValidHexColor('#ABCDEF')).toBe(true)
      expect(isValidHexColor('#3b82f6')).toBe(true)
    })

    it('should accept valid 8-digit hex colors with alpha', () => {
      expect(isValidHexColor('#ffffff00')).toBe(true)
      expect(isValidHexColor('#000000ff')).toBe(true)
      expect(isValidHexColor('#abcdef80')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('ffffff')).toBe(false) // missing #
      expect(isValidHexColor('#ff')).toBe(false) // too short
      expect(isValidHexColor('#fffff')).toBe(false) // wrong length
      expect(isValidHexColor('#gggggg')).toBe(false) // invalid characters
      expect(isValidHexColor('#')).toBe(false) // just #
      expect(isValidHexColor('')).toBe(false) // empty
    })
  })

  describe('isValidRgbColor', () => {
    it('should accept valid rgb colors', () => {
      expect(isValidRgbColor('rgb(0, 0, 0)')).toBe(true)
      expect(isValidRgbColor('rgb(255, 255, 255)')).toBe(true)
      expect(isValidRgbColor('rgb(128, 64, 32)')).toBe(true)
    })

    it('should accept valid rgba colors', () => {
      expect(isValidRgbColor('rgba(0, 0, 0, 0)')).toBe(true)
      expect(isValidRgbColor('rgba(255, 255, 255, 1)')).toBe(true)
      expect(isValidRgbColor('rgba(128, 64, 32, 0.5)')).toBe(true)
    })

    it('should accept rgb with flexible spacing', () => {
      expect(isValidRgbColor('rgb(0,0,0)')).toBe(true)
      expect(isValidRgbColor('rgb( 0 , 0 , 0 )')).toBe(true)
    })

    it('should reject rgb with out-of-range values', () => {
      expect(isValidRgbColor('rgb(256, 0, 0)')).toBe(false) // r > 255
      expect(isValidRgbColor('rgb(0, 256, 0)')).toBe(false) // g > 255
      expect(isValidRgbColor('rgb(0, 0, 256)')).toBe(false) // b > 255
      expect(isValidRgbColor('rgb(-1, 0, 0)')).toBe(false) // r < 0
      expect(isValidRgbColor('rgba(0, 0, 0, 1.1)')).toBe(false) // alpha > 1
      expect(isValidRgbColor('rgba(0, 0, 0, -0.1)')).toBe(false) // alpha < 0
    })

    it('should reject invalid rgb formats', () => {
      expect(isValidRgbColor('rgb(0, 0)')).toBe(false) // missing value
      expect(isValidRgbColor('rgb(0, 0, 0, 0)')).toBe(false) // rgb with 4 values
      expect(isValidRgbColor('rgb(a, b, c)')).toBe(false) // non-numeric
      expect(isValidRgbColor('rgb 0, 0, 0')).toBe(false) // missing parentheses
    })
  })

  describe('isValidHslColor', () => {
    it('should accept valid hsl colors', () => {
      expect(isValidHslColor('hsl(0, 0%, 0%)')).toBe(true)
      expect(isValidHslColor('hsl(360, 100%, 100%)')).toBe(true)
      expect(isValidHslColor('hsl(180, 50%, 50%)')).toBe(true)
    })

    it('should accept valid hsla colors', () => {
      expect(isValidHslColor('hsla(0, 0%, 0%, 0)')).toBe(true)
      expect(isValidHslColor('hsla(360, 100%, 100%, 1)')).toBe(true)
      expect(isValidHslColor('hsla(180, 50%, 50%, 0.5)')).toBe(true)
    })

    it('should reject hsl with out-of-range values', () => {
      expect(isValidHslColor('hsl(361, 0%, 0%)')).toBe(false) // h > 360
      expect(isValidHslColor('hsl(0, 101%, 0%)')).toBe(false) // s > 100
      expect(isValidHslColor('hsl(0, 0%, 101%)')).toBe(false) // l > 100
      expect(isValidHslColor('hsl(-1, 0%, 0%)')).toBe(false) // h < 0
      expect(isValidHslColor('hsla(0, 0%, 0%, 1.1)')).toBe(false) // alpha > 1
    })

    it('should reject invalid hsl formats', () => {
      expect(isValidHslColor('hsl(0, 0, 0)')).toBe(false) // missing %
      expect(isValidHslColor('hsl(0%, 0%, 0%)')).toBe(false) // h with %
      expect(isValidHslColor('hsl(0, 0%, 0%')).toBe(false) // missing closing paren
    })
  })

  describe('isValidColorFormat', () => {
    it('should accept any valid color format', () => {
      expect(isValidColorFormat('#fff')).toBe(true)
      expect(isValidColorFormat('#ffffff')).toBe(true)
      expect(isValidColorFormat('rgb(0, 0, 0)')).toBe(true)
      expect(isValidColorFormat('rgba(0, 0, 0, 0.5)')).toBe(true)
      expect(isValidColorFormat('hsl(0, 0%, 0%)')).toBe(true)
      expect(isValidColorFormat('hsla(0, 0%, 0%, 0.5)')).toBe(true)
    })

    it('should reject invalid color formats', () => {
      expect(isValidColorFormat('red')).toBe(false) // named color
      expect(isValidColorFormat('invalid')).toBe(false)
      expect(isValidColorFormat('')).toBe(false)
      expect(isValidColorFormat('   ')).toBe(false)
    })

    it('should handle non-string inputs', () => {
      expect(isValidColorFormat(123 as any)).toBe(false)
      expect(isValidColorFormat(null as any)).toBe(false)
      expect(isValidColorFormat(undefined as any)).toBe(false)
    })

    it('should trim whitespace', () => {
      expect(isValidColorFormat('  #fff  ')).toBe(true)
      expect(isValidColorFormat('  rgb(0, 0, 0)  ')).toBe(true)
    })
  })
})

describe('Numeric Range Validation', () => {
  describe('isValidBlurRadius', () => {
    it('should accept values in range 4-24', () => {
      expect(isValidBlurRadius(4)).toBe(true)
      expect(isValidBlurRadius(12)).toBe(true)
      expect(isValidBlurRadius(24)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidBlurRadius(3)).toBe(false)
      expect(isValidBlurRadius(25)).toBe(false)
      expect(isValidBlurRadius(0)).toBe(false)
      expect(isValidBlurRadius(100)).toBe(false)
    })

    it('should reject non-numeric values', () => {
      expect(isValidBlurRadius(NaN)).toBe(false)
      expect(isValidBlurRadius('12' as any)).toBe(false)
    })
  })

  describe('isValidGlassmorphismOpacity', () => {
    it('should accept values in range 0.1-0.4', () => {
      expect(isValidGlassmorphismOpacity(0.1)).toBe(true)
      expect(isValidGlassmorphismOpacity(0.2)).toBe(true)
      expect(isValidGlassmorphismOpacity(0.4)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidGlassmorphismOpacity(0.09)).toBe(false)
      expect(isValidGlassmorphismOpacity(0.41)).toBe(false)
      expect(isValidGlassmorphismOpacity(0)).toBe(false)
      expect(isValidGlassmorphismOpacity(1)).toBe(false)
    })
  })

  describe('isValidShadowIntensity', () => {
    it('should accept values in range 0-100', () => {
      expect(isValidShadowIntensity(0)).toBe(true)
      expect(isValidShadowIntensity(50)).toBe(true)
      expect(isValidShadowIntensity(100)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidShadowIntensity(-1)).toBe(false)
      expect(isValidShadowIntensity(101)).toBe(false)
    })
  })

  describe('isValidGradientAngle', () => {
    it('should accept values in range 0-360', () => {
      expect(isValidGradientAngle(0)).toBe(true)
      expect(isValidGradientAngle(180)).toBe(true)
      expect(isValidGradientAngle(360)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidGradientAngle(-1)).toBe(false)
      expect(isValidGradientAngle(361)).toBe(false)
    })
  })

  describe('isValidSpacingScale', () => {
    it('should accept values in range 0.75-1.5', () => {
      expect(isValidSpacingScale(0.75)).toBe(true)
      expect(isValidSpacingScale(1.0)).toBe(true)
      expect(isValidSpacingScale(1.5)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidSpacingScale(0.74)).toBe(false)
      expect(isValidSpacingScale(1.51)).toBe(false)
    })
  })

  describe('isValidFontWeight', () => {
    it('should accept values in range 300-700', () => {
      expect(isValidFontWeight(300)).toBe(true)
      expect(isValidFontWeight(400)).toBe(true)
      expect(isValidFontWeight(700)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidFontWeight(299)).toBe(false)
      expect(isValidFontWeight(701)).toBe(false)
    })
  })

  describe('isValidLineHeight', () => {
    it('should accept values in range 1.2-2.0', () => {
      expect(isValidLineHeight(1.2)).toBe(true)
      expect(isValidLineHeight(1.5)).toBe(true)
      expect(isValidLineHeight(2.0)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidLineHeight(1.1)).toBe(false)
      expect(isValidLineHeight(2.1)).toBe(false)
    })
  })

  describe('isValidLetterSpacing', () => {
    it('should accept values in range -0.05-0.2', () => {
      expect(isValidLetterSpacing(-0.05)).toBe(true)
      expect(isValidLetterSpacing(0)).toBe(true)
      expect(isValidLetterSpacing(0.2)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidLetterSpacing(-0.06)).toBe(false)
      expect(isValidLetterSpacing(0.21)).toBe(false)
    })
  })

  describe('isValidBorderWidth', () => {
    it('should accept values in range 0-4', () => {
      expect(isValidBorderWidth(0)).toBe(true)
      expect(isValidBorderWidth(2)).toBe(true)
      expect(isValidBorderWidth(4)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidBorderWidth(-1)).toBe(false)
      expect(isValidBorderWidth(5)).toBe(false)
    })
  })

  describe('isValidBorderRadius', () => {
    it('should accept values in range 0-24', () => {
      expect(isValidBorderRadius(0)).toBe(true)
      expect(isValidBorderRadius(12)).toBe(true)
      expect(isValidBorderRadius(24)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidBorderRadius(-1)).toBe(false)
      expect(isValidBorderRadius(25)).toBe(false)
    })
  })

  describe('isValidBackgroundOpacity', () => {
    it('should accept values in range 0.5-1.0', () => {
      expect(isValidBackgroundOpacity(0.5)).toBe(true)
      expect(isValidBackgroundOpacity(0.75)).toBe(true)
      expect(isValidBackgroundOpacity(1.0)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidBackgroundOpacity(0.49)).toBe(false)
      expect(isValidBackgroundOpacity(1.01)).toBe(false)
    })
  })

  describe('isValidBackgroundBlur', () => {
    it('should accept values in range 0-20', () => {
      expect(isValidBackgroundBlur(0)).toBe(true)
      expect(isValidBackgroundBlur(10)).toBe(true)
      expect(isValidBackgroundBlur(20)).toBe(true)
    })

    it('should reject values outside range', () => {
      expect(isValidBackgroundBlur(-1)).toBe(false)
      expect(isValidBackgroundBlur(21)).toBe(false)
    })
  })
})

describe('Theme Name Validation', () => {
  describe('isValidThemeName', () => {
    it('should accept valid theme names', () => {
      expect(isValidThemeName('My Theme')).toBe(true)
      expect(isValidThemeName('Theme123')).toBe(true)
      expect(isValidThemeName('my-theme')).toBe(true)
      expect(isValidThemeName('my_theme')).toBe(true)
      expect(isValidThemeName('Theme-123_ABC')).toBe(true)
    })

    it('should accept names at boundary lengths', () => {
      expect(isValidThemeName('abc')).toBe(true) // 3 chars (min)
      expect(isValidThemeName('a'.repeat(30))).toBe(true) // 30 chars (max)
    })

    it('should reject names that are too short', () => {
      expect(isValidThemeName('ab')).toBe(false) // 2 chars
      expect(isValidThemeName('a')).toBe(false) // 1 char
      expect(isValidThemeName('')).toBe(false) // empty
    })

    it('should reject names that are too long', () => {
      expect(isValidThemeName('a'.repeat(31))).toBe(false) // 31 chars
      expect(isValidThemeName('a'.repeat(50))).toBe(false) // 50 chars
    })

    it('should reject names with special characters', () => {
      expect(isValidThemeName('My Theme!')).toBe(false) // exclamation
      expect(isValidThemeName('Theme@123')).toBe(false) // at sign
      expect(isValidThemeName('Theme#1')).toBe(false) // hash
      expect(isValidThemeName('Theme$')).toBe(false) // dollar
      expect(isValidThemeName('Theme%')).toBe(false) // percent
    })

    it('should handle non-string inputs', () => {
      expect(isValidThemeName(123 as any)).toBe(false)
      expect(isValidThemeName(null as any)).toBe(false)
      expect(isValidThemeName(undefined as any)).toBe(false)
    })
  })
})

describe('Theme Configuration Validation', () => {
  const validConfig: EnhancedThemeConfig = {
    themeId: 'test',
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

  describe('validateThemeConfig', () => {
    it('should validate a complete valid configuration', () => {
      const result = validateThemeConfig(validConfig)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject non-object configurations', () => {
      const result = validateThemeConfig(null)
      expect(result.valid).toBe(false)
      expect(result.errors[0].field).toBe('config')
    })

    it('should reject configurations missing required properties', () => {
      const result = validateThemeConfig({})
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'metadata')).toBe(true)
      expect(result.errors.some((e) => e.field === 'effects')).toBe(true)
      expect(result.errors.some((e) => e.field === 'layout')).toBe(true)
    })

    it('should reject configurations with missing theme name', () => {
      const config = { ...validConfig, metadata: { ...validConfig.metadata, name: '' } }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'metadata.name')).toBe(true)
    })

    it('should reject configurations with invalid theme name', () => {
      const config = { ...validConfig, metadata: { ...validConfig.metadata, name: 'ab' } }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'metadata.name')).toBe(true)
    })

    it('should reject invalid blur radius', () => {
      const config = {
        ...validConfig,
        effects: {
          ...validConfig.effects,
          glassmorphism: { ...validConfig.effects.glassmorphism, blurRadius: 100 }
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'effects.glassmorphism.blurRadius')).toBe(true)
    })

    it('should reject invalid opacity', () => {
      const config = {
        ...validConfig,
        effects: {
          ...validConfig.effects,
          glassmorphism: { ...validConfig.effects.glassmorphism, opacity: 0.9 }
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'effects.glassmorphism.opacity')).toBe(true)
    })

    it('should reject invalid shadow intensity', () => {
      const config = {
        ...validConfig,
        effects: {
          ...validConfig.effects,
          neumorphism: { ...validConfig.effects.neumorphism, shadowIntensity: 150 }
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'effects.neumorphism.shadowIntensity')).toBe(
        true
      )
    })

    it('should reject invalid gradient angle', () => {
      const config = {
        ...validConfig,
        gradient: { ...validConfig.gradient, angle: 400 }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'gradient.angle')).toBe(true)
    })

    it('should reject gradient with too few color stops', () => {
      const config = {
        ...validConfig,
        gradient: { ...validConfig.gradient, stops: [{ color: '#fff', position: 0 }] }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'gradient.stops')).toBe(true)
    })

    it('should reject gradient with too many color stops', () => {
      const config = {
        ...validConfig,
        gradient: {
          ...validConfig.gradient,
          stops: [
            { color: '#fff', position: 0 },
            { color: '#eee', position: 25 },
            { color: '#ddd', position: 50 },
            { color: '#ccc', position: 75 },
            { color: '#bbb', position: 87 },
            { color: '#aaa', position: 100 }
          ]
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'gradient.stops')).toBe(true)
    })

    it('should reject gradient with invalid color in stops', () => {
      const config = {
        ...validConfig,
        gradient: {
          ...validConfig.gradient,
          stops: [
            { color: 'invalid', position: 0 },
            { color: '#fff', position: 100 }
          ]
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field.includes('gradient.stops'))).toBe(true)
    })

    it('should reject invalid spacing scale', () => {
      const config = {
        ...validConfig,
        layout: { ...validConfig.layout, spacingScale: 2.0 }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'layout.spacingScale')).toBe(true)
    })

    it('should reject invalid font weight', () => {
      const config = {
        ...validConfig,
        typography: { ...validConfig.typography, fontWeight: 900 }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'typography.fontWeight')).toBe(true)
    })

    it('should reject invalid accent colors', () => {
      const config = {
        ...validConfig,
        accents: { ...validConfig.accents, primary: 'invalid-color' }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'accents.primary')).toBe(true)
    })

    it('should reject invalid background color', () => {
      const config = {
        ...validConfig,
        background: { ...validConfig.background, value: 'not-a-color' }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'background.value')).toBe(true)
    })

    it('should reject invalid background opacity', () => {
      const config = {
        ...validConfig,
        background: { ...validConfig.background, opacity: 0.3 }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.field === 'background.opacity')).toBe(true)
    })

    it('should collect multiple validation errors', () => {
      const config = {
        ...validConfig,
        metadata: { ...validConfig.metadata, name: 'ab' },
        effects: {
          ...validConfig.effects,
          glassmorphism: { ...validConfig.effects.glassmorphism, blurRadius: 100 }
        }
      }
      const result = validateThemeConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})
