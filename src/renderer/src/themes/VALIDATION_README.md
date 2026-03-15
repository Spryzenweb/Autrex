# Theme Validation System

This document describes the theme validation system implemented for Task 2.2 of the modern-ui-redesign spec.

## Overview

The validation system provides comprehensive validation for theme configurations, ensuring data integrity and preventing corrupted or invalid themes from breaking the application.

## Files

### `validation.ts`
Core validation module containing all validation functions.

**Color Format Validation:**
- `isValidHexColor(color: string)` - Validates HEX colors (#RGB, #RRGGBB, #RRGGBBAA)
- `isValidRgbColor(color: string)` - Validates RGB/RGBA colors with range checking (0-255 for RGB, 0-1 for alpha)
- `isValidHslColor(color: string)` - Validates HSL/HSLA colors with range checking (0-360 for hue, 0-100 for saturation/lightness)
- `isValidColorFormat(color: string)` - Validates any supported color format

**Numeric Range Validation:**
- `isValidBlurRadius(value: number)` - Validates blur radius (4-24px)
- `isValidGlassmorphismOpacity(value: number)` - Validates glassmorphism opacity (0.1-0.4)
- `isValidShadowIntensity(value: number)` - Validates shadow intensity (0-100)
- `isValidGlowIntensity(value: number)` - Validates glow intensity (0-100)
- `isValidGradientAngle(value: number)` - Validates gradient angle (0-360 degrees)
- `isValidSpacingScale(value: number)` - Validates spacing scale (0.75-1.5)
- `isValidFontWeight(value: number)` - Validates font weight (300-700)
- `isValidLineHeight(value: number)` - Validates line height (1.2-2.0)
- `isValidLetterSpacing(value: number)` - Validates letter spacing (-0.05-0.2em)
- `isValidBorderWidth(value: number)` - Validates border width (0-4px)
- `isValidBorderRadius(value: number)` - Validates border radius (0-24px)
- `isValidBackgroundOpacity(value: number)` - Validates background opacity (0.5-1.0)
- `isValidBackgroundBlur(value: number)` - Validates background blur (0-20px)

**Theme Name Validation:**
- `isValidThemeName(name: string)` - Validates theme names (3-30 characters, alphanumeric + spaces, hyphens, underscores)

**Configuration Validation:**
- `validateThemeConfig(config: unknown)` - Validates complete theme configuration, returns ValidationResult with errors
- `assertValidThemeConfig(config: unknown)` - Validates and throws error if invalid (useful for imports)

### `storage.ts` (Updated)
Enhanced with validation integration:

- `loadThemeConfig()` - Now validates loaded configurations and returns null for invalid data (fallback to default theme)
- `saveThemeConfig()` - Validates configuration before saving, throws error if invalid
- `saveCustomTheme()` - Validates theme name and full configuration before saving
- `importTheme()` - Uses comprehensive validation instead of basic checks

### `validation.test.ts`
Comprehensive test suite with 100+ test cases covering:
- All color format variations (HEX, RGB, HSL with and without alpha)
- Boundary value testing for all numeric ranges
- Theme name validation edge cases
- Complete theme configuration validation
- Error message validation

### `storage.test.ts` (Updated)
Updated existing tests to work with new validation:
- Added test for invalid theme values in loadThemeConfig
- Added test for validation rejection in saveThemeConfig
- Added test for invalid theme name in saveCustomTheme
- Updated importTheme tests to expect new error messages

## Requirements Validated

This implementation validates the following requirements:

- **5.6**: Theme name validation (3-30 chars, alphanumeric)
- **14.2**: HEX color format validation
- **14.3**: RGB color format validation (0-255 per channel)
- **14.4**: HSL color format validation
- **25.1**: Color value validation (HEX, RGB, HSL)
- **25.2**: Numeric value range validation
- **25.3**: Theme name uniqueness and character validation
- **25.7**: Prevention of saving invalid configurations

## Fallback Behavior

When corrupted or invalid theme data is detected:

1. **On Load**: `loadThemeConfig()` returns `null`, triggering fallback to default theme
2. **On Save**: `saveThemeConfig()` throws error, preventing invalid data from being persisted
3. **On Import**: `importTheme()` throws descriptive error, allowing user to fix the issue

## Error Messages

All validation errors include:
- Field name (e.g., "effects.glassmorphism.blurRadius")
- Descriptive message (e.g., "Blur radius must be between 4 and 24")
- Current value (for debugging)

## Usage Examples

```typescript
import { validateThemeConfig, isValidColorFormat, isValidThemeName } from './validation'

// Validate a color
if (!isValidColorFormat('#ff0000')) {
  console.error('Invalid color format')
}

// Validate a theme name
if (!isValidThemeName('My Theme')) {
  console.error('Invalid theme name')
}

// Validate complete configuration
const result = validateThemeConfig(config)
if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

## Testing

To run tests (once vitest is installed):
```bash
npm test -- src/renderer/src/themes/validation.test.ts --run
npm test -- src/renderer/src/themes/storage.test.ts --run
```

## Future Enhancements

Potential improvements for future tasks:
- Add validation for theme name uniqueness across custom themes
- Add validation for maximum custom theme count (10 themes)
- Add validation for background image file size (5MB limit)
- Add WCAG contrast ratio validation for accent colors
