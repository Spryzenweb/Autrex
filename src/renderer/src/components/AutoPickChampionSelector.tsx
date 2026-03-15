import { useState, useEffect } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { autoPickChampionsAtom } from '../store/atoms/lcu.atoms'
import { championDataAtom } from '../store/atoms/champion.atoms'
import { ChampionSelectorModal } from './ChampionSelectorModal'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plus, X } from 'lucide-react'
import type { Champion } from '../App'
import { ChampionAvatar } from './ChampionAvatar'

interface AutoPickChampionSelectorProps {
  disabled?: boolean
}

export function AutoPickChampionSelector({ disabled = false }: AutoPickChampionSelectorProps) {
  const { t } = useTranslation()
  const championData = useAtomValue(championDataAtom)
  const [selectedChampions, setSelectedChampions] = useAtom(autoPickChampionsAtom)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ownedChampions, setOwnedChampions] = useState<Champion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOwnedChampions = async () => {
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
              name: 'Amumu',
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
            }
          ]

          setOwnedChampions(mockChampions.sort((a: any, b: any) => a.name.localeCompare(b.name)))
          setLoading(false)
          console.log('Mock owned champions loaded:', mockChampions.length)
          return
        }

        // Load owned champions for pick selection
        const ownedResult = await window.api.lcuGetOwnedChampions()
        console.log('LCU owned champions response:', ownedResult)
        if (ownedResult && Array.isArray(ownedResult) && ownedResult.length > 0) {
          console.log('Owned champions loaded:', ownedResult.length)
          setOwnedChampions(ownedResult.sort((a: any, b: any) => a.name.localeCompare(b.name)))
        } else {
          console.log('Failed to load owned champions, using fallback data:', ownedResult)
          // Fallback to all champions if owned champions fails
          setOwnedChampions(championData?.champions || [])
        }
      } catch (error) {
        console.error('Failed to load owned champions:', error)
        setOwnedChampions(championData?.champions || [])
      } finally {
        setLoading(false)
      }
    }

    loadOwnedChampions()
  }, [championData])

  const handleChampionsChange = async (championIds: number[]) => {
    setSelectedChampions(championIds)
    try {
      // Persist to settings
      await window.api.setSettings('autoPickChampions', championIds)
      // Update the service arrays
      await window.api.setAutoPickChampions(championIds)
    } catch (error) {
      console.error('Failed to save auto pick champions:', error)
    }
  }

  const handleRemoveChampion = (championId: number) => {
    const newSelectedIds = selectedChampions.filter((id) => id !== championId)
    handleChampionsChange(newSelectedIds)
  }

  const selectedChampionObjects = ownedChampions.filter((champion) =>
    selectedChampions.includes(champion.id)
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-primary">
          {t('settings.autoPick.championPriority')}
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
        champions={ownedChampions}
        selectedChampionIds={selectedChampions}
        onChampionsChange={handleChampionsChange}
        maxChampions={5}
        label={t('settings.autoPick.championPriority')}
        type="pick"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
