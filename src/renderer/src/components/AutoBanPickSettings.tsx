import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plus, X } from 'lucide-react'
import { ChampionSelectorModal } from './ChampionSelectorModal'
import {
  autoPickEnabledAtom,
  autoPickForceAtom,
  autoPickChampionsAtom,
  autoBanEnabledAtom,
  autoBanForceAtom,
  autoBanChampionsAtom
} from '../store/atoms/lcu.atoms'
import { isElectron } from '../utils/environment'
import { getMockOwnedChampions, getMockAllChampions } from '../data/mockData'
import { ChampionAvatar } from './ChampionAvatar'

interface SortableChampionProps {
  champion: any
  onRemove: (id: number) => void
}

function SortableChampion({ champion, onRemove }: SortableChampionProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: champion.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Badge variant="default" className="flex items-center gap-2 px-3 py-2 h-auto w-full">
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
          className="h-4 w-4 p-0 hover:bg-destructive/20 ml-auto"
          onClick={() => onRemove(champion.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </Badge>
    </div>
  )
}

interface AutoBanPickSettingsProps {
  disabled?: boolean
}

export function AutoBanPickSettings({ disabled = false }: AutoBanPickSettingsProps) {
  const { t } = useTranslation()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Auto Pick atoms
  const [autoPickEnabled, setAutoPickEnabled] = useAtom(autoPickEnabledAtom)
  const [autoPickForce, setAutoPickForce] = useAtom(autoPickForceAtom)
  const [autoPickChampions, setAutoPickChampions] = useAtom(autoPickChampionsAtom)

  // Auto Ban atoms
  const [autoBanEnabled, setAutoBanEnabled] = useAtom(autoBanEnabledAtom)
  const [autoBanForce, setAutoBanForce] = useAtom(autoBanForceAtom)
  const [autoBanChampions, setAutoBanChampions] = useAtom(autoBanChampionsAtom)

  // Champion lists
  const [ownedChampions, setOwnedChampions] = useState<any[]>([])
  const [allChampions, setAllChampions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isPickModalOpen, setIsPickModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)

  useEffect(() => {
    const loadChampions = async () => {
      try {
        setLoading(true)

        // Check if we're in development/browser mode
        if (!isElectron()) {
          // Use centralized mock data for testing in browser
          const mockOwnedChampions = getMockOwnedChampions()
          const mockAllChampions = getMockAllChampions()

          setOwnedChampions(mockOwnedChampions)
          setAllChampions(mockAllChampions)
          setLoading(false)
          console.log('Mock champions loaded:', {
            ownedCount: mockOwnedChampions.length,
            allCount: mockAllChampions.length,
            environment: 'browser'
          })
          return
        }

        console.log('Loading champions from LCU...')

        // Load owned champions for pick selection
        const ownedResult = await window.api.lcuGetOwnedChampions()
        console.log('LCU owned champions response:', ownedResult)
        if (ownedResult && Array.isArray(ownedResult) && ownedResult.length > 0) {
          console.log('Owned champions loaded:', ownedResult.length)
          setOwnedChampions(ownedResult.sort((a: any, b: any) => a.name.localeCompare(b.name)))
        } else {
          console.log('Failed to load owned champions, using fallback data:', ownedResult)
          // Fallback to mock data if LCU fails
          const fallbackChampions = [
            { id: 1, name: 'Aatrox', key: 'Aatrox' },
            { id: 2, name: 'Ahri', key: 'Ahri' },
            { id: 28, name: 'Fiora', key: 'Fiora' },
            { id: 26, name: 'Ezreal', key: 'Ezreal' },
            { id: 8, name: 'Ashe', key: 'Ashe' }
          ]
          setOwnedChampions(fallbackChampions)
        }

        // Load all champions for ban selection
        const allResult = await window.api.lcuGetAllChampions()
        console.log('LCU all champions response:', allResult)
        if (allResult && Array.isArray(allResult) && allResult.length > 0) {
          console.log('All champions loaded:', allResult.length)
          setAllChampions(allResult.sort((a: any, b: any) => a.name.localeCompare(b.name)))
        } else {
          console.log('Failed to load all champions, using fallback data:', allResult)
          // Fallback to mock data if LCU fails
          const fallbackAllChampions = [
            { id: 1, name: 'Aatrox', key: 'Aatrox' },
            { id: 2, name: 'Ahri', key: 'Ahri' },
            { id: 3, name: 'Akali', key: 'Akali' },
            { id: 105, name: 'Fizz', key: 'Fizz' },
            { id: 31, name: "Cho'Gath", key: 'Chogath' },
            { id: 69, name: 'Cassiopeia', key: 'Cassiopeia' },
            { id: 114, name: 'Fiora', key: 'Fiora' },
            { id: 420, name: 'Illaoi', key: 'Illaoi' }
          ]
          setAllChampions(fallbackAllChampions)
        }
      } catch (error) {
        console.error('Failed to load champions:', error)
        setOwnedChampions([])
        setAllChampions([])
      } finally {
        setLoading(false)
      }
    }

    loadChampions()
  }, [])

  useEffect(() => {
    console.log('AutoBanPickSettings state:', {
      autoPickEnabled,
      autoBanEnabled,
      ownedChampionsCount: ownedChampions.length,
      allChampionsCount: allChampions.length,
      autoPickChampions,
      autoBanChampions,
      loading
    })
  }, [
    autoPickEnabled,
    autoBanEnabled,
    ownedChampions,
    allChampions,
    autoPickChampions,
    autoBanChampions,
    loading
  ])

  useEffect(() => {
    console.log('Debug - Champion data state:', {
      ownedChampions: ownedChampions.length,
      allChampions: allChampions.length,
      autoPickChampions,
      autoBanChampions,
      autoPickEnabled,
      autoBanEnabled,
      loading
    })
  }, [
    ownedChampions,
    allChampions,
    autoPickChampions,
    autoBanChampions,
    autoPickEnabled,
    autoBanEnabled,
    loading
  ])

  const handleAutoPickEnabledChange = async (checked: boolean) => {
    setAutoPickEnabled(checked)
    try {
      await window.api.setSettings('autoPickEnabled', checked)

      // If disabling, also disable force mode
      if (!checked) {
        setAutoPickForce(false)
        await window.api.setSettings('autoPickForce', false)
      }
    } catch (error) {
      console.error('Failed to save auto pick setting:', error)
    }
  }

  const handleAutoPickForceChange = async (checked: boolean) => {
    setAutoPickForce(checked)
    try {
      await window.api.setSettings('autoPickForce', checked)
    } catch (error) {
      console.error('Failed to save auto pick force setting:', error)
    }
  }

  const handleAutoPickChampionsChange = async (championIds: number[]) => {
    setAutoPickChampions(championIds)
    try {
      await window.api.setSettings('autoPickChampions', championIds)
      await window.api.setAutoPickChampions(championIds)
    } catch (error) {
      console.error('Failed to save auto pick champions:', error)
    }
  }

  const handleAutoBanEnabledChange = async (checked: boolean) => {
    setAutoBanEnabled(checked)
    try {
      await window.api.setSettings('autoBanEnabled', checked)

      // If disabling, also disable force mode
      if (!checked) {
        setAutoBanForce(false)
        await window.api.setSettings('autoBanForce', false)
      }
    } catch (error) {
      console.error('Failed to save auto ban setting:', error)
    }
  }

  const handleAutoBanForceChange = async (checked: boolean) => {
    setAutoBanForce(checked)
    try {
      await window.api.setSettings('autoBanForce', checked)
    } catch (error) {
      console.error('Failed to save auto ban force setting:', error)
    }
  }

  const handleAutoBanChampionsChange = async (championIds: number[]) => {
    setAutoBanChampions(championIds)
    try {
      await window.api.setSettings('autoBanChampions', championIds)
      await window.api.setAutoBanChampions(championIds)
    } catch (error) {
      console.error('Failed to save auto ban champions:', error)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      if (autoPickChampions.includes(active.id as number)) {
        const oldIndex = autoPickChampions.indexOf(active.id as number)
        const newIndex = autoPickChampions.indexOf(over.id as number)
        const newOrder = arrayMove(autoPickChampions, oldIndex, newIndex)
        handleAutoPickChampionsChange(newOrder)
      } else if (autoBanChampions.includes(active.id as number)) {
        const oldIndex = autoBanChampions.indexOf(active.id as number)
        const newIndex = autoBanChampions.indexOf(over.id as number)
        const newOrder = arrayMove(autoBanChampions, oldIndex, newIndex)
        handleAutoBanChampionsChange(newOrder)
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Auto Pick Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-cyan-500/10 backdrop-blur-sm border border-green-500/20 p-6 transition-all duration-500 hover:shadow-lg hover:shadow-green-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {t('settings.autoPick.title')}
                  </span>
                </h3>
                <p className="text-sm text-text-secondary mt-2 ml-11">
                  {t('settings.autoPick.description')}
                </p>
              </div>
              <Switch
                checked={autoPickEnabled}
                onCheckedChange={handleAutoPickEnabledChange}
                disabled={disabled || loading}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
              />
            </div>

            {autoPickEnabled && (
              <div className="space-y-6 animate-slide-down">
                {/* Force Pick Option */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-surface/50 to-elevated/30 border border-border/30 hover:border-green-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        {t('settings.autoPick.force')}
                      </h4>
                      <p className="text-xs text-text-secondary mt-2 ml-4">
                        {t('settings.autoPick.forceDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={autoPickForce}
                      onCheckedChange={handleAutoPickForceChange}
                      disabled={disabled || loading}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
                    />
                  </div>
                </div>

                {/* Pick Champion Selection */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-surface/30 to-elevated/20 border border-border/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-text-primary">
                        {t('settings.autoPick.championPriority')}
                      </h4>
                      <Badge variant="secondary">{autoPickChampions.length}/5</Badge>
                    </div>

                    {/* Selected Champions Display */}
                    {autoPickChampions.length > 0 && (
                      <SortableContext
                        items={autoPickChampions}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2">
                          {autoPickChampions.map((championId) => {
                            const champion = ownedChampions.find((c) => c.id === championId)
                            if (!champion) return null

                            return (
                              <SortableChampion
                                key={champion.id}
                                champion={champion}
                                onRemove={() => {
                                  const newChampions = autoPickChampions.filter(
                                    (id) => id !== champion.id
                                  )
                                  handleAutoPickChampionsChange(newChampions)
                                }}
                              />
                            )
                          })}
                        </div>
                      </SortableContext>
                    )}

                    {/* Add Champion Button */}
                    <Button
                      variant="outline"
                      onClick={() => setIsPickModalOpen(true)}
                      className="w-full flex items-center gap-2"
                      disabled={disabled || loading}
                    >
                      <Plus className="w-4 h-4" />
                      {t('settings.selectChampion', 'Şampiyon Seç')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Auto Ban Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 via-pink-500/5 to-rose-500/10 backdrop-blur-sm border border-red-500/20 p-6 transition-all duration-500 hover:shadow-lg hover:shadow-red-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  </div>
                  <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {t('settings.autoBan.title')}
                  </span>
                </h3>
                <p className="text-sm text-text-secondary mt-2 ml-11">
                  {t('settings.autoBan.description')}
                </p>
              </div>
              <Switch
                checked={autoBanEnabled}
                onCheckedChange={handleAutoBanEnabledChange}
                disabled={disabled || loading}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500"
              />
            </div>

            {autoBanEnabled && (
              <div className="space-y-6 animate-slide-down">
                {/* Force Ban Option */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-surface/50 to-elevated/30 border border-border/30 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                        {t('settings.autoBan.force')}
                      </h4>
                      <p className="text-xs text-text-secondary mt-2 ml-4">
                        {t('settings.autoBan.forceDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={autoBanForce}
                      onCheckedChange={handleAutoBanForceChange}
                      disabled={disabled || loading}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-500 data-[state=checked]:to-pink-500"
                    />
                  </div>
                </div>

                {/* Ban Champion Selection */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-surface/30 to-elevated/20 border border-border/20">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-text-primary">
                        {t('settings.autoBan.championPriority')}
                      </h4>
                      <Badge variant="secondary">{autoBanChampions.length}/5</Badge>
                    </div>

                    {/* Selected Champions Display */}
                    {autoBanChampions.length > 0 && (
                      <SortableContext
                        items={autoBanChampions}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2">
                          {autoBanChampions.map((championId) => {
                            const champion = allChampions.find((c) => c.id === championId)
                            if (!champion) return null

                            return (
                              <SortableChampion
                                key={champion.id}
                                champion={champion}
                                onRemove={() => {
                                  const newChampions = autoBanChampions.filter(
                                    (id) => id !== champion.id
                                  )
                                  handleAutoBanChampionsChange(newChampions)
                                }}
                              />
                            )
                          })}
                        </div>
                      </SortableContext>
                    )}

                    {/* Add Champion Button */}
                    <Button
                      variant="outline"
                      onClick={() => setIsBanModalOpen(true)}
                      className="w-full flex items-center gap-2"
                      disabled={disabled || loading}
                    >
                      <Plus className="w-4 h-4" />
                      {t('settings.selectChampion', 'Şampiyon Seç')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Champion Selection Modals */}
        <ChampionSelectorModal
          champions={ownedChampions}
          selectedChampionIds={autoPickChampions}
          onChampionsChange={handleAutoPickChampionsChange}
          maxChampions={5}
          label={t('settings.autoPick.championPriority')}
          type="pick"
          isOpen={isPickModalOpen}
          onClose={() => setIsPickModalOpen(false)}
        />

        <ChampionSelectorModal
          champions={allChampions}
          selectedChampionIds={autoBanChampions}
          onChampionsChange={handleAutoBanChampionsChange}
          maxChampions={5}
          label={t('settings.autoBan.championPriority')}
          type="ban"
          isOpen={isBanModalOpen}
          onClose={() => setIsBanModalOpen(false)}
        />
      </div>
    </DndContext>
  )
}
