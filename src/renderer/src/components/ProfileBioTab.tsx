import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { UserCircle, Loader2, Save, RefreshCw } from 'lucide-react'
import { ModernCard } from './ModernCard'
import { ModernButton } from './ModernButton'

const SAVED_BIO_KEY = 'profile_saved_bio_v1'

export function ProfileBioTab() {
  const lcuConnected = useAtomValue(lcuConnectedAtom)
  const [bio, setBio] = useState(() => localStorage.getItem(SAVED_BIO_KEY) ?? '')
  const [availability, setAvailability] = useState('chat')
  const [loading, setLoading] = useState(false)

  const statusLabel = (value: string) => {
    switch (value) {
      case 'chat':
        return 'ÇEVRİMİÇİ'
      case 'away':
        return 'UZAKTA'
      case 'mobile':
        return 'MOBİL'
      case 'offline':
        return 'ÇEVRİMDIŞI'
      default:
        return value.toUpperCase()
    }
  }

  useEffect(() => {
    if (lcuConnected) {
      refreshProfileData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lcuConnected])

  const refreshProfileData = async () => {
    if (!lcuConnected) return
    try {
      const chatRes = await window.api.lcuRequest('GET', '/lol-chat/v1/me')
      if (chatRes?.availability) setAvailability(chatRes.availability)

      const lcuBio: string = chatRes?.statusMessage || ''
      const savedBio = localStorage.getItem(SAVED_BIO_KEY) ?? ''

      if (lcuBio && lcuBio.trim() !== '') {
        setBio(lcuBio)
        localStorage.setItem(SAVED_BIO_KEY, lcuBio)
      } else if (savedBio && savedBio.trim() !== '') {
        // Restore saved bio
        await handleUpdateBio(savedBio)
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err)
    }
  }

  const handleUpdateBio = async (bioText?: string) => {
    const textToUpdate = bioText || bio
    if (!lcuConnected) return

    setLoading(true)
    try {
      await window.api.lcuRequest('PUT', '/lol-chat/v1/me', {
        statusMessage: textToUpdate
      })
      localStorage.setItem(SAVED_BIO_KEY, textToUpdate)
      if (!bioText) {
        // Show success toast
        console.log('Bio updated successfully')
      }
    } catch (err) {
      console.error('Failed to update bio:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyAvailability = async (next?: string) => {
    if (!lcuConnected) return
    const target = (next || availability).trim()
    if (!target) return

    const previous = availability
    if (next) setAvailability(next)
    setLoading(true)

    try {
      await window.api.lcuRequest('PUT', '/lol-chat/v1/me', { availability: target })
      console.log(`Status updated: ${statusLabel(target)}`)
    } catch (err) {
      if (next) setAvailability(previous)
      console.error('Failed to update status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 relative">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-animated opacity-5" />
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Profil Bio & Durum
          </h1>
          <p className="text-text-secondary">Profilini özelleştir ve durumunu güncelle</p>
        </div>

        <ModernCard variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg gradient-gaming">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Durum Mesajı</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="bio-input"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Durum Mesajı
              </label>
              <textarea
                id="bio-input"
                className="w-full px-4 py-3 glass border border-white/20 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                placeholder="Arkadaşlarına ne yaptığını söyle..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!lcuConnected || loading}
                rows={3}
              />
            </div>

            <ModernButton
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={() => handleUpdateBio()}
              disabled={!lcuConnected || loading || !bio.trim()}
              loading={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              BIO UYGULA
            </ModernButton>

            {lcuConnected && (
              <ModernCard variant="glass" className="mt-6 p-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Sohbet Durumu
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      availability === 'chat'
                        ? 'bg-green-500/20 text-green-400 glow-primary'
                        : availability === 'away'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : availability === 'mobile'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {statusLabel(availability)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <select
                    className="flex-1 px-4 py-2 glass border border-white/20 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                  >
                    <option value="chat">ÇEVRİMİÇİ</option>
                    <option value="away">UZAKTA</option>
                    <option value="mobile">MOBİL</option>
                    <option value="offline">ÇEVRİMDIŞI</option>
                  </select>
                  <ModernButton
                    variant="cyber"
                    onClick={() => applyAvailability()}
                    disabled={!lcuConnected || loading}
                    loading={loading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    UYGULA
                  </ModernButton>
                </div>
              </ModernCard>
            )}
          </div>
        </ModernCard>

        {!lcuConnected && (
          <ModernCard variant="glow" className="p-4 text-center">
            <p className="text-red-400 text-sm">
              ⚠ Bu özelliği kullanmak için League of Legends'ı başlatın.
            </p>
          </ModernCard>
        )}
      </div>
    </div>
  )
}
