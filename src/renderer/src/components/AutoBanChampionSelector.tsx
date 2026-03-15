import { useState, useEffect } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { autoBanChampionsAtom } from '../store/atoms/lcu.atoms'
import { championDataAtom } from '../store/atoms/champion.atoms'
import { ChampionSelectorModal } from './ChampionSelectorModal'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plus, X } from 'lucide-react'
import type { Champion } from '../App'
import { ChampionAvatar } from './ChampionAvatar'

interface AutoBanChampionSelectorProps {
  disabled?: boolean
}

export function AutoBanChampionSelector({ disabled = false }: AutoBanChampionSelectorProps) {
  const { t } = useTranslation()
  const championData = useAtomValue(championDataAtom)
  const [selectedChampions, setSelectedChampions] = useAtom(autoBanChampionsAtom)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allChampions, setAllChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAllChampions = async () => {
      try {
        setLoading(true)

        // Check if we're in development/browser mode
        if (!window.api) {
          // Mock data for testing in browser
          const mockChampions = [
            {
              id: 1,
              name: 'Aatrox',
              key: 'Aatrox',
              title: 'the Darkin Blade',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aatrox.png',
              tags: ['Fighter', 'Tank'],
              skins: []
            },
            {
              id: 2,
              name: 'Ahri',
              key: 'Ahri',
              title: 'the Nine-Tailed Fox',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ahri.png',
              tags: ['Mage', 'Assassin'],
              skins: []
            },
            {
              id: 3,
              name: 'Akali',
              key: 'Akali',
              title: 'the Rogue Assassin',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Akali.png',
              tags: ['Assassin'],
              skins: []
            },
            {
              id: 4,
              name: 'Alistar',
              key: 'Alistar',
              title: 'the Minotaur',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Alistar.png',
              tags: ['Tank', 'Support'],
              skins: []
            },
            {
              id: 5,
              name: 'Ammu',
              key: 'Amumu',
              title: 'the Sad Mummy',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Amumu.png',
              tags: ['Tank', 'Mage'],
              skins: []
            },
            {
              id: 6,
              name: 'Anivia',
              key: 'Anivia',
              title: 'the Cryophoenix',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Anivia.png',
              tags: ['Mage', 'Support'],
              skins: []
            },
            {
              id: 7,
              name: 'Annie',
              key: 'Annie',
              title: 'the Dark Child',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Annie.png',
              tags: ['Mage'],
              skins: []
            },
            {
              id: 8,
              name: 'Ashe',
              key: 'Ashe',
              title: 'the Frost Archer',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Ashe.png',
              tags: ['Marksman', 'Support'],
              skins: []
            },
            {
              id: 9,
              name: 'Azir',
              key: 'Azir',
              title: 'the Emperor of the Sands',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Azir.png',
              tags: ['Mage', 'Marksman'],
              skins: []
            },
            {
              id: 10,
              name: 'Bard',
              key: 'Bard',
              title: 'the Wandering Caretaker',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Bard.png',
              tags: ['Support', 'Mage'],
              skins: []
            },
            {
              id: 11,
              name: 'Blitzcrank',
              key: 'Blitzcrank',
              title: 'the Great Steam Golem',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Blitzcrank.png',
              tags: ['Tank', 'Fighter'],
              skins: []
            },
            {
              id: 12,
              name: 'Brand',
              key: 'Brand',
              title: 'the Burning Vengeance',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Brand.png',
              tags: ['Mage'],
              skins: []
            },
            {
              id: 13,
              name: 'Braum',
              key: 'Braum',
              title: 'the Heart of the Freljord',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Braum.png',
              tags: ['Support', 'Tank'],
              skins: []
            },
            {
              id: 14,
              name: 'Caitlyn',
              key: 'Caitlyn',
              title: 'the Sheriff of Piltover',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Caitlyn.png',
              tags: ['Marksman'],
              skins: []
            },
            {
              id: 15,
              name: 'Camille',
              key: 'Camille',
              title: 'the Steel Shadow',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Camille.png',
              tags: ['Fighter', 'Tank'],
              skins: []
            },
            {
              id: 16,
              name: 'Cassiopeia',
              key: 'Cassiopeia',
              title: 'the Serpents Embrace',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Cassiopeia.png',
              tags: ['Mage'],
              skins: []
            },
            {
              id: 17,
              name: "Cho'Gath",
              key: 'Chogath',
              title: 'the Terror of the Void',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Chogath.png',
              tags: ['Tank', 'Mage'],
              skins: []
            },
            {
              id: 18,
              name: 'Corki',
              key: 'Corki',
              title: 'the Daring Bombardier',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Corki.png',
              tags: ['Marksman'],
              skins: []
            },
            {
              id: 19,
              name: 'Darius',
              key: 'Darius',
              title: 'the Hand of Noxus',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Darius.png',
              tags: ['Fighter', 'Tank'],
              skins: []
            },
            {
              id: 20,
              name: 'Diana',
              key: 'Diana',
              title: 'Scorn of the Moon',
              image: 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Diana.png',
              tags: ['Fighter', 'Mage'],
              skins: []
            }
          ]

          setAllChampions(mockChampions.sort((a: any, b: any) => a.name.localeCompare(b.name)))
          setLoading(false)
          console.log('Mock all champions loaded:', mockChampions.length)
          return
        }

        // Load all champions for ban selection
        const allResult = await window.api.lcuGetAllChampions()
        console.log('LCU all champions response:', allResult)
        if (allResult && Array.isArray(allResult) && allResult.length > 0) {
          console.log('All champions loaded:', allResult.length)
          setAllChampions(allResult.sort((a: any, b: any) => a.name.localeCompare(b.name)))
        } else {
          console.log('Failed to load all champions, using fallback data:', allResult)
          // Fallback to champion data if LCU fails
          setAllChampions(championData?.champions || [])
        }
      } catch (error) {
        console.error('Failed to load all champions:', error)
        setAllChampions(championData?.champions || [])
      } finally {
        setLoading(false)
      }
    }

    loadAllChampions()
  }, [championData])

  const handleChampionsChange = async (championIds: number[]) => {
    setSelectedChampions(championIds)
    try {
      // Persist to settings
      await window.api.setSettings('autoBanChampions', championIds)
      // Update the service arrays
      await window.api.setAutoBanChampions(championIds)
    } catch (error) {
      console.error('Failed to save auto ban champions:', error)
    }
  }

  const handleRemoveChampion = (championId: number) => {
    const newSelectedIds = selectedChampions.filter((id) => id !== championId)
    handleChampionsChange(newSelectedIds)
  }

  const selectedChampionObjects = allChampions.filter((champion) =>
    selectedChampions.includes(champion.id)
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-primary">
          {t('settings.autoBan.championPriority')}
        </h4>
        <Badge variant="secondary">{selectedChampions.length}/5</Badge>
      </div>

      {/* Selected Champions Display */}
      {selectedChampions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedChampionObjects.map((champion) => (
            <Badge
              key={champion.id}
              variant="default"
              className="flex items-center gap-2 px-3 py-2 h-auto"
            >
              <ChampionAvatar
                championName={champion.name}
                championKey={champion.key}
                size="sm"
                showTooltip={false}
              />
              <span className="text-sm">{champion.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20 ml-1"
                onClick={() => handleRemoveChampion(champion.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Champion Button */}
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center gap-2"
        disabled={disabled || loading}
      >
        <Plus className="w-4 h-4" />
        {t('settings.selectChampion', 'Şampiyon Seç')}
      </Button>

      {/* Champion Selection Modal */}
      <ChampionSelectorModal
        champions={allChampions}
        selectedChampionIds={selectedChampions}
        onChampionsChange={handleChampionsChange}
        maxChampions={5}
        label={t('settings.autoBan.championPriority')}
        type="ban"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
