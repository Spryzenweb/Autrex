import { Theme, ColorScale } from './types'
import { EnhancedThemeConfig } from './enhanced-types'

export function generateCSSVariables(theme: Theme): string {
  const variables: string[] = []

  // Convert color scale to CSS variables
  const addColorScale = (name: string, scale: ColorScale) => {
    Object.entries(scale).forEach(([key, value]) => {
      variables.push(`--color-${name}-${key}: ${value};`)
    })
  }

  // Primary and secondary color scales
  addColorScale('primary', theme.colors.primary)
  addColorScale('secondary', theme.colors.secondary)

  // Background colors
  variables.push(`--color-background: ${theme.colors.background.base};`)
  variables.push(`--color-surface: ${theme.colors.background.surface};`)
  variables.push(`--color-elevated: ${theme.colors.background.elevated};`)

  // Text colors
  variables.push(`--color-text-primary: ${theme.colors.text.primary};`)
  variables.push(`--color-text-secondary: ${theme.colors.text.secondary};`)
  variables.push(`--color-text-muted: ${theme.colors.text.muted};`)
  variables.push(`--color-text-inverse: ${theme.colors.text.inverse};`)
  variables.push(`--color-foreground: ${theme.colors.text.primary};`) // Alias for primary text

  // Border colors
  variables.push(`--color-border: ${theme.colors.border.default};`)
  variables.push(`--color-border-strong: ${theme.colors.border.strong};`)
  variables.push(`--color-border-subtle: ${theme.colors.border.subtle};`)

  // State colors
  variables.push(`--color-success: ${theme.colors.state.success};`)
  variables.push(`--color-warning: ${theme.colors.state.warning};`)
  variables.push(`--color-error: ${theme.colors.state.error};`)
  variables.push(`--color-info: ${theme.colors.state.info};`)

  return variables.join('\n  ')
}

/**
 * Generate CSS custom properties from EnhancedThemeConfig
 * This extends the base theme variables with enhanced customization options
 */
export function generateEnhancedCSSVariables(
  theme: Theme,
  config: Partial<EnhancedThemeConfig>
): string {
  const variables: string[] = []

  // Start with base theme variables
  const baseVariables = generateCSSVariables(theme)
  variables.push(baseVariables)

  // Accent colors (if provided)
  if (config.accents) {
    variables.push(`--color-accent-primary: ${config.accents.primary};`)
    variables.push(`--color-accent-secondary: ${config.accents.secondary};`)
    variables.push(`--color-accent-tertiary: ${config.accents.tertiary};`)
  }

  // Typography (if provided)
  if (config.typography) {
    variables.push(`--font-family: ${config.typography.fontFamily};`)
    variables.push(`--font-weight: ${config.typography.fontWeight};`)
    variables.push(`--line-height: ${config.typography.lineHeight};`)
    variables.push(`--letter-spacing: ${config.typography.letterSpacing}em;`)
  }

  // Borders (if provided)
  if (config.borders) {
    variables.push(`--border-width: ${config.borders.width}px;`)
    variables.push(`--border-radius: ${config.borders.radius}px;`)
    variables.push(`--border-style: ${config.borders.style};`)
  }

  // Layout spacing (if provided)
  if (config.layout) {
    variables.push(`--spacing-scale: ${config.layout.spacingScale};`)
    
    // Component size multipliers
    const sizeMultipliers = {
      compact: { padding: 0.75, fontSize: 0.9 },
      normal: { padding: 1.0, fontSize: 1.0 },
      comfortable: { padding: 1.25, fontSize: 1.1 }
    }
    const multiplier = sizeMultipliers[config.layout.componentSize] || sizeMultipliers.normal
    variables.push(`--component-padding-scale: ${multiplier.padding};`)
    variables.push(`--component-font-scale: ${multiplier.fontSize};`)
  }

  // Effects - Glassmorphism (if enabled)
  if (config.effects?.glassmorphism?.enabled) {
    variables.push(`--glass-blur: ${config.effects.glassmorphism.blurRadius}px;`)
    variables.push(`--glass-opacity: ${config.effects.glassmorphism.opacity};`)
  }

  // Effects - Neumorphism (if enabled)
  if (config.effects?.neumorphism?.enabled) {
    variables.push(`--neomorph-intensity: ${config.effects.neumorphism.shadowIntensity};`)
  }

  // Effects - Glow (if enabled)
  if (config.effects?.glow?.enabled) {
    variables.push(`--glow-intensity: ${config.effects.glow.intensity};`)
  }

  // Background customization (if provided)
  if (config.background) {
    variables.push(`--bg-opacity: ${config.background.opacity};`)
    variables.push(`--bg-blur: ${config.background.blur}px;`)
    
    if (config.background.type === 'solid') {
      variables.push(`--bg-value: ${config.background.value};`)
    } else if (config.background.type === 'gradient') {
      variables.push(`--bg-gradient: ${config.background.value};`)
    } else if (config.background.type === 'image') {
      variables.push(`--bg-image: url(${config.background.value});`)
      if (config.background.position) {
        variables.push(`--bg-position: ${config.background.position};`)
      }
    }
  }

  // Gradient configuration (if enabled)
  if (config.gradient?.enabled) {
    const { type, angle, position, stops, animated, animationSpeed } = config.gradient
    
    // Generate gradient CSS string
    let gradientValue = ''
    if (type === 'linear') {
      const angleValue = angle ?? 135
      const colorStops = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
      gradientValue = `linear-gradient(${angleValue}deg, ${colorStops})`
    } else if (type === 'radial') {
      const posValue = position ?? 'center'
      const colorStops = stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
      gradientValue = `radial-gradient(circle at ${posValue}, ${colorStops})`
    }
    
    variables.push(`--gradient-value: ${gradientValue};`)
    
    if (animated) {
      const speeds = { slow: '10s', medium: '5s', fast: '2s' }
      variables.push(`--gradient-animation-speed: ${speeds[animationSpeed] || speeds.medium};`)
    }
  }

  // Accessibility settings (if provided)
  if (config.accessibility) {
    variables.push(`--reduced-motion: ${config.accessibility.reducedMotion ? '1' : '0'};`)
    variables.push(`--high-contrast: ${config.accessibility.highContrast ? '1' : '0'};`)
  }

  return variables.join('\n  ')
}

export function applyTheme(theme: Theme, enhancedConfig?: Partial<EnhancedThemeConfig>): void {
  const root = document.documentElement
  
  // Generate CSS variables - use enhanced version if config provided, otherwise use base
  const cssVariables = enhancedConfig 
    ? generateEnhancedCSSVariables(theme, enhancedConfig)
    : generateCSSVariables(theme)

  // Create or update style element
  let styleElement = document.getElementById('theme-variables')
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = 'theme-variables'
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = `:root {\n  ${cssVariables}\n}`

  // Update data attributes for theme identification
  root.setAttribute('data-theme', theme.id)
  root.setAttribute('data-theme-mode', theme.isDark ? 'dark' : 'light')

  // Keep the dark class in sync
  if (theme.isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  // Apply layout-specific attributes if enhanced config provided
  if (enhancedConfig?.layout) {
    root.setAttribute('data-sidebar-position', enhancedConfig.layout.sidebarPosition)
    root.setAttribute('data-component-size', enhancedConfig.layout.componentSize)
  }
  
  // Apply effect attributes for conditional styling
  if (enhancedConfig?.effects) {
    root.setAttribute('data-glassmorphism', String(enhancedConfig.effects.glassmorphism?.enabled ?? false))
    root.setAttribute('data-neumorphism', String(enhancedConfig.effects.neumorphism?.enabled ?? false))
    root.setAttribute('data-glow', String(enhancedConfig.effects.glow?.enabled ?? false))
  }
  
  // Apply accessibility attributes
  if (enhancedConfig?.accessibility) {
    root.setAttribute('data-reduced-motion', String(enhancedConfig.accessibility.reducedMotion))
    root.setAttribute('data-high-contrast', String(enhancedConfig.accessibility.highContrast))
  }
}

export function getSystemThemePreference(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}
