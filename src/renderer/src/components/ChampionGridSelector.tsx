import { useState, useMemo, useCallback, startTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { X, Search, Grid3X3, List } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import type { Champion } from '../App'
import { ChampionAvatar } from './ChampionAvatar'

interface ChampionGridSelectorProps {
  champions: Champion[]
  selectedChampionIds: number[]
  onChampionsChange: (championIds: number[]) => void
  maxChampions?: number
  label?: string
  type?: 'pick' | 'ban'
}

export function ChampionGridSelector({
  champions,
  selectedChampionIds,
  onChampionsChange,
  maxChampions = 5,
  label,
  type = 'pick'
}: ChampionGridSelectorProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showGrid, setShowGrid] = useState(false)

  // Memoize selected champions to prevent unnecessary recalculations
  const selectedChampions = useMemo(() => {
    if (!champions?.length || !selectedChampionIds.length) return []
    return champions.filter((champion) => selectedChampionIds.includes(champion.id))
  }, [champions, selectedChampionIds])

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 100) // Reduced debounce time

  // Optimized filtering with debounced search and early returns
  const filteredChampions = useMemo(() => {
    if (!champions?.length) return []
    if (!debouncedSearchTerm.trim()) return champions

    const searchLower = debouncedSearchTerm.toLowerCase()
    return champions.filter(
      (champion) =>
        champion.name.toLowerCase().includes(searchLower) ||
        champion.key.toLowerCase().includes(searchLower)
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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    startTransition(() => {
      setSearchTerm(value)
    })
  }, [])

  const toggleGrid = useCallback(() => {
    startTransition(() => {
      setShowGrid((prev) => !prev)
    })
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{label || t('settings.selectChampion')}</h3>
          <Badge variant="secondary">
            {selectedChampionIds.length}/{maxChampions}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleGrid}
          className="flex items-center gap-2"
        >
          {showGrid ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          {showGrid ? 'Liste' : 'Grid'}
        </Button>
      </div>

      {/* Selected Champions */}
      {selectedChampions.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Seçili Şampiyonlar</span>
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
        />
      </div>

      {/* Champions Display */}
      {showGrid ? (
        /* Grid View */
        <div className="border rounded-lg bg-card overflow-hidden">
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
      ) : (
        /* List View */
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {filteredChampions.length > 0 ? (
              filteredChampions.map((champion) => {
                const isSelected = selectedChampionIds.includes(champion.id)
                const isDisabled = !isSelected && selectedChampionIds.length >= maxChampions

                return (
                  <div
                    key={champion.id}
                    className={`
                    flex items-center gap-3 p-3 border-b border-border last:border-b-0 
                    cursor-pointer transition-colors duration-150
                    ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
                  `}
                    onClick={() => !isDisabled && handleChampionToggle(champion.id)}
                  >
                    <ChampionAvatar
                      championName={champion.name}
                      championKey={champion.key}
                      size="md"
                      showTooltip={false}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{champion.name}</div>
                      <div className="text-sm text-muted-foreground">{champion.key}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-primary-foreground"
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
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Şampiyon bulunamadı' : 'Şampiyon yükleniyor...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
