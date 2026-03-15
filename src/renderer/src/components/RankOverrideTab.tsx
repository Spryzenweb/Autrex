import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Trophy, Loader2 } from 'lucide-react'

const getRankIcon = (tier: string) => {
  // Map tier names to emblem URLs from Community Dragon
  const tierMap: Record<string, string> = {
    IRON: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/iron.png',
    BRONZE: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/bronze.png',
    SILVER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/silver.png',
    GOLD: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/gold.png',
    PLATINUM: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/platinum.png',
    EMERALD: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/emerald.png',
    DIAMOND: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/diamond.png',
    MASTER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/master.png',
    GRANDMASTER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/grandmaster.png',
    CHALLENGER: 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/challenger.png'
  }
  
  return tierMap[tier] || `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${tier.toLowerCase()}.png`
}

export function RankOverrideTab() {
  const lcuConnected = useAtomValue(lcuConnectedAtom)
  const [soloTier, setSoloTier] = useState('CHALLENGER')
  const [soloDiv, setSoloDiv] = useState('I')
  const [loading, setLoading] = useState(false)

  const applyRank = async () => {
    if (!lcuConnected) return
    setLoading(true)
    try {
      await window.api.lcuRequest('PUT', '/lol-chat/v1/me', {
        lol: {
          rankedLeagueTier: soloTier,
          rankedLeagueDivision: soloDiv,
          rankedLeagueQueue: 'RANKED_SOLO_5x5'
        }
      })
      console.log(`Rank override applied: ${soloTier} ${soloDiv}`)
    } catch (err) {
      console.error('Rank override failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-bold text-text-primary">Rank Değiştirme</h2>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            Sohbet ve profil kartlarında görünen rank'inizi değiştirin.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Solo/Duo Sıralaması
              </label>
              <div className="flex gap-3">
                <select
                  value={soloTier}
                  onChange={(e) => setSoloTier(e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {[
                    'IRON',
                    'BRONZE',
                    'SILVER',
                    'GOLD',
                    'PLATINUM',
                    'EMERALD',
                    'DIAMOND',
                    'MASTER',
                    'GRANDMASTER',
                    'CHALLENGER'
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <select
                  value={soloDiv}
                  onChange={(e) => setSoloDiv(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {['I', 'II', 'III', 'IV'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-background rounded-lg border border-border">
              <span className="text-xs uppercase tracking-wider text-text-secondary block mb-4 text-center">
                Önizleme
              </span>
              <div className="flex flex-col items-center gap-3">
                <img
                  src={getRankIcon(soloTier)}
                  alt={soloTier}
                  className="w-24 h-24 object-contain drop-shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="text-2xl font-bold text-white">
                  {soloTier} <span className="text-primary-500">{soloDiv}</span>
                </span>
              </div>
            </div>

            <button
              className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={applyRank}
              disabled={!lcuConnected || loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              UYGULA
            </button>
          </div>
        </div>

        {!lcuConnected && (
          <p className="text-center text-red-400 text-sm mt-4">
            ⚠ Bu özelliği kullanmak için League of Legends'ı başlatın.
          </p>
        )}
      </div>
    </div>
  )
}
