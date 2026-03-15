import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { licenseAtom, LicenseType } from '../store/atoms/license.atoms'
import { Copy, CheckCircle2, AlertCircle, Clock, Shield, RefreshCw, Trash2 } from 'lucide-react'

export function LicenseManagement() {
  const { t } = useTranslation()
  const [license, setLicense] = useAtom(licenseAtom)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load license info on mount
    loadLicenseInfo()
  }, [])

  const loadLicenseInfo = async () => {
    setLoading(true)
    try {
      const result = await window.electron.ipcRenderer.invoke('license:status')

      if (result.valid && result.info) {
        setLicense({
          isActivated: true,
          licenseKey: result.info.key,
          licenseInfo: result.info,
          activatedAt: result.info.activatedAt,
          expiresAt: result.info.expiresAt,
          remainingTime: result.info.remainingTime || null,
          error: null,
          isLoading: false
        })
      } else {
        setLicense({
          isActivated: false,
          licenseKey: null,
          licenseInfo: null,
          activatedAt: null,
          expiresAt: null,
          remainingTime: null,
          error: result.error || 'Lisans bulunamadı',
          isLoading: false
        })
      }
    } catch (error) {
      console.error('Failed to load license info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = () => {
    if (license.licenseKey) {
      navigator.clipboard.writeText(license.licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDeactivate = async () => {
    if (
      !confirm(
        t(
          'license.deactivateConfirm',
          'Lisansı deaktive etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
        )
      )
    ) {
      return
    }

    setLoading(true)
    try {
      await window.electron.ipcRenderer.invoke('license:deactivate')

      setLicense({
        isActivated: false,
        licenseKey: null,
        licenseInfo: null,
        activatedAt: null,
        expiresAt: null,
        remainingTime: null,
        error: null,
        isLoading: false
      })

      // Reload the app to show license activation screen
      window.location.reload()
    } catch (error) {
      console.error('Failed to deactivate license:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLicenseTypeLabel = (type: LicenseType): string => {
    const typeMap: Record<LicenseType, string> = {
      [LicenseType.REGULAR]: t('license.types.lifetime', 'Ömür Boyu'),
      [LicenseType.DAILY]: t('license.types.daily', 'Günlük'),
      [LicenseType.WEEKLY]: t('license.types.weekly', 'Haftalık'),
      [LicenseType.MONTHLY]: t('license.types.monthly', 'Aylık'),
      [LicenseType.TRIAL]: t('license.types.trial', 'Deneme')
    }
    return typeMap[type] || t('license.types.unknown', 'Bilinmeyen')
  }

  const getLicenseStatusColor = () => {
    if (!license.isActivated) return 'text-gray-500'
    if (license.expiresAt) {
      const expiresDate = new Date(license.expiresAt)
      const now = new Date()
      const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysLeft <= 1) return 'text-red-500'
      if (daysLeft <= 7) return 'text-yellow-500'
    }
    return 'text-green-500'
  }

  if (loading && !license.licenseInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-text-secondary">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span>{t('license.loading', 'Lisans bilgileri yükleniyor...')}</span>
        </div>
      </div>
    )
  }

  if (!license.isActivated || !license.licenseInfo) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('license.notFound', 'Aktif lisans bulunamadı')}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              {t(
                'license.notFoundDescription',
                'Lütfen uygulamayı yeniden başlatın ve lisans anahtarınızı girin.'
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* License Status Card */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Shield className={`w-5 h-5 ${getLicenseStatusColor()}`} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                {t('license.status', 'Lisans Durumu')}
              </h3>
              <p className="text-sm text-text-secondary">
                {license.isActivated
                  ? t('license.active', 'Aktif')
                  : t('license.inactive', 'Aktif Değil')}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadLicenseInfo}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* License Details */}
        <div className="space-y-3 pt-4 border-t border-border">
          {/* License Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {t('license.licenseType', 'Lisans Tipi')}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {getLicenseTypeLabel(license.licenseInfo.type)}
            </span>
          </div>

          {/* License Key */}
          <div className="space-y-2">
            <Label className="text-sm text-text-secondary">
              {t('license.licenseKey', 'Lisans Anahtarı')}
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-secondary-100 dark:bg-secondary-800 rounded-md text-sm font-mono text-text-primary">
                {license.licenseKey}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyKey} title="Kopyala">
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Activation Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {t('license.activationDate', 'Aktivasyon Tarihi')}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {new Date(license.activatedAt!).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Expiration */}
          {license.expiresAt && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {t('license.expiresAt', 'Bitiş Tarihi')}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {new Date(license.expiresAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {license.remainingTime && (
                <div className="flex items-center gap-2 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Kalan Süre</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {license.remainingTime}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {!license.expiresAt && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {t('license.lifetime', 'Ömür boyu lisans')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDeactivate}
          disabled={loading}
        >
          <Trash2 className="w-4 h-4" />
          {t('license.deactivate', 'Lisansı Deaktive Et')}
        </Button>

        <p className="text-xs text-text-secondary text-center">
          {t(
            'license.deactivateDescription',
            'Lisansı deaktive etmek, bu cihazdan lisansı kaldırır. Başka bir cihazda kullanmak için tekrar aktive edebilirsiniz.'
          )}
        </p>
      </div>
    </div>
  )
}
