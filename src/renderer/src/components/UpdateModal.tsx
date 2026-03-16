import { useEffect, useState } from 'react'
import { Download, Sparkles, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'

interface UpdateInfo {
  version: string
  releaseDate?: string
}

interface UpdateModalProps {
  updateInfo: UpdateInfo
  onDownload: () => void
  downloading: boolean
  downloadProgress: number
}

export function UpdateModal({ updateInfo, onDownload, downloading, downloadProgress }: UpdateModalProps) {
  const { t } = useTranslation()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`relative w-full max-w-md mx-4 transform transition-all duration-500 ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl blur-2xl animate-pulse" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/50 to-primary-600/50 rounded-2xl blur-lg" />
        
        {/* Modal Content */}
        <div className="relative bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-500/30 overflow-hidden">
          {/* Header with animated background */}
          <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
            
            <div className="relative">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {t('update.available', 'Yeni Güncelleme Mevcut!')}
              </h2>
              <p className="text-white/90 text-lg font-semibold drop-shadow-md">
                v{updateInfo.version}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Update Message */}
            <div className="text-center space-y-3">
              <p className="text-text-primary font-medium">
                {t('update.mandatory', 'Bu güncelleme zorunludur')}
              </p>
              <p className="text-sm text-text-secondary">
                {t('update.mandatoryDesc', 'Uygulamayı kullanmaya devam etmek için güncellemeyi indirmelisiniz')}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 bg-surface-hover/50 rounded-xl p-4 border border-border/50">
              <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-500" />
                {t('update.whatsNew', 'Yenilikler')}
              </p>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>{t('update.improvements', 'Performans iyileştirmeleri')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>{t('update.bugFixes', 'Hata düzeltmeleri')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>{t('update.newFeatures', 'Yeni özellikler')}</span>
                </li>
              </ul>
            </div>

            {/* Download Progress */}
            {downloading && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">{t('update.downloading', 'İndiriliyor...')}</span>
                  <span className="text-primary-500 font-semibold">{Math.round(downloadProgress)}%</span>
                </div>
                <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out relative overflow-hidden"
                    style={{ width: `${downloadProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={onDownload}
              disabled={downloading}
              className="relative w-full h-14 text-base font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
              size="lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {downloading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('update.downloading', 'İndiriliyor...')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 group-hover:animate-bounce" />
                  {t('update.downloadNow', 'Şimdi Güncelle')}
                </div>
              )}
            </Button>

            {/* Warning */}
            <p className="text-xs text-center text-text-secondary">
              {t('update.autoInstall', 'İndirme tamamlandığında uygulama otomatik olarak yeniden başlatılacak')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
