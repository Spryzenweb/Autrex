import { useEffect, useState } from 'react'
import { UpdateModal } from './UpdateModal'

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
    })

    const removeUpdateNotAvailable = window.api.onUpdateNotAvailable(() => {
      console.log('[UpdateNotification] No updates available')
    })

    const removeUpdateError = window.api.onUpdateError((error: string) => {
      console.error('[UpdateNotification] Update error:', error)
      setDownloading(false)
    })

    const removeDownloadProgress = window.api.onUpdateDownloadProgress((progress: any) => {
      setDownloadProgress(progress.percent || 0)
    })

    const removeUpdateDownloaded = window.api.onUpdateDownloaded(() => {
      console.log('[UpdateNotification] Update downloaded, app will restart')
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

  // Show mandatory update modal
  if (updateAvailable && updateInfo) {
    return (
      <UpdateModal
        updateInfo={updateInfo}
        onDownload={handleDownload}
        downloading={downloading}
        downloadProgress={downloadProgress}
      />
    )
  }

  return null
}
