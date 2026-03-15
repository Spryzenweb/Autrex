import { useTranslation } from 'react-i18next'
import { AlertTriangle, Download, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'

interface VersionMismatchScreenProps {
  currentVersion: string
  requiredVersion: string
}

export function VersionMismatchScreen({
  currentVersion,
  requiredVersion
}: VersionMismatchScreenProps) {
  const { t } = useTranslation()

  const handleDownload = () => {
    window.electron.ipcRenderer.send('open-external', 'https://autrex.kesug.com')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative p-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t('versionMismatch.title', 'Update Required')}
            </h1>
            <p className="text-text-secondary">
              {t(
                'versionMismatch.description',
                'A new version of Autrex is required to continue using the app.'
              )}
            </p>
          </div>

          {/* Version Info */}
          <div className="space-y-3 p-4 bg-elevated/50 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('versionMismatch.currentVersion', 'Current Version')}
              </span>
              <span className="text-sm font-mono font-medium text-text-primary">
                {currentVersion}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {t('versionMismatch.requiredVersion', 'Required Version')}
              </span>
              <span className="text-sm font-mono font-medium text-amber-600 dark:text-amber-400">
                {requiredVersion}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            className="w-full h-12 text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
          >
            <Download className="w-5 h-5 mr-2" />
            {t('versionMismatch.downloadButton', 'Download Latest Version')}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          {/* Info Text */}
          <p className="text-xs text-text-secondary text-center">
            {t('versionMismatch.info', 'Visit autrex.kesug.com to download the latest version')}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            {t('versionMismatch.footer', 'Thank you for using Autrex')}
          </p>
        </div>
      </div>
    </div>
  )
}
