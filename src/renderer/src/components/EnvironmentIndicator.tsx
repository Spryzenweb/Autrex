import { Badge } from './ui/badge'
import { Monitor, Globe } from 'lucide-react'
import { getEnvironmentConfig } from '../utils/environment'

export function EnvironmentIndicator() {
  const config = getEnvironmentConfig()

  if (config.isProduction && config.isElectron) {
    // Don't show indicator in production Electron app
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        variant={config.isElectron ? 'default' : 'secondary'}
        className="flex items-center gap-1 text-xs"
      >
        {config.isElectron ? (
          <>
            <Monitor className="w-3 h-3" />
            Electron
          </>
        ) : (
          <>
            <Globe className="w-3 h-3" />
            Browser
          </>
        )}
        {config.isDevelopment && <span className="ml-1 text-orange-500">DEV</span>}
      </Badge>
    </div>
  )
}
