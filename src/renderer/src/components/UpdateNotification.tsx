import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UpdateInfo {
  version: string
  releaseDate?: string
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    console.log('[UpdateNotification] Component mounted, setting up listeners')
    
    // Listen for update events
    const removeUpdateAvailable = window.api.onUpdateAvailable((info: UpdateInfo) => {
      console.log('[UpdateNotification] Update available:', info)
      setUpdateAvailable(true)
      setUpdateInfo(info)
      
      toast.info(`Yeni güncelleme mevcut: v${info.version}`, {
        duration: Infinity,
        action: {
          label: 'İndir',
          onClick: handleDownload
        }
      })
    })

    const removeUpdateNotAvailable = window.api.onUpdateNotAvailable(() => {
      console.log('[UpdateNotification] No updates available')
    })

    const removeUpdateError = window.api.onUpdateError((error: string) => {
      console.error('[UpdateNotification] Update error:', error)
      toast.error(`Güncelleme hatası: ${error}`)
      setDownloading(false)
    })

    const removeDownloadProgress = window.api.onUpdateDownloadProgress((progress: any) => {
      setDownloadProgress(progress.percent || 0)
      toast.loading(`İndiriliyor: ${Math.round(progress.percent || 0)}%`, {
        id: 'update-download'
      })
    })

    const removeUpdateDownloaded = window.api.onUpdateDownloaded(() => {
      toast.success('Güncelleme indirildi! Uygulama yeniden başlatılıyor...', {
        id: 'update-download'
      })
      // App will quit and install automatically
    })

    return () => {
      removeUpdateAvailable()
      removeUpdateNotAvailable()
      removeUpdateError()
      removeDownloadProgress()
      removeUpdateDownloaded()
    }
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await window.api.downloadUpdate()
    } catch (error) {
      console.error('[Update] Download failed:', error)
      setDownloading(false)
    }
  }

  return null // This component only handles notifications
}
