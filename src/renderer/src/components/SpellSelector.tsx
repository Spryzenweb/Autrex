import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Switch } from './ui/switch'

interface SummonerSpell {
  id: number
  name: string
  description: string
  iconPath: string
  gameModes: string[]
}

interface SpellSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  disabled?: boolean
}

function SpellSelectorModal({ isOpen, onClose, disabled }: SpellSelectorModalProps) {
  const { t } = useTranslation()
  const [availableSpells, setAvailableSpells] = useState<SummonerSpell[]>([])
  const [spell1Id, setSpell1Id] = useState<number>(0)
  const [spell2Id, setSpell2Id] = useState<number>(0)
  const [targetSpell1Id, setTargetSpell1Id] = useState<number>(0)
  const [targetSpell2Id, setTargetSpell2Id] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectingSlot, setSelectingSlot] = useState<1 | 2 | null>(null)

  // Load available spells
  const loadAvailableSpells = async () => {
    try {
      const result = await window.api.spellsGetAvailable()
      if (result.success && result.spells) {
        setAvailableSpells(result.spells)
      }
    } catch (error) {
      console.error('Failed to load available spells:', error)
    }
  }

  // Load current spells
  const loadCurrentSpells = async () => {
    try {
      const result = await window.api.spellsGetCurrent()
      if (result.success && result.spells) {
        setSpell1Id(result.spells.spell1Id)
        setSpell2Id(result.spells.spell2Id)
      }
    } catch (error) {
      console.error('Failed to load current spells:', error)
    }
  }

  // Load target spells (for auto-spell)
  const loadTargetSpells = async () => {
    try {
      const result = await window.api.autoSpellGetTargetSpells()
      if (result.success) {
        setTargetSpell1Id(result.spell1Id || 0)
        setTargetSpell2Id(result.spell2Id || 0)
        // If we have target spells, show them in the modal
        if (result.spell1Id && result.spell2Id) {
          setSpell1Id(result.spell1Id)
          setSpell2Id(result.spell2Id)
        }
      }
    } catch (error) {
      console.error('Failed to load target spells:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadAvailableSpells()
      loadTargetSpells() // Load target spells first
      loadCurrentSpells() // Then load current spells (will override if in champ select)
    }
  }, [isOpen])

  // Get spell icon URL
  const getSpellIconUrl = (iconPath: string) => {
    if (!iconPath) return ''
    const spellName = iconPath.split('/').pop()?.replace('.png', '')
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/${spellName?.toLowerCase()}.png`
  }

  // Get selected spell
  const getSelectedSpell = (spellId: number) => {
    return availableSpells.find((s) => s.id === spellId)
  }

  // Handle spell selection
  const handleSpellSelect = async (spellId: number) => {
    if (disabled || isLoading || !selectingSlot) return

    setIsLoading(true)
    try {
      const newSpell1 = selectingSlot === 1 ? spellId : spell1Id
      const newSpell2 = selectingSlot === 2 ? spellId : spell2Id

      const result = await window.api.spellsSet(newSpell1, newSpell2)
      if (result.success) {
        if (selectingSlot === 1) {
          setSpell1Id(spellId)
        } else {
          setSpell2Id(spellId)
        }

        // Save as target spells for auto-spell
        await window.api.autoSpellSetTargetSpells(newSpell1, newSpell2)

        toast.success(`${selectingSlot}. büyü seçildi`)
        setSelectingSlot(null)
      } else {
        toast.error(t('spellSelector.spellSelectFailed'))
      }
    } catch (error) {
      console.error('Failed to set spell:', error)
      toast.error(t('spellSelector.errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const selectedSpell1 = getSelectedSpell(spell1Id)
  const selectedSpell2 = getSelectedSpell(spell2Id)

  // Common spells for quick access
  const commonSpells = [
    { name: 'Flash', id: 4 },
    { name: 'Ignite', id: 14 },
    { name: 'Teleport', id: 12 },
    { name: 'Heal', id: 7 },
    { name: 'Barrier', id: 21 },
    { name: 'Exhaust', id: 3 },
    { name: 'Smite', id: 11 },
    { name: 'Ghost', id: 6 },
    { name: 'Cleanse', id: 1 }
  ]

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[calc(100vh-160px)] overflow-hidden bg-gradient-to-br from-[#010a13] via-[#0a1428] to-[#010a13] border-2 border-yellow-500/30 rounded-xl shadow-2xl animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-yellow-100">Büyü Seç</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-yellow-300 hover:text-yellow-100"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
          {/* Current Spells */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectingSlot(1)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectingSlot === 1
                  ? 'border-yellow-500 bg-yellow-900/40 shadow-lg shadow-yellow-500/20'
                  : 'border-gray-700/30 bg-gray-900/40 hover:border-yellow-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">1. Büyü</span>
                {targetSpell1Id === spell1Id && targetSpell1Id > 0 && (
                  <span className="text-xs text-yellow-400">⭐ Otomatik</span>
                )}
              </div>
              {selectedSpell1 ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={getSpellIconUrl(selectedSpell1.iconPath)}
                    alt={selectedSpell1.name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <span className="text-sm font-medium text-yellow-100">{selectedSpell1.name}</span>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-600/50 flex items-center justify-center text-gray-500">
                  ?
                </div>
              )}
            </button>

            <button
              onClick={() => setSelectingSlot(2)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectingSlot === 2
                  ? 'border-orange-500 bg-orange-900/40 shadow-lg shadow-orange-500/20'
                  : 'border-gray-700/30 bg-gray-900/40 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">2. Büyü</span>
                {targetSpell2Id === spell2Id && targetSpell2Id > 0 && (
                  <span className="text-xs text-orange-400">⭐ Otomatik</span>
                )}
              </div>
              {selectedSpell2 ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={getSpellIconUrl(selectedSpell2.iconPath)}
                    alt={selectedSpell2.name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <span className="text-sm font-medium text-orange-100">{selectedSpell2.name}</span>
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-lg border-2 border-dashed border-gray-600/50 flex items-center justify-center text-gray-500">
                  ?
                </div>
              )}
            </button>
          </div>

          {/* Selection Instruction */}
          {selectingSlot && (
            <div className="text-center text-sm text-yellow-400 font-medium bg-yellow-900/20 py-2 rounded-lg">
              {selectingSlot}. büyü için bir seçim yapın
            </div>
          )}

          {/* Spell Grid */}
          <div className="grid grid-cols-3 gap-3">
            {commonSpells.map((spell) => {
              const spellData = availableSpells.find((s) => s.id === spell.id)
              if (!spellData) return null

              const isSelected = spell1Id === spell.id || spell2Id === spell.id

              return (
                <button
                  key={spell.id}
                  type="button"
                  onClick={() => handleSpellSelect(spell.id)}
                  disabled={disabled || isLoading || !selectingSlot}
                  className={`group relative p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-900/40 shadow-lg shadow-yellow-500/20'
                      : 'border-gray-700/30 bg-gray-900/40 hover:border-yellow-500/50 hover:bg-gray-800/60'
                  }`}
                  title={spellData.name}
                >
                  <img
                    src={getSpellIconUrl(spellData.iconPath)}
                    alt={spellData.name}
                    className="w-full h-auto rounded"
                  />
                  <div className="mt-2 text-xs font-medium text-yellow-100 text-center">
                    {spell.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function SpellSelector({ disabled }: { disabled?: boolean }) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [spell1Id, setSpell1Id] = useState<number>(0)
  const [spell2Id, setSpell2Id] = useState<number>(0)
  const [availableSpells, setAvailableSpells] = useState<SummonerSpell[]>([])
  const [isEnabled, setIsEnabled] = useState(false)

  // Load available spells
  const loadAvailableSpells = async () => {
    try {
      const result = await window.api.spellsGetAvailable()
      if (result.success && result.spells) {
        setAvailableSpells(result.spells)
      }
    } catch (error) {
      console.error('Failed to load available spells:', error)
    }
  }

  // Load current or target spells
  const loadSpells = async () => {
    try {
      // First try to get current spells (if in champ select)
      const currentResult = await window.api.spellsGetCurrent()
      if (currentResult.success && currentResult.spells && currentResult.spells.spell1Id > 0) {
        setSpell1Id(currentResult.spells.spell1Id)
        setSpell2Id(currentResult.spells.spell2Id)
        return
      }

      // If not in champ select, show target spells
      const targetResult = await window.api.autoSpellGetTargetSpells()
      if (targetResult.success) {
        setSpell1Id(targetResult.spell1Id || 0)
        setSpell2Id(targetResult.spell2Id || 0)
      }
    } catch (error) {
      console.error('Failed to load spells:', error)
    }
  }

  // Load auto spell status
  const loadAutoSpellStatus = async () => {
    try {
      const result = await window.api.autoSpellGetStatus()
      if (result.success) {
        setIsEnabled(result.isRunning)
      }
    } catch (error) {
      console.error('Failed to load auto spell status:', error)
    }
  }

  useEffect(() => {
    loadAvailableSpells()
    loadSpells()
    loadAutoSpellStatus()

    // Reload periodically to keep data fresh
    const interval = setInterval(() => {
      loadSpells()
      loadAutoSpellStatus()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Handle enable/disable toggle
  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        if (spell1Id === 0 || spell2Id === 0) {
          toast.error(t('spellSelector.selectSpellsFirst'))
          return
        }
        await window.api.autoSpellStart()
        setIsEnabled(true)
        toast.success(t('spellSelector.autoSpellActive'))
      } else {
        await window.api.autoSpellStop()
        setIsEnabled(false)
        toast.success(t('spellSelector.autoSpellDisabled'))
      }
    } catch (error) {
      console.error('Failed to toggle auto-spell:', error)
      toast.error(t('spellSelector.errorOccurred'))
    }
  }

  // Get spell icon URL
  const getSpellIconUrl = (iconPath: string) => {
    if (!iconPath) return ''
    const spellName = iconPath.split('/').pop()?.replace('.png', '')
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/data/spells/icons2d/${spellName?.toLowerCase()}.png`
  }

  // Get selected spell
  const getSelectedSpell = (spellId: number) => {
    return availableSpells.find((s) => s.id === spellId)
  }

  const selectedSpell1 = getSelectedSpell(spell1Id)
  const selectedSpell2 = getSelectedSpell(spell2Id)
  const hasSpells = spell1Id > 0 && spell2Id > 0

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-semibold text-yellow-100">Büyü Seçici</div>
            <div className="flex items-center gap-2 mt-1">
              {selectedSpell1 && (
                <img
                  src={getSpellIconUrl(selectedSpell1.iconPath)}
                  alt={selectedSpell1.name}
                  className="w-5 h-5 rounded"
                />
              )}
              {selectedSpell2 && (
                <img
                  src={getSpellIconUrl(selectedSpell2.iconPath)}
                  alt={selectedSpell2.name}
                  className="w-5 h-5 rounded"
                />
              )}
              {hasSpells ? (
                <span className="text-xs text-gray-400 truncate">
                  {selectedSpell1?.name || '?'} + {selectedSpell2?.name || '?'}
                </span>
              ) : (
                <span className="text-xs text-gray-500">Büyü seç</span>
              )}
            </div>
          </div>
          <div className="text-yellow-400">›</div>
        </button>

        <div className="flex flex-col items-center gap-1">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-600 data-[state=checked]:to-orange-600"
          />
          <span className="text-[10px] text-gray-500">{isEnabled ? 'Aktif' : 'Pasif'}</span>
        </div>
      </div>

      <SpellSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          // Reload spells when modal closes
          setTimeout(() => {
            loadSpells()
          }, 100)
        }}
        disabled={disabled}
      />
    </>
  )
}
