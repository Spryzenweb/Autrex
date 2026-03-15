# Environment Differences: Electron vs Web Browser

This document explains the differences between running Autrex in Electron and web browser environments, and how the application handles these differences.

## Overview

Autrex is designed to work in both Electron (desktop app) and web browser environments. The application automatically detects the environment and provides appropriate functionality for each.

## Environment Detection

### Utility Functions

The application uses utility functions in `src/renderer/src/utils/environment.ts` to detect the current environment:

- `isElectron()`: Returns `true` if running in Electron, `false` if in web browser
- `isBrowser()`: Returns `true` if running in web browser, `false` if in Electron
- `isDevelopment()`: Returns `true` if in development mode
- `isProduction()`: Returns `true` if in production mode
- `getEnvironmentType()`: Returns `'electron'` or `'browser'`

### Detection Method

The primary detection method checks for the presence of `window.api`:

```typescript
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.api !== undefined
}
```

## Key Differences

### 1. API Access

**Electron Environment:**

- Full access to `window.api` object exposed via `contextBridge`
- Can interact with main process through IPC
- Access to file system, native dialogs, and system APIs

**Web Browser Environment:**

- No `window.api` object available
- Limited to web APIs only
- Cannot access file system or native functionality

### 2. Data Sources

**Electron Environment:**

- Loads champion data from local files
- Can fetch and save champion data via main process
- Connects to League Client (LCU) for real-time data

**Web Browser Environment:**

- Uses mock data from `src/renderer/src/data/mockData.ts`
- Cannot connect to League Client
- Provides sample data for testing and demonstration

### 3. Feature Availability

| Feature                | Electron        | Web Browser      |
| ---------------------- | --------------- | ---------------- |
| Champion Data Loading  | ✅ Real data    | ✅ Mock data     |
| Champion Data Fetching | ✅ API calls    | ❌ Not available |
| LCU Connection         | ✅ Full support | ❌ Mock status   |
| File Operations        | ✅ Full support | ❌ Not available |
| Auto Ban/Pick          | ✅ Functional   | ❌ UI only       |
| Settings Persistence   | ✅ File-based   | ❌ localStorage  |
| Updates                | ✅ Auto-updater | ❌ Not available |

## Implementation Details

### Environment-Specific Code

Components and hooks check the environment before executing functionality:

```typescript
// Example from useChampionData.ts
const loadChampionData = useCallback(async () => {
  if (!isElectron()) {
    // Load mock data for browser environment
    setChampionData(mockChampionData)
    return
  }

  // Electron-specific code
  const result = await window.api.loadChampionData()
  // ...
}, [])
```

### Mock Data Structure

Mock data is centralized in `src/renderer/src/data/mockData.ts`:

- `mockChampions`: Array of basic champion information
- `mockChampionData`: Complete champion data with skins
- `mockSettings`: Default application settings
- `mockLcuStatus`: Mock League Client status

### Visual Indicators

The `EnvironmentIndicator` component shows the current environment:

- **Electron**: Monitor icon with "Electron" text
- **Browser**: Globe icon with "Browser" text
- **Development**: Additional "DEV" tag

The indicator is hidden in production Electron builds.

## Development Workflow

### Testing in Browser

1. Run `npm run dev`
2. Open `http://localhost:5173` in your browser
3. The application will automatically detect browser environment
4. Mock data will be loaded for testing

### Testing in Electron

1. Run `npm run dev` (starts both web server and Electron)
2. Electron window opens automatically
3. Full functionality is available
4. Real data sources are used

## Best Practices

### 1. Environment Checks

Always check the environment before using Electron-specific APIs:

```typescript
if (isElectron()) {
  // Electron-specific code
  await window.api.someElectronFunction()
} else {
  // Browser fallback or mock behavior
  console.warn('Feature not available in browser mode')
}
```

### 2. Graceful Degradation

Provide meaningful alternatives for browser users:

```typescript
const handleFeature = () => {
  if (isElectron()) {
    return window.api.performAction()
  } else {
    toast.info('This feature is only available in the desktop app')
    return Promise.resolve(mockResult)
  }
}
```

### 3. Mock Data Maintenance

Keep mock data up-to-date with real data structures:

- Update mock data when adding new champion properties
- Ensure mock data covers common use cases
- Test both environments regularly

## Troubleshooting

### Common Issues

1. **`window.api` is undefined**: Application is running in browser mode
2. **Mock data not loading**: Check `mockData.ts` imports and exports
3. **Environment indicator not showing**: Check if running in production Electron

### Debugging

Use browser developer tools to check:

- Console for environment detection logs
- Network tab for failed API calls
- Application tab for localStorage in browser mode

## Future Considerations

- Consider implementing a service worker for offline functionality in browser mode
- Add more comprehensive mock data for complex features
- Implement progressive web app (PWA) features for better browser experience
