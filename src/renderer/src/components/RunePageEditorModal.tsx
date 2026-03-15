import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface RunePage {
  id: number
  name: string
  primaryStyleId: number
  subStyleId: number
  selectedPerkIds: number[]
  current: boolean
  isEditable: boolean
}

interface RuneTree {
  id: number
  key: string
  icon: string
  name: string
  slots: Array<{
    runes: Array<{
      id: number
      key: string
      icon: string
      name: string
      shortDesc: string
      longDesc: string
    }>
  }>
}

interface RunePageEditorModalProps {
  isOpen: boolean
  onClose: () => void
  page: RunePage
  onSave: () => void
}

export function RunePageEditorModal({ isOpen, onClose, page, onSave }: RunePageEditorModalProps) {
  const [runeTrees, setRuneTrees] = useState<RuneTree[]>([])
  const [pageName, setPageName] = useState(page.name)
  const [primaryStyleId, setPrimaryStyleId] = useState(page.primaryStyleId)
  const [subStyleId, setSubStyleId] = useState(page.subStyleId)
  const [selectedPerkIds, setSelectedPerkIds] = useState<number[]>(() => {
    const perks = [...page.selectedPerkIds]
    // Ensure exactly 9 elements (4 primary + 2 secondary + 3 stat)
    while (perks.length < 9) {
      perks.push(0)
    }
    return perks.slice(0, 9)
  })
  const [isSaving, setIsSaving] = useState(false)
  const [statRunes, setStatRunes] = useState<
    Array<Array<{ id: number; name: string; icon: string }>>
  >([[], [], []])

  useEffect(() => {
    const loadTrees = async () => {
      try {
        const result = await window.api.runesGetTrees()
        if (result.success && result.trees) {
          setRuneTrees(result.trees)

          // Extract real stat runes from LCU
          const firstTree = result.trees[0]
          if (firstTree && firstTree.slots) {
            const statSlots = firstTree.slots.filter((slot: any) => slot.type === 'kStatMod')
            if (statSlots.length >= 3) {
              const realStatRunes = [
                (statSlots[0].runes || []).map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  icon: r.icon
                })),
                (statSlots[1].runes || []).map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  icon: r.icon
                })),
                (statSlots[2].runes || []).map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  icon: r.icon
                }))
              ]
              setStatRunes(realStatRunes)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load rune trees:', error)
      }
    }

    if (isOpen) {
      loadTrees()
    }
  }, [isOpen])

  const handleSave = async () => {
    // Validate: 4 primary + 2 secondary + 3 stat
    const primaryCount = selectedPerkIds.slice(0, 4).filter((id) => id > 0).length
    const secondaryCount = selectedPerkIds.slice(4, 6).filter((id) => id > 0).length
    const statCount = selectedPerkIds.slice(6, 9).filter((id) => id > 0).length

    if (primaryCount !== 4 || secondaryCount !== 2 || statCount !== 3) {
      toast.error('4 ana + 2 ikincil + 3 istatistik rün seçmelisiniz')
      return
    }

    // Filter out any 0 values and ensure exactly 9 runes
    const validPerks = selectedPerkIds.filter((id) => id > 0)
    if (validPerks.length !== 9) {
      toast.error('Tam 9 rün seçmelisiniz')
      return
    }

    setIsSaving(true)
    try {
      let result
      if (page.id === -1) {
        // Create new page
        result = await window.api.runesCreatePage({
          name: pageName,
          primaryStyleId,
          subStyleId,
          selectedPerkIds: validPerks
        })
      } else {
        // Update existing page
        result = await window.api.runesUpdatePage(page.id, {
          name: pageName,
          primaryStyleId,
          subStyleId,
          selectedPerkIds: validPerks
        })
      }

      if (result.success) {
        onSave()
      } else {
        toast.error('Rün sayfası kaydedilemedi')
      }
    } catch (error) {
      console.error('Failed to save rune page:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRuneSelect = (runeId: number, slotIndex: number, isPrimary: boolean) => {
    const newSelectedPerks = [...selectedPerkIds]

    if (isPrimary) {
      // Primary: 4 runes (indices 0-3)
      newSelectedPerks[slotIndex] = runeId
    } else {
      // Secondary: only 2 runes can be selected (indices 4-5)
      // Find if this rune is already selected
      const runeAlreadySelected = newSelectedPerks.slice(4, 6).includes(runeId)

      if (runeAlreadySelected) {
        // Deselect if already selected
        const indexToRemove = newSelectedPerks.slice(4, 6).indexOf(runeId)
        newSelectedPerks[4 + indexToRemove] = 0
      } else {
        // Try to add to first empty slot
        const firstEmptySlot = newSelectedPerks.slice(4, 6).findIndex((id) => !id || id === 0)
        if (firstEmptySlot !== -1) {
          newSelectedPerks[4 + firstEmptySlot] = runeId
        } else {
          // Both slots full, replace the second one
          newSelectedPerks[5] = runeId
        }
      }
    }

    setSelectedPerkIds(newSelectedPerks)
  }

  const handleStatRuneSelect = (runeId: number, statIndex: number) => {
    const newSelectedPerks = [...selectedPerkIds]
    // Stat runes: indices 6-8 (after 4 primary + 2 secondary slots)
    const targetIndex = 6 + statIndex
    newSelectedPerks[targetIndex] = runeId
    setSelectedPerkIds(newSelectedPerks)
  }

  const getRuneIconUrl = (iconPath: string) => {
    if (!iconPath) return ''

    if (iconPath.includes('/lol-game-data/assets/')) {
      const pathParts = iconPath.split('/lol-game-data/assets/')
      if (pathParts.length > 1) {
        const assetPath = pathParts[1].toLowerCase()
        return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${assetPath}`
      }
    }

    return iconPath
  }

  const primaryTree = runeTrees.find((t) => t.id === primaryStyleId)
  const secondaryTree = runeTrees.find((t) => t.id === subStyleId)

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-[580px] max-h-[90vh] bg-gradient-to-br from-[#010a13] via-[#0a1428] to-[#010a13] border-2 border-purple-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex-shrink-0">
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            className="flex-1 px-2.5 py-1.5 bg-gray-900/50 border border-purple-500/30 rounded text-sm text-purple-100 focus:outline-none focus:border-purple-500/60"
            placeholder="Sayfa adı..."
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 ml-2 text-purple-300 hover:text-purple-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content - LoL Style Layout */}
        <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1">
          {/* Tree Selection */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1.5">Ana Ağaç</div>
              <div className="flex gap-1.5">
                {runeTrees
                  .filter((t) => t.slots && t.slots.length > 0)
                  .map((tree) => (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() => {
                        setPrimaryStyleId(tree.id)
                        if (subStyleId === tree.id)
                          setSubStyleId(runeTrees.find((t) => t.id !== tree.id)?.id || 8100)
                        setSelectedPerkIds([0, 0, 0, 0, 0, 0, 0, 0, 0])
                      }}
                      className={`flex-1 p-1.5 rounded-lg border-2 transition-all ${
                        primaryStyleId === tree.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-gray-700/50 hover:border-purple-500/50'
                      }`}
                    >
                      <img
                        src={getRuneIconUrl(tree.icon)}
                        alt={tree.name}
                        className="w-7 h-7 mx-auto mb-0.5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="text-[10px] text-center text-gray-300">{tree.name}</div>
                    </button>
                  ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1.5">İkincil Ağaç</div>
              <div className="flex gap-1.5">
                {runeTrees
                  .filter((t) => t.slots && t.slots.length > 0)
                  .map((tree) => (
                    <button
                      key={tree.id}
                      type="button"
                      onClick={() => {
                        setSubStyleId(tree.id)
                        setSelectedPerkIds((prev) => {
                          const newPerks = [...prev]
                          newPerks[4] = 0
                          newPerks[5] = 0
                          return newPerks
                        })
                      }}
                      disabled={primaryStyleId === tree.id}
                      className={`flex-1 p-1.5 rounded-lg border-2 transition-all ${
                        subStyleId === tree.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : primaryStyleId === tree.id
                            ? 'border-gray-700/30 opacity-30 cursor-not-allowed'
                            : 'border-gray-700/50 hover:border-blue-500/50'
                      }`}
                    >
                      <img
                        src={getRuneIconUrl(tree.icon)}
                        alt={tree.name}
                        className="w-7 h-7 mx-auto mb-0.5"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="text-[10px] text-center text-gray-300">{tree.name}</div>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Rune Selection */}
          <div className="flex gap-3">
            {/* Left Side - Primary Tree (4 runes) */}
            <div className="flex-1 space-y-2">
              {primaryTree && (
                <>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <img
                      src={getRuneIconUrl(primaryTree.icon)}
                      alt={primaryTree.name}
                      className="w-6 h-6"
                    />
                    <span className="text-xs font-bold text-purple-400">{primaryTree.name}</span>
                  </div>

                  {primaryTree.slots.slice(0, 4).map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex justify-center gap-1.5">
                      {slot.runes.map((rune) => (
                        <button
                          key={rune.id}
                          type="button"
                          onClick={() => handleRuneSelect(rune.id, slotIndex, true)}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                            selectedPerkIds[slotIndex] === rune.id
                              ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg shadow-yellow-400/50'
                              : 'border-gray-700/50 bg-gray-900/30 hover:border-purple-500/50 hover:scale-105'
                          }`}
                          title={rune.name}
                        >
                          <img
                            src={getRuneIconUrl(rune.icon)}
                            alt={rune.name}
                            className="w-full h-full rounded-full p-1"
                          />
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Right Side - Secondary Tree (2 runes from slots 1-3) */}
            <div className="flex-1 space-y-2">
              {secondaryTree && (
                <>
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    <img
                      src={getRuneIconUrl(secondaryTree.icon)}
                      alt={secondaryTree.name}
                      className="w-6 h-6 opacity-70"
                    />
                    <span className="text-xs font-bold text-blue-400">{secondaryTree.name}</span>
                  </div>

                  {secondaryTree.slots.slice(1, 4).map((slot, slotIndex) => (
                    <div key={slotIndex} className="flex justify-center gap-1.5">
                      {slot.runes.map((rune) => {
                        const isSelected = selectedPerkIds.slice(4, 6).includes(rune.id)
                        const secondaryCount = selectedPerkIds
                          .slice(4, 6)
                          .filter((id) => id > 0).length
                        const canSelect = isSelected || secondaryCount < 2

                        return (
                          <button
                            key={rune.id}
                            type="button"
                            onClick={() => handleRuneSelect(rune.id, slotIndex, false)}
                            disabled={!canSelect}
                            className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg shadow-yellow-400/50'
                                : canSelect
                                  ? 'border-gray-700/50 bg-gray-900/30 hover:border-blue-500/50 hover:scale-105'
                                  : 'border-gray-700/30 bg-gray-900/20 opacity-40 cursor-not-allowed'
                            }`}
                            title={rune.name}
                          >
                            <img
                              src={getRuneIconUrl(rune.icon)}
                              alt={rune.name}
                              className="w-full h-full rounded-full p-1"
                            />
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Bottom - Stat Runes (3 rows) */}
          <div className="px-3 pb-2">
            <div className="space-y-1.5">
              {statRunes.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2.5">
                  {row.map((rune, colIndex) => {
                    const isSelected = selectedPerkIds[6 + rowIndex] === rune.id
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}-${rune.id}`}
                        type="button"
                        onClick={() => handleStatRuneSelect(rune.id, rowIndex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-400/20 scale-110'
                            : 'border-gray-700/50 bg-gray-900/30 hover:border-purple-500/50'
                        }`}
                        title={rune.name}
                      >
                        <img
                          src={getRuneIconUrl(rune.icon)}
                          alt={rune.name}
                          className="w-full h-full p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-2.5 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30 h-8"
          >
            İptal
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 h-8"
          >
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
