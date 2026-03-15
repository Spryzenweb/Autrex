import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ReportablePlayer {
  riotId: string
  summonerId: string
  puuid: string
  gameId: number
  championId: number
  championName: string
  kills: number
  deaths: number
  assists: number
  reported: boolean
  selected: boolean
}

// Champion ID to name mapping (common champions)
const CHAMPION_NAMES: Record<number, string> = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'Twisted Fate', 5: 'Xin Zhao',
  6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
  11: 'Master Yi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
  16: 'Soraka', 17: 'Teemo', 18: 'Ashe', 19: 'Garen', 20: 'Evelynn',
  21: 'Twisted Fate', 22: 'Ashe', 23: 'Anivia', 24: 'Jax', 25: 'Morgana',
  26: 'Zilean', 27: 'Singed', 28: 'Kog\'Maw', 29: 'Kassadin', 30: 'Twitch',
  31: 'Cho\'Gath', 32: 'Amumu', 33: 'Rammus', 34: 'Evelynn', 35: 'Shaco',
  36: 'Dr. Mundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
  41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
  48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank', 54: 'Malphite',
  55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton', 59: 'Jarvan IV',
  60: 'Elise', 61: 'Orianna', 62: 'Wukong', 63: 'Brand', 64: 'Lee Sin',
  67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger',
  75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
  80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
  85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Talon', 91: 'Talon',
  92: 'Riven', 96: 'Kog\'Maw', 98: 'Shen', 99: 'Lux', 101: 'Xerath',
  102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz', 106: 'Volibear',
  107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor', 113: 'Sejuani',
  114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven', 120: 'Hecarim',
  121: 'Kha\'Zix', 122: 'Darius', 123: 'Gnar', 126: 'Jayce', 127: 'Lissandra',
  131: 'Diana', 133: 'Quinn', 134: 'Syndra', 136: 'Aurelion Sol', 141: 'Kayn',
  142: 'Zoe', 143: 'Zyra', 145: 'Kai\'Sa', 147: 'Seraphine', 150: 'Gnar',
  154: 'Zac', 157: 'Yasuo', 161: 'Vel\'Koz', 163: 'Taliyah', 164: 'Camille',
  166: 'Yuumi', 167: 'Akshan', 168: 'Hwei', 201: 'Braum', 202: 'Jhin',
  203: 'Kindred', 204: 'Sett', 205: 'Ekko', 206: 'Rek\'Sai', 207: 'Kled',
  208: 'Kalista', 209: 'Tahm Kench', 212: 'Evelynn', 213: 'Graves', 214: 'Fiora',
  215: 'Sylas', 216: 'Hwei', 217: 'Rakan', 218: 'Xayah', 222: 'Jinx',
  223: 'Tahm Kench', 224: 'Tyrant Swain', 225: 'Ekko', 226: 'Illaoi',
  231: 'Ryze', 232: 'Zed', 233: 'Kha\'Zix', 234: 'Veigar', 235: 'Sion',
  236: 'Lucian', 238: 'Zed', 240: 'Kled', 241: 'Kalista', 242: 'Corki',
  243: 'Gnar', 244: 'Rell', 245: 'Ekko', 246: 'Qiyana', 247: 'Evelynn',
  248: 'Seraphine', 249: 'Yone', 250: 'Yuumi', 251: 'Sett', 252: 'Akshan',
  253: 'Nasus', 254: 'Lamb', 266: 'Aatrox', 267: 'Nami', 268: 'Azir',
  412: 'Thresh', 420: 'Illaoi', 421: 'Rek\'Sai', 427: 'Ivern', 429: 'Kalista',
  432: 'Bard', 497: 'Rakan', 498: 'Xayah', 516: 'Ornn', 517: 'Sylas',
  518: 'Neeko', 523: 'Aphelios', 526: 'Rell', 555: 'Pyke', 711: 'Vex',
  777: 'Yone', 875: 'Sett', 876: 'Lillia', 887: 'Gwen', 888: 'Renata Glasc',
  895: 'Nilah', 897: 'K\'Sante', 902: 'Milio', 910: 'Hwei', 950: 'Naafiri'
}

export default function ReportToolTab() {
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<ReportablePlayer[]>([])
  const [status, setStatus] = useState('Oyuncular yüklenmeye hazır')

  const getChampionName = (championId: number, fallback: string): string => {
    return CHAMPION_NAMES[championId] || fallback || 'Bilinmiyor'
  }

  const loadReportablePlayers = async () => {
    setLoading(true)
    setStatus('Maç geçmişi yükleniyor...')

    try {
      // Get current summoner first
      const currentSummoner = await window.api.lcuGetCurrentSummoner()
      if (!currentSummoner.success || !currentSummoner.summoner) {
        setStatus('Summoner bilgisi alınamadı')
        toast.error('Summoner bilgisi alınamadı')
        return
      }

      const currentPuuid = currentSummoner.summoner.puuid

      // Get match history using the correct modern endpoint
      const matchHistoryResponse = await window.api.lcuRequest(
        'GET',
        `/lol-match-history/v1/products/lol/${currentPuuid}/matches?begIndex=0&endIndex=20`
      )

      console.log('[ReportTool] Match history response:', matchHistoryResponse)

      // Handle different response formats
      let games: any[] = []
      if (matchHistoryResponse && Array.isArray(matchHistoryResponse)) {
        games = matchHistoryResponse
      } else if (matchHistoryResponse?.games && Array.isArray(matchHistoryResponse.games)) {
        games = matchHistoryResponse.games
      } else if (matchHistoryResponse?.games?.games && Array.isArray(matchHistoryResponse.games.games)) {
        games = matchHistoryResponse.games.games
      }

      if (!games || games.length === 0) {
        setStatus('Maç geçmişi bulunamadı')
        toast.warning('Maç geçmişi bulunamadı')
        return
      }

      const reportable: ReportablePlayer[] = []

      // Take only last 20 games
      const recentGames = games.slice(0, 20)

      for (const game of recentGames) {
        try {
          const gameId = game.gameId || game.id

          // Get detailed game info for participants
          const gameDetailsResponse = await window.api.lcuRequest(
            'GET',
            `/lol-match-history/v1/games/${gameId}`
          )

          console.log(`[ReportTool] Game ${gameId} details:`, gameDetailsResponse)

          if (!gameDetailsResponse) {
            console.warn(`[ReportTool] No details for game ${gameId}`)
            continue
          }

          const participants = gameDetailsResponse.participants || []
          const participantIdentities = gameDetailsResponse.participantIdentities || []

          console.log(`[ReportTool] Game ${gameId} - participants: ${participants.length}, identities: ${participantIdentities.length}`)

          // Try participantIdentities first (most reliable)
          if (participantIdentities.length > 0) {
            for (const identity of participantIdentities) {
              const player = identity.player

              // Skip current player
              if (player.puuid === currentPuuid) continue

              // Find participant stats
              const stats = participants.find(
                (p: any) => p.participantId === identity.participantId
              )

              if (stats) {
                const gameName = player.gameName || player.summonerName || 'Bilinmiyor'
                const tagLine = player.tagLine || ''
                const riotId = tagLine ? `${gameName}#${tagLine}` : gameName
                const championName = getChampionName(stats.championId, stats.championName)

                console.log(`[ReportTool] Adding player: ${riotId}, champion: ${championName}`)

                reportable.push({
                  riotId: riotId,
                  summonerId: player.summonerId?.toString() || player.accountId?.toString() || '',
                  puuid: player.puuid || '',
                  gameId: gameId,
                  championId: stats.championId || 0,
                  championName: championName,
                  kills: stats.stats?.kills || 0,
                  deaths: stats.stats?.deaths || 0,
                  assists: stats.stats?.assists || 0,
                  reported: false,
                  selected: false
                })
              }
            }
          } else if (participants.length > 0) {
            // Fallback: try to use participant data directly
            for (const participant of participants) {
              // Skip current player
              if (participant.puuid === currentPuuid) continue

              const gameName = participant.gameName || participant.summonerName || 'Bilinmiyor'
              const tagLine = participant.tagLine || ''
              const riotId = tagLine ? `${gameName}#${tagLine}` : gameName
              const championName = getChampionName(participant.championId, participant.championName)

              console.log(`[ReportTool] Adding participant (fallback): ${riotId}, champion: ${championName}`)

              reportable.push({
                riotId: riotId,
                summonerId: participant.summonerId?.toString() || '',
                puuid: participant.puuid || '',
                gameId: gameId,
                championId: participant.championId || 0,
                championName: championName,
                kills: participant.stats?.kills || 0,
                deaths: participant.stats?.deaths || 0,
                assists: participant.stats?.assists || 0,
                reported: false,
                selected: false
              })
            }
          }
        } catch (gameError) {
          console.error(`[ReportTool] Oyun ${game.gameId} detayları alınamadı:`, gameError)
          // Continue with next game
        }

        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setPlayers(reportable)
      setStatus(`${reportable.length} raporlanabilir oyuncu bulundu (son ${recentGames.length} maç)`)
      toast.success(`${reportable.length} oyuncu listelendi`)
    } catch (error) {
      console.error('[ReportTool] Oyuncular yüklenemedi:', error)
      setStatus(`Hata: ${error instanceof Error ? error.message : String(error)}`)
      toast.error('Oyuncular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    const allSelected = players.every((p) => p.selected)
    setPlayers(players.map((p) => ({ ...p, selected: !allSelected })))
  }

  const togglePlayer = (index: number) => {
    setPlayers(players.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p)))
  }

  const reportSelected = async () => {
    setLoading(true)
    const selected = players.filter((p) => p.selected && !p.reported)
    setStatus(`${selected.length} oyuncu raporlanıyor...`)

    let successCount = 0
    for (const player of selected) {
      try {
        // Use the correct endpoint for reporting
        const reportPayload = {
          gameId: parseInt(player.gameId.toString()),
          categories: ['NEGATIVE_ATTITUDE', 'VERBAL_ABUSE', 'HATE_SPEECH'],
          offenderSummonerId: parseInt(player.summonerId),
          offenderPuuid: player.puuid
        }

        console.log('[ReportTool] Sending report:', reportPayload)

        await window.api.lcuRequest(
          'POST',
          '/lol-player-report-sender/v1/match-history-reports',
          reportPayload
        )

        setPlayers((prev) =>
          prev.map((p) =>
            p.summonerId === player.summonerId && p.gameId === player.gameId
              ? { ...p, reported: true, selected: false }
              : p
          )
        )
        successCount++
      } catch (error) {
        console.error(`${player.riotId} raporlanamadı:`, error)
        toast.error(`${player.riotId} raporlanamadı`)
      }

      // Wait between reports to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setStatus(`${successCount}/${selected.length} oyuncu raporlandı`)
    toast.success(`${successCount} oyuncu başarıyla raporlandı`)
    setLoading(false)
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
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Raporlama Aracı</h2>
            <p className="text-sm text-gray-400">Raporlanabilir oyuncuları getir ve raporla</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadReportablePlayers}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              Oyuncuları Getir
            </button>
            <button
              onClick={toggleSelectAll}
              disabled={players.length === 0}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 rounded-lg"
            >
              Tümünü Seç
            </button>
            <button
              onClick={reportSelected}
              disabled={loading || !players.some((p) => p.selected)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg"
            >
              Seçilenleri Raporla
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <p className="text-sm mb-4">{status}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left p-3">Seç</th>
                <th className="text-left p-3">Oyuncu</th>
                <th className="text-left p-3">Şampiyon</th>
                <th className="text-left p-3">KDA</th>
                <th className="text-left p-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr
                  key={`${player.summonerId}-${player.gameId}`}
                  className="border-b border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={player.selected}
                      onChange={() => togglePlayer(index)}
                      disabled={player.reported}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{player.riotId}</p>
                      <p className="text-xs text-gray-500">Oyun #{player.gameId}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${player.championId}.png`}
                        alt={player.championName}
                        className="w-10 h-10 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span>{player.championName}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono">
                      {player.kills}/{player.deaths}/{player.assists}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${player.reported ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {player.reported ? '✓ Raporlandı' : 'Bekliyor'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
