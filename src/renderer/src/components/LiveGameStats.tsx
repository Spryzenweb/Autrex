import { useEffect, useState } from 'react'
import { Activity, TrendingUp, Trophy, Coins, Sparkles, Zap } from 'lucide-react'
import { GoldTracker } from './live-game/GoldTracker'
import { AugmentTierList } from './live-game/AugmentTierList'

interface Player {
  summonerName: string
  championName: string
  level: number
  team: 'ORDER' | 'CHAOS'
  isDead: boolean
  items: Array<{
    itemID: number
    displayName: string
    price: number
  }>
  scores: {
    kills: number
    deaths: number
    assists: number
    creepScore: number
  }
}

interface GameData {
  gameMode: string
  gameTime: number
}

interface LiveGameData {
  allPlayers: Player[]
  gameData: GameData
}

export function LiveGameStats() {
  const [gameData, setGameData] = useState<LiveGameData | null>(null)
  const [connectionState, setConnectionState] = useState<
    'disconnected' | 'searching' | 'connected'
  >('disconnected')
  const [activeTab, setActiveTab] = useState<'stats' | 'gold' | 'augments'>('stats')

  useEffect(() => {
    // Listen for game data updates
    const unsubData = window.electron.ipcRenderer.on(
      'live-game:data',
      (_event, data: LiveGameData) => {
        setGameData(data)
      }
    )

    const unsubState = window.electron.ipcRenderer.on(
      'live-game:state',
      (_event, state: string) => {
        setConnectionState(state as any)
      }
    )

    // Request initial state
    window.electron.ipcRenderer.invoke('live-game:get-state').then((state) => {
      setConnectionState(state)
    })

    window.electron.ipcRenderer.invoke('live-game:get-data').then((data) => {
      if (data) setGameData(data)
    })

    return () => {
      unsubData()
      unsubState()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateKDA = (k: number, d: number, a: number) => {
    if (d === 0) return ((k + a) / 1).toFixed(2)
    return ((k + a) / d).toFixed(2)
  }

  const tabs = [
    { id: 'stats' as const, label: 'İstatistikler', icon: Activity },
    { id: 'gold' as const, label: 'Altın Takibi', icon: Coins },
    { id: 'augments' as const, label: 'Augment Tier List', icon: Sparkles }
  ]

  if (connectionState === 'disconnected') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-surface">
        {/* Modern Tab Bar */}
        <div className="flex items-center gap-2 px-6 py-4 bg-surface/50 backdrop-blur-sm border-b border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-text-secondary hover:bg-elevated hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                {tab.label}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-20 blur-xl" />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          {activeTab === 'augments' ? (
            <AugmentTierList />
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
                <div className="relative p-8 rounded-2xl bg-elevated/50 backdrop-blur-sm border border-border/50">
                  <Activity className="w-16 h-16 text-primary-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Oyun Bekleniyor</h3>
                <p className="text-text-secondary max-w-md">
                  League of Legends oyununa girin ve canlı istatistikler otomatik olarak görünecek
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface/50 border border-border/50">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-text-secondary">
                  Overlay otomatik olarak oyun başladığında açılacak
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (connectionState === 'searching' || !gameData) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-surface">
        {/* Modern Tab Bar */}
        <div className="flex items-center gap-2 px-6 py-4 bg-surface/50 backdrop-blur-sm border-b border-border/50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-text-secondary hover:bg-elevated hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                {tab.label}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-20 blur-xl" />
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          {activeTab === 'augments' ? (
            <AugmentTierList />
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-bold text-white">Oyun Verisi Yükleniyor</h3>
                <p className="text-text-secondary">Lütfen bekleyin...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const orderPlayers = gameData.allPlayers.filter((p) => p.team === 'ORDER')
  const chaosPlayers = gameData.allPlayers.filter((p) => p.team === 'CHAOS')

  const calculateTeamGold = (players: Player[]) => {
    return players.reduce((total, player) => {
      const itemGold = player.items.reduce((sum, item) => sum + item.price, 0)
      return total + itemGold
    }, 0)
  }

  const calculateTeamKDA = (players: Player[]) => {
    const totalKills = players.reduce((sum, p) => sum + p.scores.kills, 0)
    const totalDeaths = players.reduce((sum, p) => sum + p.scores.deaths, 0)
    const totalAssists = players.reduce((sum, p) => sum + p.scores.assists, 0)
    return { kills: totalKills, deaths: totalDeaths, assists: totalAssists }
  }

  const orderGold = calculateTeamGold(orderPlayers)
  const chaosGold = calculateTeamGold(chaosPlayers)
  const goldDiff = orderGold - chaosGold
  const orderKDA = calculateTeamKDA(orderPlayers)
  const chaosKDA = calculateTeamKDA(chaosPlayers)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gradient-to-br from-background via-background to-surface">
      {/* Modern Tab Bar */}
      <div className="flex items-center gap-2 px-6 py-4 bg-surface/50 backdrop-blur-sm border-b border-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-text-secondary hover:bg-elevated hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              {tab.label}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-20 blur-xl" />
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'stats' && (
          <div className="flex flex-col h-full">
            {/* Game Info Header - Modern Design */}
            <div className="relative px-6 py-6 bg-gradient-to-r from-surface/80 via-elevated/50 to-surface/80 backdrop-blur-sm border-b border-border/50">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                    <Activity className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{gameData.gameData.gameMode}</h2>
                    <p className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Oyun Süresi: {formatTime(gameData.gameData.gameTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-elevated/50 border border-border/50">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-text-secondary">Altın Farkı</p>
                      <p
                        className={`text-lg font-bold ${goldDiff > 0 ? 'text-blue-400' : goldDiff < 0 ? 'text-red-400' : 'text-white'}`}
                      >
                        {goldDiff > 0 ? '+' : ''}
                        {(goldDiff / 1000).toFixed(1)}k
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">Mavi Takım</p>
                      <p className="text-sm font-bold text-blue-400">
                        {orderKDA.kills}/{orderKDA.deaths}/{orderKDA.assists}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div>
                      <p className="text-xs text-text-secondary">Kırmızı Takım</p>
                      <p className="text-sm font-bold text-red-400">
                        {chaosKDA.kills}/{chaosKDA.deaths}/{chaosKDA.assists}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Grid - Modern Cards */}
            <div className="grid grid-cols-2 gap-6 p-6">
              {/* ORDER Team */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Trophy className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-400">MAVİ TAKIM</h3>
                    <p className="text-xs text-text-secondary">
                      {(orderGold / 1000).toFixed(1)}k altın
                    </p>
                  </div>
                </div>
                {orderPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className={`group relative p-4 rounded-xl bg-elevated/50 backdrop-blur-sm border border-border/50 hover:border-blue-500/30 transition-all duration-200 ${player.isDead ? 'opacity-50' : ''}`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${player.championName}.png`}
                          alt={player.championName}
                          className="w-12 h-12 rounded-lg border-2 border-blue-500/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-blue-500 text-[10px] font-bold text-white">
                          {player.level}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {player.summonerName}
                        </p>
                        <p className="text-xs text-text-secondary">{player.championName}</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {player.scores.kills}/{player.scores.deaths}/{player.scores.assists}
                        </span>
                        <span className="text-xs text-blue-400 font-semibold">
                          {calculateKDA(
                            player.scores.kills,
                            player.scores.deaths,
                            player.scores.assists
                          )}{' '}
                          KDA
                        </span>
                      </div>
                      <div className="w-px h-4 bg-border/30" />
                      <span className="text-xs text-text-secondary">
                        {player.scores.creepScore} CS
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CHAOS Team */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Trophy className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-400">KIRMIZI TAKIM</h3>
                    <p className="text-xs text-text-secondary">
                      {(chaosGold / 1000).toFixed(1)}k altın
                    </p>
                  </div>
                </div>
                {chaosPlayers.map((player, idx) => (
                  <div
                    key={idx}
                    className={`group relative p-4 rounded-xl bg-elevated/50 backdrop-blur-sm border border-border/50 hover:border-red-500/30 transition-all duration-200 ${player.isDead ? 'opacity-50' : ''}`}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/15.6.1/img/champion/${player.championName}.png`}
                          alt={player.championName}
                          className="w-12 h-12 rounded-lg border-2 border-red-500/20"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-red-500 text-[10px] font-bold text-white">
                          {player.level}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {player.summonerName}
                        </p>
                        <p className="text-xs text-text-secondary">{player.championName}</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {player.scores.kills}/{player.scores.deaths}/{player.scores.assists}
                        </span>
                        <span className="text-xs text-red-400 font-semibold">
                          {calculateKDA(
                            player.scores.kills,
                            player.scores.deaths,
                            player.scores.assists
                          )}{' '}
                          KDA
                        </span>
                      </div>
                      <div className="w-px h-4 bg-border/30" />
                      <span className="text-xs text-text-secondary">
                        {player.scores.creepScore} CS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gold' && <GoldTracker gameData={gameData} />}
        {activeTab === 'augments' && <AugmentTierList />}
      </div>
    </div>
  )
}
