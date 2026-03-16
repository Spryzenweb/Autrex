import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, ExternalLink, Users } from 'lucide-react'
import { toast } from 'sonner'

interface PlayerStats {
  name: string
  tagLine: string
  puuid: string
  currentRank: string
  peakRank: string
  wins: number
  losses: number
  winRate: number
  kda: number
  kills: number
  deaths: number
  assists: number
}

export default function ChampionSelectStatsTab() {
  const { t } = useTranslation()
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<PlayerStats[]>([])
  const [region, setRegion] = useState('')

  const loadTeamStats = async () => {
    setLoading(true)
    try {
      // Get region
      const regionResp = await window.api.lcuRequest('GET', '/riotclient/region-locale')
      const regionData = regionResp as any
      const regionStr = regionData?.region || 'EUW1'
      setRegion(regionStr.toLowerCase())

      // Get champ select session
      const session = await window.api.lcuRequest('GET', '/lol-champ-select/v1/session')
      if (!session || !(session as any).myTeam) {
        toast.error('Şampiyon seçimi aktif değil')
        return
      }

      const myTeam = (session as any).myTeam
      const playerStatsArray: PlayerStats[] = []

      for (const player of myTeam) {
        try {
          const stats = await getPlayerStats(player.puuid)
          playerStatsArray.push(stats)
        } catch (err) {
          console.error(`Failed to load stats for ${player.puuid}:`, err)
        }
      }

      setPlayers(playerStatsArray)
      toast.success(t('championSelectStats.playersLoaded', { count: playerStatsArray.length }))
    } catch (error) {
      console.error('Failed to load team stats:', error)
      toast.error(t('championSelectStats.teamInfoLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getPlayerStats = async (puuid: string): Promise<PlayerStats> => {
    // Get summoner info
    const summonerResp = await window.api.lcuRequest(
      'GET',
      `/lol-summoner/v2/summoners/puuid/${puuid}`
    )
    const summoner = summonerResp as any

    // Get ranked stats
    const rankedResp = await window.api.lcuRequest('GET', `/lol-ranked/v1/ranked-stats/${puuid}`)
    const ranked = rankedResp as any

    // Get match history
    const matchHistoryResp = await window.api.lcuRequest(
      'GET',
      `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=40`
    )
    const matchHistory = matchHistoryResp as any

    // Calculate stats from match history
    const games = matchHistory?.games?.games || []
    let wins = 0
    let losses = 0
    let totalKills = 0
    let totalDeaths = 0
    let totalAssists = 0

    for (const game of games) {
      if (game.mapId === 11 && game.gameType === 'MATCHED_GAME' && game.queueId === 420) {
        const participant = game.participants?.[0]
        if (participant?.stats) {
          if (participant.stats.win) wins++
          else losses++

          totalKills += participant.stats.kills || 0
          totalDeaths += participant.stats.deaths || 0
          totalAssists += participant.stats.assists || 0
        }
      }
    }

    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0
    const kda =
      totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists

    // Get solo queue rank
    const soloQueue = ranked?.queueMap?.RANKED_SOLO_5x5
    const currentRank = buildRankString(soloQueue, false)
    const peakRank = buildRankString(soloQueue, true)

    return {
      name: summoner.gameName || 'Unknown',
      tagLine: summoner.tagLine || '',
      puuid,
      currentRank,
      peakRank,
      wins,
      losses,
      winRate,
      kda,
      kills: totalKills,
      deaths: totalDeaths,
      assists: totalAssists
    }
  }

  const buildRankString = (queue: any, highest: boolean): string => {
    if (!queue) return 'Unranked'

    const tierKey = highest ? 'highestTier' : 'tier'
    const divKey = highest ? 'highestDivision' : 'division'

    const tier = queue[tierKey] || ''
    const div = queue[divKey] || ''

    if (!tier || tier === 'NA') return 'Unranked'
    if (!div || div === 'NA') return tier

    return `${tier} ${div}`
  }

  const parseRegion = (reg: string): string => {
    const regionMap: Record<string, string> = {
      euw1: 'euw',
      na1: 'na',
      kr: 'kr',
      oc1: 'oce',
      eun1: 'eune',
      la1: 'lan',
      la2: 'las',
      ru: 'ru',
      tr1: 'tr',
      jp1: 'jp',
      br1: 'br'
    }
    return regionMap[reg.toLowerCase()] || reg.toLowerCase()
  }

  const openOpGg = (player: PlayerStats) => {
    const reg = parseRegion(region)
    const url = `https://www.op.gg/summoners/${reg}/${player.name}-${player.tagLine}`
    window.open(url, '_blank')
  }

  const openLeagueOfGraphs = (player: PlayerStats) => {
    const reg = parseRegion(region)
    const url = `https://www.leagueofgraphs.com/summoner/${reg}/${player.name}-${player.tagLine}`
    window.open(url, '_blank')
  }

  const openMultiOpGg = () => {
    const reg = parseRegion(region)
    const names = players.map((p) => `${p.name}%23${p.tagLine}`).join(',')
    const url = `https://www.op.gg/multisearch/${reg}?summoners=${names}`
    window.open(url, '_blank')
  }

  const openPorofessor = () => {
    const reg = parseRegion(region)
    const names = players.map((p) => `${p.name} -${p.tagLine}`).join(',')
    const url = `https://porofessor.gg/pregame/${reg}/${names}`
    window.open(url, '_blank')
  }

  const dodgeQueue = async () => {
    try {
      await window.api.lcuRequest(
        'POST',
        '/lol-login/v1/session/invoke?destination=lcdsServiceProxy&method=call&args=["","teambuilder-draft","quitV2",""]'
      )
      toast.success('Kuyruktan çıkıldı')
    } catch (error) {
      toast.error('Kuyruktan çıkılamadı')
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">LCU bağlantısı bekleniyor...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Şampiyon Seçimi İstatistikleri
            </h2>
            <p className="text-sm text-gray-400">Takım arkadaşlarının istatistiklerini görüntüle</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadTeamStats}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              Takım Bilgilerini Yükle
            </button>
            {players.length > 0 && (
              <>
                <button
                  onClick={openMultiOpGg}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Multi OP.GG
                </button>
                <button
                  onClick={openPorofessor}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Porofessor
                </button>
                <button
                  onClick={dodgeQueue}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Dodge
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Players Table */}
      {players.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left p-3">Oyuncu</th>
                  <th className="text-left p-3">Mevcut Rank</th>
                  <th className="text-left p-3">En Yüksek Rank</th>
                  <th className="text-left p-3">W/L</th>
                  <th className="text-left p-3">Win Rate</th>
                  <th className="text-left p-3">KDA</th>
                  <th className="text-left p-3">Linkler</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">
                          {player.name}#{player.tagLine}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs">
                        {player.currentRank}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs">
                        {player.peakRank}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono">
                        {player.wins}W / {player.losses}L
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-mono ${player.winRate >= 0.5 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {(player.winRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono">{player.kda.toFixed(2)}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({player.kills}/{player.deaths}/{player.assists})
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOpGg(player)}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          OP.GG
                        </button>
                        <button
                          onClick={() => openLeagueOfGraphs(player)}
                          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          LoG
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {players.length === 0 && !loading && (
        <div className="bg-[#1a1a1a] rounded-lg p-8 border border-gray-700 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            Şampiyon seçiminde takım arkadaşlarının bilgilerini görmek için yukarıdaki butona
            tıklayın
          </p>
        </div>
      )}
    </div>
  )
}
