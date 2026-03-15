import { useState, useMemo, useCallback, startTransition, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { X, Search, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { useDebounce } from '../hooks/useDebounce'
import type { Champion } from '../App'
import { ChampionAvatar } from './ChampionAvatar'

interface ChampionSelectorModalProps {
  champions: Champion[]
  selectedChampionIds: number[]
  onChampionsChange: (championIds: number[]) => void
  maxChampions?: number
  label?: string
  type?: 'pick' | 'ban'
  isOpen: boolean
  onClose: () => void
}

export function ChampionSelectorModal({
  champions,
  selectedChampionIds,
  onChampionsChange,
  maxChampions = 5,
  label,
  type = 'pick',
  isOpen,
  onClose
}: ChampionSelectorModalProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  // Reset search term when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  // Memoize selected champions to prevent unnecessary recalculations
  const selectedChampions = useMemo(() => {
    if (!champions?.length || !selectedChampionIds.length) return []
    return champions.filter((champion) => selectedChampionIds.includes(champion.id))
  }, [champions, selectedChampionIds])

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Increased debounce time for better UX

  // Optimized filtering with debounced search and early returns
  const filteredChampions = useMemo(() => {
    if (!champions?.length) return []
    if (!debouncedSearchTerm.trim()) return champions

    const searchLower = debouncedSearchTerm.toLowerCase()
    return champions.filter(
      (champion) =>
        (champion.name || '').toLowerCase().includes(searchLower) ||
        (champion.key || '').toLowerCase().includes(searchLower)
    )
  }, [champions, debouncedSearchTerm])

  // Optimized handlers with useCallback to prevent re-renders
  const handleChampionToggle = useCallback(
    (championId: number) => {
      startTransition(() => {
        const isSelected = selectedChampionIds.includes(championId)
        let newSelectedIds: number[]

        if (isSelected) {
          newSelectedIds = selectedChampionIds.filter((id) => id !== championId)
        } else {
          if (selectedChampionIds.length >= maxChampions) {
            return // Don't add if at max capacity
          }
          newSelectedIds = [...selectedChampionIds, championId]
        }

        onChampionsChange(newSelectedIds)
      })
    },
    [selectedChampionIds, onChampionsChange, maxChampions]
  )

  const handleRemoveChampion = useCallback(
    (championId: number) => {
      startTransition(() => {
        const newSelectedIds = selectedChampionIds.filter((id) => id !== championId)
        onChampionsChange(newSelectedIds)
      })
    },
    [selectedChampionIds, onChampionsChange]
  )

  const handleSave = useCallback(() => {
    setSearchTerm('') // Clear search term when closing
    onClose()
  }, [onClose])

  const handleClose = useCallback(() => {
    setSearchTerm('') // Clear search term when closing
    onClose()
  }, [onClose])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    startTransition(() => {
      setSearchTerm(value)
    })
  }, [])

  // Early return if modal is not open to prevent unnecessary renders
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-hidden"
        onPointerDownOutside={(e) => {
          // Allow normal modal behavior in Electron
          handleClose()
        }}
        onEscapeKeyDown={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {label || t('settings.selectChampion')}
          </DialogTitle>
          <DialogDescription>
            {type === 'pick'
              ? 'Otomatik seçim için şampiyonları seçin'
              : 'Otomatik yasaklama için şampiyonları seçin'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Selected Champions */}
          {selectedChampions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Seçili Şampiyonlar</span>
                <Badge variant="secondary">
                  {selectedChampions.length}/{maxChampions}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {selectedChampions.map((champion) => (
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
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
              autoComplete="off"
              autoFocus={isOpen}
            />
          </div>

          {/* Champions Grid with Virtual Scrolling */}
          <div className="border rounded-lg bg-card overflow-hidden flex-1">
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {filteredChampions.length > 0 ? (
                  filteredChampions.map((champion) => {
                    const isSelected = selectedChampionIds.includes(champion.id)
                    const isDisabled = !isSelected && selectedChampionIds.length >= maxChampions

                    return (
                      <div
                        key={champion.id}
                        className={`relative group cursor-pointer transition-transform duration-150 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isDisabled && handleChampionToggle(champion.id)}
                        title={champion.name}
                      >
                        <div
                          className={`
                        relative overflow-hidden rounded-lg border-2 transition-all duration-150 aspect-square
                        ${
                          isSelected
                            ? 'border-primary shadow-lg shadow-primary/25 scale-105'
                            : 'border-border hover:border-primary/50 hover:scale-105'
                        }
                        ${isDisabled ? 'hover:scale-100 hover:border-border' : ''}
                      `}
                        >
                          <div className="w-full h-16 flex items-center justify-center">
                            <ChampionAvatar
                              championName={champion.name}
                              championKey={champion.key}
                              size="lg"
                              showTooltip={false}
                            />
                          </div>

                          {/* Selection overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-primary-foreground"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Champion name */}
                        <div className="mt-1 text-xs text-center text-muted-foreground truncate px-1">
                          {champion.name}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    {searchTerm ? 'Şampiyon bulunamadı' : 'Şampiyon yükleniyor...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            İptal
          </Button>
          <Button onClick={handleSave}>
            Kaydet ({selectedChampionIds.length}/{maxChampions})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
