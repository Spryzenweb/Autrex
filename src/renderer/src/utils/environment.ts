/**
 * Environment detection utilities for Autrex
 * Helps distinguish between Electron and web browser environments
 */

/**
 * Check if the application is running in Electron environment
 * @returns true if running in Electron, false if in web browser
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.api !== undefined
}

/**
 * Check if the application is running in web browser environment
 * @returns true if running in web browser, false if in Electron
 */
export function isBrowser(): boolean {
  return !isElectron()
}

/**
 * Check if the application is running in development mode
 * @returns true if in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV
}

/**
 * Check if the application is running in production mode
 * @returns true if in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD
}

/**
 * Get the current environment type
 * @returns 'electron' | 'browser'
 */
export function getEnvironmentType(): 'electron' | 'browser' {
  return isElectron() ? 'electron' : 'browser'
}

/**
 * Execute a function only if running in Electron environment
 * @param fn Function to execute
 * @param fallback Optional fallback function for browser environment
 */
export function ifElectron<T>(fn: () => T, fallback?: () => T): T | undefined {
  if (isElectron()) {
    return fn()
  }
  return fallback?.()
}

/**
 * Execute a function only if running in browser environment
 * @param fn Function to execute
 * @param fallback Optional fallback function for Electron environment
 */
export function ifBrowser<T>(fn: () => T, fallback?: () => T): T | undefined {
  if (isBrowser()) {
    return fn()
  }
  return fallback?.()
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  return {
    isElectron: isElectron(),
    isBrowser: isBrowser(),
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    environmentType: getEnvironmentType(),
    hasWindowApi: typeof window !== 'undefined' && window.api !== undefined,
    hasElectronApi: typeof window !== 'undefined' && window.electron !== undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  }
}
