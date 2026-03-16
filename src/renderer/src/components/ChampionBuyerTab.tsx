import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, ShoppingCart, X, Coins, RefreshCw, CheckSquare, Square } from 'lucide-react'
import { toast } from 'sonner'
import { ModernCard } from './ModernCard'
import { ModernButton } from './ModernButton'

interface Champion {
  id: number
  name: string
  alias: string
  squarePortraitPath: string
  price: number
  owned: boolean
}

export default function ChampionBuyerTab() {
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [buying, setBuying] = useState(false)
  const [champions, setChampions] = useState<Champion[]>([])
  const [selectedChampions, setSelectedChampions] = useState<Set<number>>(new Set())
  const [buyLog, setBuyLog] = useState<string[]>([])
  const [currentlyBuying, setCurrentlyBuying] = useState('')
  const [blueEssence, setBlueEssence] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isConnected) {
      loadChampions()
    }
  }, [isConnected])

  const addLog = (message: string) => {
    setBuyLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const loadChampions = async () => {
    setLoading(true)
    addLog('Şampiyonlar yükleniyor...')
    try {
      // 1) Tüm şampiyonları çek (summary)
      const allChamps = await window.api.lcuRequest(
        'GET',
        '/lol-game-data/assets/v1/champion-summary.json'
      )

      // 2) Sahip olunan şampiyonları çek
      const ownedChamps = await window.api.lcuRequest(
        'GET',
        '/lol-champions/v1/owned-champions-minimal'
      )

      if (!Array.isArray(allChamps) || allChamps.length === 0) {
        addLog('Hata: Şampiyon listesi alınamadı')
        toast.error('Şampiyon listesi alınamadı')
        return
      }

      // Sahip olunan ID'leri set'e al
      const ownedIds = new Set<number>()
      if (Array.isArray(ownedChamps)) {
        ownedChamps.forEach((c: any) => {
          if (c.id && c.id !== -1) ownedIds.add(c.id)
        })
      }

      // 3) BE bakiyesini çek
      try {
        const wallet = await window.api.lcuRequest('GET', '/lol-store/v1/wallet')
        if (wallet?.ip !== undefined) setBlueEssence(wallet.ip)
        else if (wallet?.['lol_blue_essence'] !== undefined) setBlueEssence(wallet['lol_blue_essence'])
      } catch {
        // Wallet alınamazsa loot'tan dene
        try {
          const loot = await window.api.lcuRequest('GET', '/lol-loot/v1/player-loot')
          if (Array.isArray(loot)) {
            const be = loot.find((i: any) => i.lootId === 'CURRENCY_champion')
            if (be) setBlueEssence(be.count)
          }
        } catch { /* BE gösterilemedi */ }
      }

      // 4) Satın alınabilir şampiyonları filtrele
      const buyable: Champion[] = allChamps
        .filter((c: any) => {
          if (!c.id || c.id === -1) return false
          return !ownedIds.has(c.id)
        })
        .map((c: any) => ({
          id: c.id,
          name: c.name || `Champion ${c.id}`,
          alias: c.alias || '',
          squarePortraitPath: c.squarePortraitPath || '',
          price: 4800, // Varsayılan fiyat
          owned: false
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

      setChampions(buyable)

      if (buyable.length === 0) {
        addLog('Tüm şampiyonlara sahipsiniz!')
        toast.info('Tüm şampiyonlara sahipsiniz!')
      } else {
        addLog(`${buyable.length} satın alınabilir şampiyon bulundu`)
        toast.success(`${buyable.length} şampiyon listelendi`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`Hata: ${msg}`)
      toast.error('Şampiyonlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const toggleChampion = (id: number) => {
    setSelectedChampions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    const filtered = getFiltered()
    setSelectedChampions(new Set(filtered.map((c) => c.id)))
  }

  const clearSelection = () => setSelectedChampions(new Set())

  const buySelectedChampions = async () => {
    if (selectedChampions.size === 0) {
      toast.warning('Lütfen şampiyon seçin')
      return
    }

    setBuying(true)
    addLog(`${selectedChampions.size} şampiyon satın alınıyor...`)

    let successCount = 0
    let failCount = 0

    for (const championId of Array.from(selectedChampions)) {
      const champion = champions.find((c) => c.id === championId)
      if (!champion) continue

      setCurrentlyBuying(champion.name)
      addLog(`${champion.name} satın alınıyor...`)

      try {
        // Doğru LCU satın alma endpoint'i
        await window.api.lcuRequest('POST', '/lol-purchase-widget/v1/purchaseItems', {
          items: [
            {
              inventoryType: 'CHAMPION',
              itemId: championId,
              ipCost: champion.price,
              rpCost: 0
            }
          ]
        })

        addLog(`✓ ${champion.name} başarıyla satın alındı!`)
        successCount++
        setSelectedChampions((prev) => {
          const next = new Set(prev)
          next.delete(championId)
          return next
        })
      } catch (error: any) {
        // Fallback: eski endpoint dene
        try {
          await window.api.lcuRequest('POST', '/lol-store/v1/purchases', {
            items: [{ inventoryType: 'CHAMPION', itemId: championId }],
            currencyType: 'IP'
          })
          addLog(`✓ ${champion.name} başarıyla satın alındı!`)
          successCount++
          setSelectedChampions((prev) => {
            const next = new Set(prev)
            next.delete(championId)
            return next
          })
        } catch (fallbackError: any) {
          const msg = fallbackError?.message || 'Bilinmeyen hata'
          addLog(`✗ ${champion.name} satın alınamadı: ${msg}`)
          failCount++
        }
      }

      await new Promise((r) => setTimeout(r, 600))
    }

    setCurrentlyBuying('')
    addLog(`Tamamlandı — Başarılı: ${successCount}, Başarısız: ${failCount}`)

    if (successCount > 0) {
      toast.success(`${successCount} şampiyon satın alındı`)
      await loadChampions()
    }
    if (failCount > 0) {
      toast.error(`${failCount} şampiyon satın alınamadı`)
    }

    setBuying(false)
  }

  const getFiltered = () => {
    if (!searchQuery.trim()) return champions
    return champions.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const getImageUrl = (champ: Champion) => {
    if (champ.squarePortraitPath?.startsWith('/lol-game-data')) {
      // LCU local path — DDragon'dan çek
      if (champ.alias) {
        return `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ.alias}.png`
      }
    }
    if (champ.squarePortraitPath?.startsWith('http')) return champ.squarePortraitPath
    if (champ.alias) {
      return `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${champ.alias}.png`
    }
    return `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/Lux.png`
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <ModernCard variant="glow" className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
          <p className="text-text-secondary">LCU bağlantısı bekleniyor...</p>
        </ModernCard>
      </div>
    )
  }

  const filtered = getFiltered()

  return (
    <div className="p-6 space-y-6 relative">
      <div className="absolute inset-0 gradient-animated opacity-5" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
            Şampiyon Satın Al
          </h1>
          <p className="text-text-secondary text-sm">
            BE ile sahip olmadığın şampiyonları toplu satın al
            {blueEssence !== null && (
              <span className="ml-2 text-yellow-400 font-semibold">
                💰 {blueEssence.toLocaleString()} BE
              </span>
            )}
          </p>
        </div>
        <ModernButton
          variant="ghost"
          size="sm"
          onClick={loadChampions}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </ModernButton>
      </div>

      {/* Control Panel */}
      <ModernCard variant="glass" className="p-4 relative z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <ModernButton
            variant="neon"
            size="lg"
            onClick={buySelectedChampions}
            disabled={buying || loading || selectedChampions.size === 0}
            loading={buying}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Satın Al ({selectedChampions.size})
          </ModernButton>

          <ModernButton
            variant="ghost"
            size="sm"
            onClick={selectAll}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Tümünü Seç ({filtered.length})
          </ModernButton>

          <ModernButton
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={selectedChampions.size === 0}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Seçimi Temizle
          </ModernButton>

          {currentlyBuying && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-strong ml-auto">
              <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">{currentlyBuying}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Şampiyon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-text-secondary text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </ModernCard>

      <div className="grid grid-cols-3 gap-6 relative z-10">
        {/* Log */}
        <ModernCard variant="glass" className="col-span-1 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg gradient-cyber">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm">İşlem Logu</h3>
          </div>
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto custom-scrollbar">
            {buyLog.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">Henüz işlem yok</p>
            ) : (
              [...buyLog].reverse().map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-xs ${
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
        <ModernCard variant="glass" className="col-span-2 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg gradient-gaming">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm">
              Satın Alınabilir ({filtered.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <X className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-text-secondary text-sm">
                {champions.length === 0
                  ? 'Tüm şampiyonlara sahipsiniz veya liste yüklenemedi'
                  : 'Arama sonucu bulunamadı'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto custom-scrollbar pr-1">
              {filtered.map((champion) => {
                const isSelected = selectedChampions.has(champion.id)
                return (
                  <div
                    key={champion.id}
                    onClick={() => toggleChampion(champion.id)}
                    className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all hover-lift select-none ${
                      isSelected
                        ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                        : 'glass border-white/10 hover:glass-strong hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(champion)}
                          alt={champion.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.src = `https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/Lux.png`
                          }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-green-400' : 'text-white'}`}>
                          {champion.name}
                        </p>
                        <p className="text-xs text-yellow-400/80 flex items-center gap-0.5">
                          <Coins className="w-3 h-3" />
                          {champion.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ModernCard>
      </div>
    </div>
  )
}