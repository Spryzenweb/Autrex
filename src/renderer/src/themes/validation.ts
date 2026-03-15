import { EnhancedThemeConfig, themeValidationRules } from './enhanced-types'

/**
 * Theme Validation System
 * Provides validation functions for theme configuration values
 */

// ============================================================================
// Color Format Validation
// ============================================================================

/**
 * Validates HEX color format
 * Accepts: #RGB, #RRGGBB, #RRGGBBAA
 */
export function isValidHexColor(color: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
  return hexPattern.test(color)
}

/**
 * Validates RGB color format
 * Accepts: rgb(r, g, b) or rgba(r, g, b, a)
 * Values: r, g, b must be 0-255, a must be 0-1
 */
export function isValidRgbColor(color: string): boolean {
  const rgbPattern = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/
  const match = color.match(rgbPattern)
  
  if (!match) return false
  
  const [, r, g, b, a] = match
  const red = parseInt(r, 10)
  const green = parseInt(g, 10)
  const blue = parseInt(b, 10)
  
  // Validate RGB values are in range 0-255
  if (red < 0 || red > 255) return false
  if (green < 0 || green > 255) return false
  if (blue < 0 || blue > 255) return false
  
  // Validate alpha if present
  if (a !== undefined) {
    const alpha = parseFloat(a)
    if (isNaN(alpha) || alpha < 0 || alpha > 1) return false
  }
  
  return true
}

/**
 * Validates HSL color format
 * Accepts: hsl(h, s%, l%) or hsla(h, s%, l%, a)
 * Values: h must be 0-360, s and l must be 0-100, a must be 0-1
 */
export function isValidHslColor(color: string): boolean {
  const hslPattern = /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)$/
  const match = color.match(hslPattern)
  
  if (!match) return false
  
  const [, h, s, l, a] = match
  const hue = parseInt(h, 10)
  const saturation = parseInt(s, 10)
  const lightness = parseInt(l, 10)
  
  // Validate HSL values are in range
  if (hue < 0 || hue > 360) return false
  if (saturation < 0 || saturation > 100) return false
  if (lightness < 0 || lightness > 100) return false
  
  // Validate alpha if present
  if (a !== undefined) {
    const alpha = parseFloat(a)
    if (isNaN(alpha) || alpha < 0 || alpha > 1) return false
  }
  
  return true
}

/**
 * Validates any supported color format (HEX, RGB, HSL)
 */
export function isValidColorFormat(color: string): boolean {
  if (typeof color !== 'string') return false
  
  const trimmed = color.trim()
  if (trimmed.length === 0) return false
  
  return isValidHexColor(trimmed) || isValidRgbColor(trimmed) || isValidHslColor(trimmed)
}

// ============================================================================
// Numeric Range Validation
// ============================================================================

/**
 * Validates a numeric value is within a specified range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false
  return value >= min && value <= max
}

/**
 * Validates glassmorphism blur radius (4-24px)
 */
export function isValidBlurRadius(value: number): boolean {
  const { min, max } = themeValidationRules.effects.glassmorphism.blurRadius
  return isInRange(value, min, max)
}

/**
 * Validates glassmorphism opacity (0.1-0.4)
 */
export function isValidGlassmorphismOpacity(value: number): boolean {
  const { min, max } = themeValidationRules.effects.glassmorphism.opacity
  return isInRange(value, min, max)
}

/**
 * Validates shadow intensity (0-100)
 */
export function isValidShadowIntensity(value: number): boolean {
  const { min, max } = themeValidationRules.effects.neumorphism.shadowIntensity
  return isInRange(value, min, max)
}

/**
 * Validates glow intensity (0-100)
 */
export function isValidGlowIntensity(value: number): boolean {
  const { min, max } = themeValidationRules.effects.glow.intensity
  return isInRange(value, min, max)
}

/**
 * Validates gradient angle (0-360 degrees)
 */
export function isValidGradientAngle(value: number): boolean {
  const { min, max } = themeValidationRules.gradient.angle
  return isInRange(value, min, max)
}

/**
 * Validates spacing scale (0.75-1.5)
 */
export function isValidSpacingScale(value: number): boolean {
  const { min, max } = themeValidationRules.layout.spacingScale
  return isInRange(value, min, max)
}

/**
 * Validates font weight (300-700)
 */
export function isValidFontWeight(value: number): boolean {
  const { min, max } = themeValidationRules.typography.fontWeight
  return isInRange(value, min, max)
}

/**
 * Validates line height (1.2-2.0)
 */
export function isValidLineHeight(value: number): boolean {
  const { min, max } = themeValidationRules.typography.lineHeight
  return isInRange(value, min, max)
}

/**
 * Validates letter spacing (-0.05-0.2em)
 */
export function isValidLetterSpacing(value: number): boolean {
  const { min, max } = themeValidationRules.typography.letterSpacing
  return isInRange(value, min, max)
}

/**
 * Validates border width (0-4px)
 */
export function isValidBorderWidth(value: number): boolean {
  const { min, max } = themeValidationRules.borders.width
  return isInRange(value, min, max)
}

/**
 * Validates border radius (0-24px)
 */
export function isValidBorderRadius(value: number): boolean {
  const { min, max } = themeValidationRules.borders.radius
  return isInRange(value, min, max)
}

/**
 * Validates background opacity (0.5-1.0)
 */
export function isValidBackgroundOpacity(value: number): boolean {
  const { min, max } = themeValidationRules.background.opacity
  return isInRange(value, min, max)
}

/**
 * Validates background blur (0-20px)
 */
export function isValidBackgroundBlur(value: number): boolean {
  const { min, max } = themeValidationRules.background.blur
  return isInRange(value, min, max)
}

// ============================================================================
// Theme Name Validation
// ============================================================================

/**
 * Validates theme name
 * Requirements:
 * - 3-30 characters long
 * - Alphanumeric characters, spaces, hyphens, and underscores only
 */
export function isValidThemeName(name: string): boolean {
  if (typeof name !== 'string') return false
  
  const { minLength, maxLength, pattern } = themeValidationRules.metadata.name
  
  // Check length
  if (name.length < minLength || name.length > maxLength) return false
  
  // Check pattern (alphanumeric, spaces, hyphens, underscores)
  return pattern.test(name)
}

// ============================================================================
// Theme Configuration Validation
// ============================================================================

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Validates a complete theme configuration
 * Returns validation result with any errors found
 */
export function validateThemeConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = []
  
  // Type check
  if (!config || typeof config !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'config', message: 'Theme configuration must be an object' }]
    }
  }
  
  const themeConfig = config as Partial<EnhancedThemeConfig>
  
  // Validate required top-level properties
  if (!themeConfig.metadata) {
    errors.push({ field: 'metadata', message: 'Missing required property: metadata' })
  }
  if (!themeConfig.effects) {
    errors.push({ field: 'effects', message: 'Missing required property: effects' })
  }
  if (!themeConfig.layout) {
    errors.push({ field: 'layout', message: 'Missing required property: layout' })
  }
  
  // If critical properties are missing, return early
  if (errors.length > 0) {
    return { valid: false, errors }
  }
  
  // Validate metadata
  if (themeConfig.metadata) {
    if (!themeConfig.metadata.name) {
      errors.push({ field: 'metadata.name', message: 'Theme name is required' })
    } else if (!isValidThemeName(themeConfig.metadata.name)) {
      errors.push({
        field: 'metadata.name',
        message: 'Theme name must be 3-30 characters and contain only alphanumeric characters, spaces, hyphens, and underscores',
        value: themeConfig.metadata.name
      })
    }
  }
  
  // Validate effects
  if (themeConfig.effects) {
    const { glassmorphism, neumorphism, glow } = themeConfig.effects
    
    if (glassmorphism) {
      if (glassmorphism.blurRadius !== undefined && !isValidBlurRadius(glassmorphism.blurRadius)) {
        errors.push({
          field: 'effects.glassmorphism.blurRadius',
          message: 'Blur radius must be between 4 and 24',
          value: glassmorphism.blurRadius
        })
      }
      
      if (glassmorphism.opacity !== undefined && !isValidGlassmorphismOpacity(glassmorphism.opacity)) {
        errors.push({
          field: 'effects.glassmorphism.opacity',
          message: 'Opacity must be between 0.1 and 0.4',
          value: glassmorphism.opacity
        })
      }
    }
    
    if (neumorphism?.shadowIntensity !== undefined && !isValidShadowIntensity(neumorphism.shadowIntensity)) {
      errors.push({
        field: 'effects.neumorphism.shadowIntensity',
        message: 'Shadow intensity must be between 0 and 100',
        value: neumorphism.shadowIntensity
      })
    }
    
    if (glow?.intensity !== undefined && !isValidGlowIntensity(glow.intensity)) {
      errors.push({
        field: 'effects.glow.intensity',
        message: 'Glow intensity must be between 0 and 100',
        value: glow.intensity
      })
    }
  }
  
  // Validate gradient
  if (themeConfig.gradient) {
    if (themeConfig.gradient.angle !== undefined && !isValidGradientAngle(themeConfig.gradient.angle)) {
      errors.push({
        field: 'gradient.angle',
        message: 'Gradient angle must be between 0 and 360',
        value: themeConfig.gradient.angle
      })
    }
    
    if (themeConfig.gradient.stops) {
      const { min, max } = themeValidationRules.gradient.stops
      if (themeConfig.gradient.stops.length < min || themeConfig.gradient.stops.length > max) {
        errors.push({
          field: 'gradient.stops',
          message: `Gradient must have between ${min} and ${max} color stops`,
          value: themeConfig.gradient.stops.length
        })
      }
      
      // Validate each color stop
      themeConfig.gradient.stops.forEach((stop, index) => {
        if (!isValidColorFormat(stop.color)) {
          errors.push({
            field: `gradient.stops[${index}].color`,
            message: 'Invalid color format',
            value: stop.color
          })
        }
      })
    }
  }
  
  // Validate layout
  if (themeConfig.layout) {
    if (themeConfig.layout.spacingScale !== undefined && !isValidSpacingScale(themeConfig.layout.spacingScale)) {
      errors.push({
        field: 'layout.spacingScale',
        message: 'Spacing scale must be between 0.75 and 1.5',
        value: themeConfig.layout.spacingScale
      })
    }
  }
  
  // Validate typography
  if (themeConfig.typography) {
    const { fontWeight, lineHeight, letterSpacing } = themeConfig.typography
    
    if (fontWeight !== undefined && !isValidFontWeight(fontWeight)) {
      errors.push({
        field: 'typography.fontWeight',
        message: 'Font weight must be between 300 and 700',
        value: fontWeight
      })
    }
    
    if (lineHeight !== undefined && !isValidLineHeight(lineHeight)) {
      errors.push({
        field: 'typography.lineHeight',
        message: 'Line height must be between 1.2 and 2.0',
        value: lineHeight
      })
    }
    
    if (letterSpacing !== undefined && !isValidLetterSpacing(letterSpacing)) {
      errors.push({
        field: 'typography.letterSpacing',
        message: 'Letter spacing must be between -0.05 and 0.2',
        value: letterSpacing
      })
    }
  }
  
  // Validate borders
  if (themeConfig.borders) {
    const { width, radius } = themeConfig.borders
    
    if (width !== undefined && !isValidBorderWidth(width)) {
      errors.push({
        field: 'borders.width',
        message: 'Border width must be between 0 and 4',
        value: width
      })
    }
    
    if (radius !== undefined && !isValidBorderRadius(radius)) {
      errors.push({
        field: 'borders.radius',
        message: 'Border radius must be between 0 and 24',
        value: radius
      })
    }
  }
  
  // Validate accents
  if (themeConfig.accents) {
    const { primary, secondary, tertiary } = themeConfig.accents
    
    if (primary && !isValidColorFormat(primary)) {
      errors.push({
        field: 'accents.primary',
        message: 'Invalid color format',
        value: primary
      })
    }
    
    if (secondary && !isValidColorFormat(secondary)) {
      errors.push({
        field: 'accents.secondary',
        message: 'Invalid color format',
        value: secondary
      })
    }
    
    if (tertiary && !isValidColorFormat(tertiary)) {
      errors.push({
        field: 'accents.tertiary',
        message: 'Invalid color format',
        value: tertiary
      })
    }
  }
  
  // Validate background
  if (themeConfig.background) {
    const { value, opacity, blur } = themeConfig.background
    
    if (value && themeConfig.background.type === 'solid' && !isValidColorFormat(value)) {
      errors.push({
        field: 'background.value',
        message: 'Invalid color format',
        value
      })
    }
    
    if (opacity !== undefined && !isValidBackgroundOpacity(opacity)) {
      errors.push({
        field: 'background.opacity',
        message: 'Background opacity must be between 0.5 and 1.0',
        value: opacity
      })
    }
    
    if (blur !== undefined && !isValidBackgroundBlur(blur)) {
      errors.push({
        field: 'background.blur',
        message: 'Background blur must be between 0 and 20',
        value: blur
      })
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates theme configuration and throws error if invalid
 * Useful for import operations where we want to fail fast
 */
export function assertValidThemeConfig(config: unknown): asserts config is EnhancedThemeConfig {
  const result = validateThemeConfig(config)
  
  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ')
    throw new Error(`Invalid theme configuration: ${errorMessages}`)
  }
}
