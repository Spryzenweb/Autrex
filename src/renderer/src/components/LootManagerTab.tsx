import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { lcuConnectedAtom } from '../store/atoms/lcu.atoms'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface LootItem {
  lootId: string
  lootName: string
  displayCategories: string
  count: number
  disenchantValue: number
  itemDesc: string
  localizedName: string
  localizedDescription: string
  itemStatus: string
  type: string
}

export default function LootManagerTab() {
  const { t } = useTranslation()
  const isConnected = useAtomValue(lcuConnectedAtom)
  const [loading, setLoading] = useState(false)
  const [championLoot, setChampionLoot] = useState<LootItem[]>([])
  const [skinLoot, setSkinLoot] = useState<LootItem[]>([])
  const [selectedChampions, setSelectedChampions] = useState<Set<string>>(new Set())
  const [selectedSkins, setSelectedSkins] = useState<Set<string>>(new Set())
  const [blueEssence, setBlueEssence] = useState(0)
  const [orangeEssence, setOrangeEssence] = useState(0)

  useEffect(() => {
    if (isConnected) {
      loadLoot()
    }
  }, [isConnected])

  useEffect(() => {
    calculateEssence()
  }, [selectedChampions, selectedSkins, championLoot, skinLoot])

  const loadLoot = async () => {
    setLoading(true)
    try {
      const response = await window.api.lcuRequest('GET', '/lol-loot/v1/player-loot')
      if (response) {
        const champLoot = response.filter(
          (item: LootItem) => item.displayCategories === 'CHAMPION' && item.disenchantValue > 0
        )
        const skLoot = response.filter(
          (item: LootItem) => item.displayCategories === 'SKIN' && item.disenchantValue > 0
        )
        setChampionLoot(champLoot)
        setSkinLoot(skLoot)
        toast.success(t('lootManager.championsLoaded', { championCount: champLoot.length, skinCount: skLoot.length }))
      }
    } catch (error) {
      console.error('Loot yüklenemedi:', error)
      toast.error(t('lootManager.lootLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const calculateEssence = () => {
    let be = 0
    let oe = 0

    selectedChampions.forEach((lootId) => {
      const item = championLoot.find((l) => l.lootId === lootId)
      if (item) be += item.disenchantValue * item.count
    })

    selectedSkins.forEach((lootId) => {
      const item = skinLoot.find((l) => l.lootId === lootId)
      if (item) oe += item.disenchantValue * item.count
    })

    setBlueEssence(be)
    setOrangeEssence(oe)
  }

  const toggleChampion = (lootId: string) => {
    const newSet = new Set(selectedChampions)
    if (newSet.has(lootId)) {
      newSet.delete(lootId)
    } else {
      newSet.add(lootId)
    }
    setSelectedChampions(newSet)
  }

  const toggleSkin = (lootId: string) => {
    const newSet = new Set(selectedSkins)
    if (newSet.has(lootId)) {
      newSet.delete(lootId)
    } else {
      newSet.add(lootId)
    }
    setSelectedSkins(newSet)
  }

  const toggleAllChampions = () => {
    if (selectedChampions.size === championLoot.length) {
      setSelectedChampions(new Set())
    } else {
      setSelectedChampions(new Set(championLoot.map((l) => l.lootId)))
    }
  }

  const toggleAllSkins = () => {
    if (selectedSkins.size === skinLoot.length) {
      setSelectedSkins(new Set())
    } else {
      setSelectedSkins(new Set(skinLoot.map((l) => l.lootId)))
    }
  }

  const disenchantSelected = async () => {
    setLoading(true)
    try {
      const allSelected = [...Array.from(selectedChampions), ...Array.from(selectedSkins)]

      let successCount = 0
      for (const lootId of allSelected) {
        try {
          await window.api.lcuRequest(
            'POST',
            `/lol-loot/v1/recipes/CHAMPION_RENTAL_disenchant/craft?repeat=1`,
            { lootIds: [lootId] }
          )
          successCount++
        } catch (err) {
          console.error(`Failed to disenchant ${lootId}:`, err)
        }
      }

      toast.success(
        t('lootManager.disenchantSuccess', { 
          successCount, 
          totalCount: allSelected.length, 
          blueEssence, 
          orangeEssence 
        })
      )
      setSelectedChampions(new Set())
      setSelectedSkins(new Set())
      await loadLoot()
    } catch (error) {
      console.error('Disenchant hatası:', error)
      toast.error(t('lootManager.disenchantFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">{t('lootManager.waitingForConnection')}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={disenchantSelected}
              disabled={loading || (selectedChampions.size === 0 && selectedSkins.size === 0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Seçilenleri Parçala
            </button>
            <button
              onClick={toggleAllChampions}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {t('lootManager.selectAllChampions')}
            </button>
            <button
              onClick={toggleAllSkins}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg"
            >
              {t('lootManager.selectAllSkins')}
            </button>
          </div>
          <div className="text-right">
            <p className="text-blue-400">{t('lootManager.blueEssenceToGain')}: {blueEssence}</p>
            <p className="text-orange-400">{t('lootManager.orangeEssenceToGain')}: {orangeEssence}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">{t('lootManager.blueEssenceSources')}</h3>
          <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
            {championLoot.map((item) => (
              <div
                key={item.lootId}
                onClick={() => toggleChampion(item.lootId)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedChampions.has(item.lootId)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${item.lootId.split('_')[1]}.png`}
                      alt={item.localizedName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.localizedName}</p>
                    <p className="text-xs text-gray-400">
                      {item.disenchantValue} BE x{item.count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-orange-400">{t('lootManager.orangeEssenceSources')}</h3>
          <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
            {skinLoot.map((item) => (
              <div
                key={item.lootId}
                onClick={() => toggleSkin(item.lootId)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSkins.has(item.lootId)
                    ? 'border-orange-500 bg-orange-900/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                    <img
                      src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-splashes/${item.lootId.split('_')[1]}/${item.lootId.split('_')[2]}.jpg`}
                      alt={item.localizedName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.localizedName}</p>
                    <p className="text-xs text-gray-400">
                      {item.disenchantValue} OE x{item.count}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
