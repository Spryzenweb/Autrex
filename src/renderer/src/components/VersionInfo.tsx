import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, AlertCircle, RefreshCw, Download, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export function VersionInfo() {
  const { t } = useTranslation()
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [versionCheck, setVersionCheck] = useState<{
    isCompatible: boolean
    requiredVersion: string | null
    message?: string
  } | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkVersion = async () => {
    setIsChecking(true)
    try {
      const [version, check] = await Promise.all([
        window.api.getCurrentVersion(),
        window.api.versionCheck()
      ])

      console.log('[VersionInfo] Current version:', version)
      console.log('[VersionInfo] Version check result:', check)

      setCurrentVersion(version)
      setVersionCheck(check)
    } catch (error) {
      console.error('Failed to check version:', error)
    } finally {
      setIsChecking(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    checkVersion()
  }, [])

  const handleDownload = () => {
    window.electron.ipcRenderer.invoke('open-external', 'https://autrex.kesug.com')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">{t('versionInfo.checking', 'Checking version...')}</span>
        </div>
      </div>
    )
  }

  // App is up to date if version is compatible (even if requiredVersion exists)
  const isUpToDate = versionCheck?.isCompatible === true
  // Needs update only if NOT compatible AND requiredVersion exists
  const needsUpdate =
    versionCheck && versionCheck.isCompatible === false && versionCheck.requiredVersion

  return (
    <div className="space-y-6">
      {/* Version Status Card */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isUpToDate
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : needsUpdate
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-gray-100 dark:bg-gray-900/30'
              }`}
            >
              {isUpToDate ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : needsUpdate ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                {t('versionInfo.title', 'Application Version')}
              </h3>
              <p className="text-sm text-text-secondary">
                {isUpToDate
                  ? t('versionInfo.upToDate', 'Your app is up to date')
                  : needsUpdate
                    ? t('versionInfo.updateAvailable', 'Update available')
                    : t('versionInfo.status', 'Version status')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={checkVersion}
            disabled={isChecking}
            title={t('versionInfo.refresh', 'Refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Version Details */}
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {t('versionInfo.currentVersion', 'Current Version')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-medium text-text-primary">
                {currentVersion}
              </span>
              {isUpToDate && (
                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t('versionInfo.latest', 'Latest')}
                </Badge>
              )}
            </div>
          </div>

          {versionCheck?.requiredVersion && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('versionInfo.requiredVersion', 'Required Version')}
              </span>
              <span className="text-sm font-mono font-medium text-amber-600 dark:text-amber-400">
                {versionCheck.requiredVersion}
              </span>
            </div>
          )}
        </div>

        {/* Update Available Message */}
        {needsUpdate && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t(
                  'versionInfo.updateMessage',
                  'A new version is available. Please update to continue using all features.'
                )}
              </p>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('versionInfo.downloadUpdate', 'Download Update')}
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}

        {/* Up to Date Message */}
        {isUpToDate && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('versionInfo.upToDateMessage', 'You are using the latest version of Autrex.')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-text-secondary">
          {t('versionInfo.website', 'Visit')}{' '}
          <button
            onClick={handleDownload}
            className="text-primary-500 hover:text-primary-600 underline"
          >
            autrex.kesug.com
          </button>{' '}
          {t('versionInfo.forUpdates', 'for updates and information')}
        </p>
      </div>
    </div>
  )
}
