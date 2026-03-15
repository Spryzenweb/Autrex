import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, ShoppingCart, Check, X, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { ModernCard } from './ModernCard'
import { ModernButton } from './ModernButton'

interface Champion {
  id: number
  name: string
  alias: string
  squarePortraitPath: string
  owned: boolean
  freeToPlay: boolean
  price: number
}

export default function ChampionBuyerTab() {
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [champions, setChampions] = useState<Champion[]>([])
  const [selectedChampions, setSelectedChampions] = useState<Set<number>>(new Set())
  const [buyLog, setBuyLog] = useState<string[]>([])
  const [currentlyBuying, setCurrentlyBuying] = useState('')

  useEffect(() => {
    if (isConnected) {
      loadChampions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected])

  const loadChampions = async () => {
    setLoading(true)
    try {
      console.log('[ChampionBuyer] ===== STARTING CHAMPION LOAD =====')
      
      // Get all champions with ownership info
      const inventoryResponse = await window.api.lcuRequest(
        'GET',
        '/lol-champions/v1/inventories/local-player/champions'
      )

      console.log('[ChampionBuyer] Inventory response type:', typeof inventoryResponse)
      console.log('[ChampionBuyer] Inventory is array:', Array.isArray(inventoryResponse))

      // Convert inventory to array
      let championsArray: any[] = []
      if (Array.isArray(inventoryResponse)) {
        championsArray = inventoryResponse
      } else if (inventoryResponse && typeof inventoryResponse === 'object') {
        championsArray = Object.values(inventoryResponse)
      }

      console.log('[ChampionBuyer] Total champions:', championsArray.length)

      if (championsArray.length === 0) {
        addLog('Hata: Şampiyon listesi alınamadı')
        toast.error('Şampiyon listesi alınamadı')
        return
      }

      // Show first 3 champions with ALL fields
      console.log('[ChampionBuyer] ===== FIRST 3 CHAMPIONS (ALL FIELDS) =====')
      championsArray.slice(0, 3).forEach((champ, idx) => {
        console.log(`[${idx}] Champion:`, champ)
        console.log(`  - id: ${champ.id}`)
        console.log(`  - name: ${champ.name}`)
        console.log(`  - alias: ${champ.alias}`)
        console.log(`  - ownership.owned: ${champ.ownership?.owned}`)
      })

      // Try different ownership checks
      const buyable = championsArray
        .filter((champ: any) => {
          // Skip the "None" champion (id: -1)
          if (champ.id === -1) return false
          
          // Try multiple ways to check ownership
          const owned1 = champ.ownership?.owned === true
          const owned2 = champ.owned === true
          const owned3 = champ.purchased > 0
          
          const isOwned = owned1 || owned2 || owned3
          const shouldInclude = !isOwned
          
          if (shouldInclude) {
            console.log(`[ChampionBuyer] ✓ BUYABLE: ${champ.id} - ${champ.name}`)
            console.log(`  ownership.owned: ${champ.ownership?.owned}`)
            console.log(`  owned: ${champ.owned}`)
            console.log(`  purchased: ${champ.purchased}`)
            console.log(`  freeToPlay: ${champ.freeToPlay}`)
          }
          
          return shouldInclude
        })
        .map((champ: any) => {
          // Get the champion name - try different fields
          const championName = champ.name || champ.alias || `Champion ${champ.id}`
          
          return {
            id: champ.id,
            name: championName,
            alias: champ.alias || '',
            squarePortraitPath: champ.squarePortraitPath || `/lol-game-data/assets/v1/champion-icons/${champ.id}.png`,
            owned: false,
            freeToPlay: champ.freeToPlay || false,
            price: 4800
          }
        })

      console.log('[ChampionBuyer] ===== FINAL RESULT =====')
      console.log('[ChampionBuyer] Buyable champions:', buyable.length)
      if (buyable.length > 0) {
        console.log('[ChampionBuyer] First 10:', buyable.slice(0, 10).map(c => `${c.id}:${c.name}`))
      }

      setChampions(buyable)
      addLog(`${buyable.length} satın alınabilir şampiyon bulundu`)
      
      if (buyable.length === 0) {
        toast.info('Tüm şampiyonlara sahipsiniz!')
      } else {
        toast.success(`${buyable.length} şampiyon listelendi`)
      }
    } catch (error) {
      console.error('[ChampionBuyer] ERROR:', error)
      addLog(`Hata: ${error instanceof Error ? error.message : String(error)}`)
      toast.error('Şampiyonlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const addLog = (message: string) => {
    setBuyLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const toggleChampion = (id: number) => {
    const newSet = new Set(selectedChampions)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedChampions(newSet)
  }

  const buySelectedChampions = async () => {
    if (selectedChampions.size === 0) {
      toast.warning('Lütfen satın alınacak şampiyonları seçin')
      return
    }

    setLoading(true)
    addLog(`${selectedChampions.size} şampiyon satın alınmaya başlanıyor...`)

    let successCount = 0
    let failCount = 0

    for (const championId of Array.from(selectedChampions)) {
      const champion = champions.find((c) => c.id === championId)
      if (!champion) continue

      setCurrentlyBuying(champion.name)
      addLog(`${champion.name} satın alınıyor...`)

      try {
        // Use the correct purchase endpoint
        const purchaseResponse = await window.api.lcuRequest(
          'POST',
          '/lol-store/v1/purchases',
          {
            items: [
              {
                inventoryType: 'CHAMPION',
                itemId: championId
              }
            ],
            currencyType: 'IP'
          }
        )

        console.log(`[ChampionBuyer] Purchase response for ${champion.name}:`, purchaseResponse)

        addLog(`✓ ${champion.name} başarıyla satın alındı!`)
        successCount++

        // Remove from selected
        setSelectedChampions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(championId)
          return newSet
        })
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || 'Bilinmeyen hata'
        console.error(`[ChampionBuyer] Failed to buy ${champion.name}:`, error)
        addLog(`✗ ${champion.name} satın alınamadı: ${errorMsg}`)
        failCount++
      }

      // Wait between purchases
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentlyBuying('')
    addLog(`Satın alma tamamlandı! Başarılı: ${successCount}, Başarısız: ${failCount}`)

    if (successCount > 0) {
      toast.success(`${successCount} şampiyon satın alındı`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} şampiyon satın alınamadı`)
    }

    // Reload champions list
    await loadChampions()
    setLoading(false)
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full relative">
        <div className="absolute inset-0 gradient-animated opacity-5" />
        <ModernCard variant="glow" className="p-8 text-center relative z-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-text-secondary">LCU bağlantısı bekleniyor...</p>
        </ModernCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-animated opacity-5" />
      
      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          Şampiyon Satın Al
        </h1>
        <p className="text-text-secondary">BE ile şampiyonları toplu satın alın</p>
      </div>

      {/* Control Panel */}
      <ModernCard variant="glass" className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <ModernButton
            variant="neon"
            size="lg"
            onClick={buySelectedChampions}
            disabled={loading || selectedChampions.size === 0}
            loading={loading}
            className="flex items-center gap-3"
          >
            <ShoppingCart className="w-5 h-5" />
            Seçili Şampiyonları Satın Al ({selectedChampions.size})
          </ModernButton>
          
          {currentlyBuying && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-strong">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              <p className="text-yellow-400 font-medium">Satın alınıyor: {currentlyBuying}</p>
            </div>
          )}
        </div>
      </ModernCard>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        {/* Buy Log */}
        <ModernCard variant="glass" className="col-span-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-cyber">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Satın Alma Logu</h3>
          </div>
          
          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            {buyLog.length === 0 ? (
              <p className="text-text-secondary text-center py-8">Henüz işlem yapılmadı</p>
            ) : (
              buyLog.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-sm ${
                    log.includes('✓') 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : log.includes('✗')
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </ModernCard>

        {/* Champions Grid */}
        <ModernCard variant="glass" className="col-span-2 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg gradient-gaming">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Satın Alınabilir Şampiyonlar ({champions.length})
            </h3>
          </div>
          
          {champions.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-gray-500/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-text-secondary">Satın alınabilir şampiyon bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar">
              {champions.map((champion) => (
                <div
                  key={champion.id}
                  onClick={() => toggleChampion(champion.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                    selectedChampions.has(champion.id)
                      ? 'border-green-500 bg-green-500/10 glow-primary'
                      : 'glass border-white/20 hover:glass-strong hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={champion.squarePortraitPath.startsWith('http') 
                          ? champion.squarePortraitPath 
                          : `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default${champion.squarePortraitPath}`
                        }
                        alt={champion.name}
                        className="w-12 h-12 rounded-lg"
                        onError={(e) => {
                          // Fallback to Community Dragon direct URL
                          const target = e.currentTarget
                          if (!target.src.includes('champion-icons')) {
                            target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion.id}.png`
                          } else {
                            target.style.display = 'none'
                          }
                        }}
                      />
                      {selectedChampions.has(champion.id) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{champion.name}</p>
                      <p className="text-xs text-blue-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {champion.price} BE
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCard>
      </div>
    </div>
  )
}
