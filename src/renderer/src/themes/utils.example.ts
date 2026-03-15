/**
 * Example usage of the CSS variable mapping system
 * This file demonstrates how to use the enhanced theme system
 */

import { defaultTheme } from './themes'
import { defaultEnhancedConfig } from './enhanced-types'
import { applyTheme, generateEnhancedCSSVariables } from './utils'

// Example 1: Apply base theme (backward compatible)
export function applyBaseThemeExample() {
  // This works exactly as before - no breaking changes
  applyTheme(defaultTheme)
}

// Example 2: Apply theme with enhanced configuration
export function applyEnhancedThemeExample() {
  // Create a custom enhanced configuration
  const enhancedConfig = {
    ...defaultEnhancedConfig,
    themeId: 'default',
    mode: 'light' as const,
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
        enabled: true,
        intensity: 60
      }
    },
    accents: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      tertiary: '#06b6d4'
    },
    layout: {
      sidebarPosition: 'left' as const,
      componentSize: 'normal' as const,
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
      style: 'solid' as const
    }
  }

  // Apply theme with enhanced configuration
  applyTheme(defaultTheme, enhancedConfig)
}

// Example 3: Generate CSS variables for preview
export function generateCSSVariablesExample() {
  const enhancedConfig = {
    ...defaultEnhancedConfig,
    themeId: 'default',
    mode: 'dark' as const,
    gradient: {
      enabled: true,
      type: 'linear' as const,
      angle: 135,
      stops: [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
      ],
      animated: true,
      animationSpeed: 'medium' as const
    },
    background: {
      type: 'gradient' as const,
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      opacity: 0.8,
      blur: 0
    }
  }

  // Generate CSS variables string
  const cssVariables = generateEnhancedCSSVariables(defaultTheme, enhancedConfig)
  console.log('Generated CSS Variables:', cssVariables)
  
  return cssVariables
}

// Example 4: Demonstrating backward compatibility
export function backwardCompatibilityExample() {
  // Old code still works without any changes
  applyTheme(defaultTheme)
  
  // New code can use enhanced features
  applyTheme(defaultTheme, {
    effects: {
      glassmorphism: {
        enabled: true,
        blurRadius: 16,
        opacity: 0.3
      },
      neumorphism: {
        enabled: false,
        shadowIntensity: 0
      },
      glow: {
        enabled: false,
        intensity: 0
      }
    }
  })
}

// Example 5: Using CSS variables in components
export function cssVariableUsageExample() {
  // After applying the theme, these CSS variables are available:
  
  // Base theme colors
  // var(--color-primary-500)
  // var(--color-background)
  // var(--color-text-primary)
  
  // Enhanced theme variables
  // var(--color-accent-primary)
  // var(--font-family)
  // var(--border-radius)
  // var(--spacing-scale)
  // var(--glass-blur)
  // var(--glass-opacity)
  // var(--gradient-value)
  
  // Example CSS usage:
  const exampleStyles = `
    .card {
      background: var(--color-surface);
      border-radius: calc(var(--border-radius) * 1px);
      padding: calc(16px * var(--spacing-scale, 1));
      color: var(--color-text-primary);
    }
    
    .card-glass {
      backdrop-filter: blur(var(--glass-blur));
      background: rgba(255, 255, 255, var(--glass-opacity));
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .button-primary {
      background: var(--color-accent-primary);
      border-radius: calc(var(--border-radius) * 1px);
      font-family: var(--font-family);
      font-weight: var(--font-weight);
    }
  `
  
  return exampleStyles
}
