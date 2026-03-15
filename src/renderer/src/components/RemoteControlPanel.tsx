import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Smartphone, QrCode, Copy, Power, Check, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import QRCode from 'qrcode'

interface RemoteSession {
  sessionCode: string
  isActive: boolean
  expiresAt: string
}

export function RemoteControlPanel() {
  const { t } = useTranslation()
  const [isActive, setIsActive] = useState(false)
  const [session, setSession] = useState<RemoteSession | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  useEffect(() => {
    if (session?.sessionCode) {
      generateQRCode(session.sessionCode)
    }
  }, [session])

  const checkStatus = async () => {
    try {
      const result = await window.api.remoteStatus()
      setIsActive(result.isActive)
      setSession(result.session || null)
    } catch (error) {
      console.error('Failed to check remote status:', error)
    }
  }

  const generateQRCode = async (code: string) => {
    try {
      const url = `https://autrex.kesug.com/remote/?code=${code}`
      const qr = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      setQrCodeUrl(qr)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (isActive) {
        // Stop session
        const result = await window.api.remoteStop()
        if (result.success) {
          setIsActive(false)
          setSession(null)
          setQrCodeUrl('')
        }
      } else {
        // Start session
        const result = await window.api.remoteStart()
        if (result.success && result.session) {
          setIsActive(true)
          setSession(result.session)
        }
      }
    } catch (error) {
      console.error('Failed to toggle remote control:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyUrl = () => {
    if (session?.sessionCode) {
      const url = `https://autrex.kesug.com/remote/?code=${session.sessionCode}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t('remoteControl.title', 'Remote Control')}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('remoteControl.subtitle', 'Control pick/ban from your phone')}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {isActive ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                {t('remoteControl.active', 'Active')}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">
                {t('remoteControl.inactive', 'Inactive')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        onClick={handleToggle}
        disabled={loading}
        className={`w-full h-12 ${
          isActive
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
        }`}
      >
        <Power className="w-5 h-5 mr-2" />
        {loading
          ? t('remoteControl.loading', 'Loading...')
          : isActive
            ? t('remoteControl.stop', 'Stop Remote Control')
            : t('remoteControl.start', 'Start Remote Control')}
      </Button>

      {/* Session Info */}
      {isActive && session && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Session Code */}
          <div className="bg-elevated rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-2">
              {t('remoteControl.sessionCode', 'Session Code')}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-mono font-bold text-purple-600 tracking-wider">
                {session.sessionCode}
              </div>
              <Button onClick={copyCode} variant="ghost" size="sm" className="ml-2">
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeUrl && (
            <div className="bg-elevated rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-3 flex items-center">
                <QrCode className="w-4 h-4 mr-2" />
                {t('remoteControl.scanQR', 'Scan QR Code')}
              </div>
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-sm text-blue-400 space-y-2">
              <p className="font-semibold">📱 {t('remoteControl.howTo', 'How to use:')}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>{t('remoteControl.step1', 'Scan QR code or enter session code')}</li>
                <li>{t('remoteControl.step2', 'Open autrex.kesug.com/remote on your phone')}</li>
                <li>{t('remoteControl.step3', 'Control pick/ban during champ select')}</li>
              </ol>
            </div>
          </div>

          {/* URL Copy */}
          <Button onClick={copyUrl} variant="outline" className="w-full">
            <Copy className="w-4 h-4 mr-2" />
            {t('remoteControl.copyUrl', 'Copy URL')}
          </Button>

          {/* Expiration */}
          <div className="text-xs text-text-secondary text-center">
            {t('remoteControl.expires', 'Session expires in 2 hours')}
          </div>
        </div>
      )}

      {/* Info when inactive */}
      {!isActive && (
        <div className="text-sm text-text-secondary text-center py-4">
          <p>{t('remoteControl.info', 'Enable remote control to pick/ban from your phone')}</p>
          <p className="mt-2 text-xs">
            {t(
              'remoteControl.infoDetail',
              'Perfect for when you need to step away from your computer'
            )}
          </p>
        </div>
      )}
    </div>
  )
}
