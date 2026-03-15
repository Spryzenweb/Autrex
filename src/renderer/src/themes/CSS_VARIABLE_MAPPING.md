# CSS Variable Mapping System

## Overview

This document describes the CSS variable mapping system implemented for the modern UI redesign. The system converts `EnhancedThemeConfig` to CSS custom properties and applies them to the document root, enabling dynamic theming with full backward compatibility.

## Implementation

### Core Functions

#### `generateCSSVariables(theme: Theme): string`

Generates base CSS custom properties from a Theme object. This function maintains backward compatibility with the existing theme system.

**Generated Variables:**
- Color scales: `--color-primary-{50-950}`, `--color-secondary-{50-950}`
- Background colors: `--color-background`, `--color-surface`, `--color-elevated`
- Text colors: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-inverse`
- Border colors: `--color-border`, `--color-border-strong`, `--color-border-subtle`
- State colors: `--color-success`, `--color-warning`, `--color-error`, `--color-info`

#### `generateEnhancedCSSVariables(theme: Theme, config: Partial<EnhancedThemeConfig>): string`

Extends base CSS variables with enhanced theme configuration options.

**Additional Variables:**

1. **Accent Colors** (if `config.accents` provided):
   - `--color-accent-primary`
   - `--color-accent-secondary`
   - `--color-accent-tertiary`

2. **Typography** (if `config.typography` provided):
   - `--font-family`
   - `--font-weight`
   - `--line-height`
   - `--letter-spacing` (in em units)

3. **Borders** (if `config.borders` provided):
   - `--border-width` (in px)
   - `--border-radius` (in px)
   - `--border-style`

4. **Layout** (if `config.layout` provided):
   - `--spacing-scale`
   - `--component-padding-scale` (0.75 for compact, 1.0 for normal, 1.25 for comfortable)
   - `--component-font-scale` (0.9 for compact, 1.0 for normal, 1.1 for comfortable)

5. **Effects**:
   - Glassmorphism (if enabled): `--glass-blur`, `--glass-opacity`
   - Neumorphism (if enabled): `--neomorph-intensity`
   - Glow (if enabled): `--glow-intensity`

6. **Background** (if `config.background` provided):
   - `--bg-opacity`
   - `--bg-blur` (in px)
   - `--bg-value` (for solid colors)
   - `--bg-gradient` (for gradients)
   - `--bg-image` (for images)
   - `--bg-position` (for images)

7. **Gradient** (if enabled):
   - `--gradient-value` (complete gradient CSS string)
   - `--gradient-animation-speed` (if animated)

8. **Accessibility** (if `config.accessibility` provided):
   - `--reduced-motion` (0 or 1)
   - `--high-contrast` (0 or 1)

#### `applyTheme(theme: Theme, enhancedConfig?: Partial<EnhancedThemeConfig>): void`

Applies theme to the document root by:
1. Generating CSS variables (base or enhanced based on config)
2. Creating/updating a `<style>` element with id `theme-variables`
3. Setting data attributes on document root for conditional styling
4. Managing the `dark` class for dark mode

**Data Attributes Set:**
- `data-theme`: Theme ID
- `data-theme-mode`: "light" or "dark"
- `data-sidebar-position`: "left" or "right" (if enhanced config provided)
- `data-component-size`: "compact", "normal", or "comfortable" (if enhanced config provided)
- `data-glassmorphism`: "true" or "false" (if effects config provided)
- `data-neumorphism`: "true" or "false" (if effects config provided)
- `data-glow`: "true" or "false" (if effects config provided)
- `data-reduced-motion`: "true" or "false" (if accessibility config provided)
- `data-high-contrast`: "true" or "false" (if accessibility config provided)

## Backward Compatibility

The implementation maintains full backward compatibility with the existing theme system:

```typescript
// Old code continues to work without changes
applyTheme(defaultTheme)

// New code can use enhanced features
applyTheme(defaultTheme, enhancedConfig)
```

The `enhancedConfig` parameter is optional, so existing code that only passes a `Theme` object will continue to work exactly as before.

## Usage Examples

### Basic Usage (Backward Compatible)

```typescript
import { defaultTheme } from './themes'
import { applyTheme } from './utils'

// Apply base theme
applyTheme(defaultTheme)
```

### Enhanced Usage

```typescript
import { defaultTheme } from './themes'
import { defaultEnhancedConfig } from './enhanced-types'
import { applyTheme } from './utils'

// Apply theme with glassmorphism effect
applyTheme(defaultTheme, {
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
      intensity: 0
    }
  },
  accents: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    tertiary: '#06b6d4'
  }
})
```

### Using CSS Variables in Components

```css
/* Card with glassmorphism effect */
.card-glass {
  backdrop-filter: blur(var(--glass-blur));
  background: rgba(255, 255, 255, var(--glass-opacity));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: calc(var(--border-radius) * 1px);
}

/* Button with accent color */
.button-primary {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  padding: calc(12px * var(--component-padding-scale));
  font-size: calc(14px * var(--component-font-scale));
  border-radius: calc(var(--border-radius) * 1px);
}

/* Responsive spacing */
.container {
  padding: calc(16px * var(--spacing-scale));
  gap: calc(8px * var(--spacing-scale));
}
```

### Conditional Styling with Data Attributes

```css
/* Apply glassmorphism only when enabled */
[data-glassmorphism="true"] .card {
  backdrop-filter: blur(var(--glass-blur));
  background: rgba(255, 255, 255, var(--glass-opacity));
}

/* Adjust animations based on reduced motion preference */
[data-reduced-motion="true"] * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}

/* Sidebar positioning */
[data-sidebar-position="left"] .sidebar {
  left: 0;
}

[data-sidebar-position="right"] .sidebar {
  right: 0;
}
```

## Gradient Generation

The system automatically generates gradient CSS strings from configuration:

### Linear Gradient

```typescript
{
  gradient: {
    enabled: true,
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ]
  }
}
```

Generates: `--gradient-value: linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Radial Gradient

```typescript
{
  gradient: {
    enabled: true,
    type: 'radial',
    position: 'center',
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 }
    ]
  }
}
```

Generates: `--gradient-value: radial-gradient(circle at center, #667eea 0%, #764ba2 100%)`

## Component Size Multipliers

The system provides automatic scaling for component sizes:

| Size        | Padding Scale | Font Scale |
|-------------|---------------|------------|
| Compact     | 0.75          | 0.9        |
| Normal      | 1.0           | 1.0        |
| Comfortable | 1.25          | 1.1        |

These multipliers are applied via CSS variables:
- `--component-padding-scale`
- `--component-font-scale`

## Performance Considerations

1. **CSS Variables**: Using CSS custom properties enables instant theme switching without re-rendering React components
2. **Single Style Element**: All theme variables are contained in a single `<style>` element with id `theme-variables`
3. **Minimal DOM Updates**: Only the style element content and data attributes are updated on theme changes
4. **No Inline Styles**: All styling is done via CSS variables, avoiding inline style performance issues

## Requirements Validation

This implementation satisfies **Requirement 20.1**:

> THE Theme_System SHALL apply theme changes using CSS_Variable for instant updates

✅ All theme values are applied via CSS custom properties
✅ Theme changes update CSS variables instantly without component re-renders
✅ Backward compatibility maintained with existing theme system
✅ Enhanced configuration options are optional and additive

## Next Steps

Task 1.3 will implement property-based tests to verify:
- CSS variable generation correctness
- Theme application behavior
- Backward compatibility
- Enhanced configuration handling

See `utils.example.ts` for additional usage examples.
