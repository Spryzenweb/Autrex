import React, { useState, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { licenseAtom } from '../store/atoms/license.atoms'
import { AlertCircle, CheckCircle2, Key, Sparkles, Shield, Zap, Globe } from 'lucide-react'
import logoImage from '../assets/images/logo-build.png'
import '../assets/license-activation.css'

interface LicenseActivationProps {
  onActivated?: () => void
}

export function LicenseActivation({ onActivated }: LicenseActivationProps) {
  const { t, i18n } = useTranslation()
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const setLicense = useSetAtom(licenseAtom)
  const [animateFeatures, setAnimateFeatures] = useState(false)

  useEffect(() => {
    // Trigger feature animations after mount
    setTimeout(() => setAnimateFeatures(true), 300)
  }, [])

  const changeLanguage = async (lng: string) => {
    try {
      console.log('Changing language to:', lng)
      await i18n.changeLanguage(lng)
      console.log('Language changed successfully. Current language:', i18n.language)
      // Force component re-render
      setError('')
      setSuccess(false)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const formatLicenseKey = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()

    // Split into groups of 4
    const groups = cleaned.match(/.{1,4}/g) || []

    // Join with dashes, max 4 groups
    return groups.slice(0, 4).join('-')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setError('')
    setSuccess(false)
  }

  const handleActivate = async () => {
    if (!licenseKey || licenseKey.length < 19) {
      setError('Lütfen geçerli bir lisans anahtarı girin')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Call IPC to activate license
      const result = await window.electron.ipcRenderer.invoke('license:activate', licenseKey)

      if (result.valid && result.info) {
        // Update license state
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

        setSuccess(true)

        // Call onActivated callback after a short delay
        setTimeout(() => {
          onActivated?.()
        }, 1500)
      } else {
        setError(result.error || 'Lisans aktivasyonu başarısız')
      }
    } catch (err) {
      console.error('License activation error:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleActivate()
    }
  }

  const getLicenseTypeLabel = (key: string): string => {
    const prefix = key.substring(0, 4)
    const typeMap: Record<string, string> = {
      AUTR: t('licenseActivation.lifetime', 'Ömür Boyu'),
      AUTD: t('licenseActivation.daily', 'Günlük (24 saat)'),
      AUTW: t('licenseActivation.weekly', 'Haftalık (7 gün)'),
      AUTM: t('licenseActivation.monthly', 'Aylık (30 gün)'),
      AUTT: t('licenseActivation.trial', 'Deneme (6 saat)')
    }
    return typeMap[prefix] || t('licenseActivation.unknown', 'Bilinmeyen')
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-900 via-background to-primary-800 p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <Globe className="w-4 h-4 text-text-secondary" />
        <button
          onClick={() => changeLanguage('tr_TR')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            i18n.language.startsWith('tr')
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          TR
        </button>
        <button
          onClick={() => changeLanguage('en_US')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            i18n.language.startsWith('en')
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          EN
        </button>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features */}
          <div className="space-y-8 text-center md:text-left">
            {/* Logo */}
            <div className="flex justify-center md:justify-start">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse-slow" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-600/20 rounded-2xl blur-lg animate-pulse" />
                <img
                  src={logoImage}
                  alt="Autrex Logo"
                  className="relative w-32 h-32 object-contain drop-shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-float"
                />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                {t('licenseActivation.welcome', 'Autrex\'e Hoş Geldiniz')}
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                {t(
                  'licenseActivation.subtitle',
                  'League of Legends deneyiminizi bir üst seviyeye taşıyın'
                )}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                {
                  icon: Sparkles,
                  title: t('licenseActivation.feature1', 'Sınırsız Skin Erişimi'),
                  desc: t(
                    'licenseActivation.feature1Desc',
                    'Tüm şampiyonlar için binlerce skin'
                  )
                },
                {
                  icon: Zap,
                  title: t('licenseActivation.feature2', 'Anında Aktivasyon'),
                  desc: t('licenseActivation.feature2Desc', 'Hızlı ve kolay kurulum')
                },
                {
                  icon: Shield,
                  title: t('licenseActivation.feature3', 'Güvenli & Güncel'),
                  desc: t('licenseActivation.feature3Desc', 'Düzenli güncellemeler ve destek')
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transform transition-all duration-500 hover:bg-white/10 hover:scale-105 ${
                    animateFeatures
                      ? 'translate-x-0 opacity-100'
                      : '-translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="flex-shrink-0 p-2 bg-primary-500/20 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1 drop-shadow-md">{feature.title}</h3>
                    <p className="text-sm text-white/80 drop-shadow-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Activation Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-2xl blur-xl" />
            <div className="relative bg-surface/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 border border-white/10">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-500/30 rounded-full blur-lg animate-pulse" />
                    <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg">
                      <Key className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {t('licenseActivation.title', 'Lisans Aktivasyonu')}
                </h2>
                <p className="text-sm text-text-secondary">
                  {t(
                    'licenseActivation.description',
                    'Lisans anahtarınızı girerek başlayın'
                  )}
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-300">
                      {t('licenseActivation.success', 'Lisans başarıyla aktive edildi!')}
                    </p>
                    <p className="text-xs text-green-400/80 mt-1">
                      {t('licenseActivation.loading', 'Uygulama yükleniyor...')}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && !success && (
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* License Key Input */}
              <div className="space-y-2">
                <Label htmlFor="licenseKey" className="text-sm font-medium text-text-primary">
                  {t('licenseActivation.licenseKey', 'Lisans Anahtarı')}
                </Label>
                <Input
                  id="licenseKey"
                  type="text"
                  value={licenseKey}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="font-mono text-center text-lg tracking-wider h-14 bg-white border-2 border-primary-500/30 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 placeholder:text-gray-400"
                  maxLength={19}
                  disabled={loading || success}
                  autoFocus
                />
                {licenseKey.length >= 4 && (
                  <div className="flex justify-center">
                    <p className="text-xs text-white font-medium animate-in fade-in slide-in-from-top-1 duration-300 bg-primary-500/30 py-1.5 px-4 rounded-full">
                      {t('licenseActivation.type', 'Lisans Tipi')}: {getLicenseTypeLabel(licenseKey)}
                    </p>
                  </div>
                )}
              </div>

              {/* Activate Button */}
              <Button
                onClick={handleActivate}
                disabled={loading || success || licenseKey.length < 19}
                className="relative w-full h-14 text-base font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('licenseActivation.activating', 'Aktive ediliyor...')}
                  </div>
                ) : success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    {t('licenseActivation.activated', 'Aktive Edildi')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                    {t('licenseActivation.activate', 'Lisansı Aktive Et')}
                  </div>
                )}
              </Button>

              {/* Info */}
              <div className="pt-4 border-t border-border/50">
                <div className="space-y-2 text-xs text-text-secondary">
                  <p className="font-medium text-text-primary text-center mb-3">
                    {t('licenseActivation.licenseTypes', 'Lisans Tipleri')}:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { code: 'AUTR', name: t('licenseActivation.lifetime', 'Ömür Boyu') },
                      { code: 'AUTM', name: t('licenseActivation.monthly', 'Aylık (30 gün)') },
                      { code: 'AUTW', name: t('licenseActivation.weekly', 'Haftalık (7 gün)') },
                      { code: 'AUTD', name: t('licenseActivation.daily', 'Günlük (24 saat)') },
                      { code: 'AUTT', name: t('licenseActivation.trial', 'Deneme (6 saat)') }
                    ].map((type) => (
                      <div
                        key={type.code}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-hover/30 hover:bg-surface-hover/50 transition-colors"
                      >
                        <span className="font-mono text-primary-300 font-semibold text-xs">
                          {type.code}
                        </span>
                        <span className="text-text-primary text-xs">- {type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purchase Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-text-secondary mb-3">
                  {t('licenseActivation.noLicense', 'Lisans anahtarınız yok mu?')}
                </p>
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary-500/50 hover:border-primary-500 hover:bg-primary-500/10 text-primary-400 hover:text-primary-300 font-semibold transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault()
                    window.electron.ipcRenderer.send('open-external', 'https://autrex.kesug.com')
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('licenseActivation.purchase', 'Satın Al')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
