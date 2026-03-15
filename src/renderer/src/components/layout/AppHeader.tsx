import { memo, useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAtom, useAtomValue } from 'jotai'
import { showSettingsDialogAtom } from '../../store/atoms/ui.atoms'
import { lcuConnectedAtom, isInChampSelectAtom } from '../../store/atoms/lcu.atoms'
import appIcon from '../../assets/images/app-icon.png'
import { StatusIndicator } from '../StatusIndicator'

interface SummonerInfo {
  displayName: string
  summonerLevel: number
  profileIconId: number
}

export const AppHeader = memo(() => {
  const { t } = useTranslation()
  const [, setShowSettingsDialog] = useAtom(showSettingsDialogAtom)
  const lcuConnected = useAtomValue(lcuConnectedAtom)
  const isInChampSelect = useAtomValue(isInChampSelectAtom)
  const [summonerInfo, setSummonerInfo] = useState<SummonerInfo | null>(null)
  const [appVersion, setAppVersion] = useState<string>('')

  // Fetch app version
  useEffect(() => {
    window.electron.ipcRenderer.invoke('get-app-version').then((version) => {
      setAppVersion(version)
    })
  }, [])

  // Fetch summoner info when LCU connects
  useEffect(() => {
    const fetchSummonerInfo = async () => {
      if (lcuConnected && window.api && window.api.lcuGetCurrentSummoner) {
        try {
          console.log('[AppHeader] Fetching summoner info...')
          const result = await window.api.lcuGetCurrentSummoner()
          console.log('[AppHeader] Result:', result)

          if (result && result.success && result.summoner) {
            console.log(
              '[AppHeader] Full summoner object:',
              JSON.stringify(result.summoner, null, 2)
            )
            console.log('[AppHeader] displayName:', result.summoner.displayName)
            console.log('[AppHeader] All keys:', Object.keys(result.summoner))
            setSummonerInfo(result.summoner)
          } else {
            console.log('[AppHeader] Failed to get summoner')
            setSummonerInfo(null)
          }
        } catch (error) {
          console.error('[AppHeader] Error:', error)
          setSummonerInfo(null)
        }
      } else {
        setSummonerInfo(null)
      }
    }

    fetchSummonerInfo()
  }, [lcuConnected])

  const getStatusText = () => {
    if (!lcuConnected) return t('lcu.notConnected', 'Bağlı değil')
    if (isInChampSelect) return t('lcu.inChampSelect', 'Şampiyon seçiminde')
    return t('lcu.connected', 'Bağlı')
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 glass border-b border-white/10 backdrop-blur-xl">
      {/* Left side - Logo + LCU Status + Account Info */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <img src={appIcon} alt="Autrex" className="w-8 h-8 float-animation" />
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Autrex
            </span>
            {appVersion && <span className="text-xs text-text-secondary">v{appVersion}</span>}
          </div>
        </div>
        {/* LCU Status */}
        <StatusIndicator
          status={lcuConnected ? (isInChampSelect ? 'success' : 'online') : 'offline'}
          text={getStatusText()}
          size="md"
          animated={true}
        />

        {/* Account Info */}
        {lcuConnected && summonerInfo && (
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-elevated border-2 border-purple-500 glow-primary">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summonerInfo.profileIconId}.jpg`}
                alt={summonerInfo.displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg'
                }}
              />
            </div>

            {/* Name */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {summonerInfo.displayName || 'Unknown'}
              </span>
            </div>
          </div>
        )}

        {/* Settings Button - REMOVED, now in ThemeSelector */}
      </div>

      {/* Right side - Settings Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSettingsDialog(true)}
          className="p-2 rounded-lg glass hover:glass-strong transition-all hover-lift"
          title="Ayarlar"
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  )
})

AppHeader.displayName = 'AppHeader'
