import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Edit2, Check, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { RunePageEditorModal } from './RunePageEditorModal'

interface RunePage {
  id: number
  name: string
  primaryStyleId: number
  subStyleId: number
  selectedPerkIds: number[]
  current: boolean
  isEditable: boolean
}

interface RuneSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  disabled?: boolean
}

function RuneSelectorModal({ isOpen, onClose, disabled }: RuneSelectorModalProps) {
  const [runePages, setRunePages] = useState<RunePage[]>([])
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null)
  const [targetPageId, setTargetPageId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<RunePage | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)

  // Load rune pages
  const loadRunePages = async () => {
    try {
      const result = await window.api.runesGetPages()
      if (result.success && result.pages) {
        setRunePages(result.pages)

        const currentPage = result.pages.find((p: RunePage) => p.current)
        if (currentPage) {
          setSelectedPageId(currentPage.id)
        }
      }
    } catch (error) {
      console.error('Failed to load rune pages:', error)
    }
  }

  // Load auto-rune status
  const loadAutoRuneStatus = async () => {
    try {
      const result = await window.api.autoRuneGetStatus()
      if (result.success) {
        setTargetPageId(result.targetPageId)
      }
    } catch (error) {
      console.error('Failed to load auto-rune status:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadRunePages()
      loadAutoRuneStatus()
    }
  }, [isOpen])

  // Handle page selection
  const handlePageSelect = async (pageId: number) => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      const result = await window.api.runesSetCurrentPage(pageId)
      if (result.success) {
        setSelectedPageId(pageId)
        await loadRunePages()
      } else {
        toast.error('Rün sayfası aktif edilemedi')
      }
    } catch (error) {
      console.error('Failed to set current page:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle auto-rune toggle
  const handleAutoRuneToggle = async (pageId: number) => {
    if (disabled) return

    try {
      if (targetPageId === pageId) {
        await window.api.autoRuneStop()
        await window.api.autoRuneSetTargetPage(null)
        setTargetPageId(null)
        toast.success('Otomatik rün devre dışı')
      } else {
        // First set the target page, then start the service
        await window.api.autoRuneSetTargetPage(pageId)
        setTargetPageId(pageId)
        await window.api.autoRuneStart()
        toast.success('Otomatik rün aktif edildi')
      }
    } catch (error) {
      console.error('Failed to toggle auto-rune:', error)
      toast.error('Bir hata oluştu')
    }
  }

  // Handle edit page
  const handleEditPage = (page: RunePage) => {
    setEditingPage(page)
    setIsCreatingNew(false)
    setIsEditModalOpen(true)
  }

  // Handle create new page
  const handleCreateNew = () => {
    // Create a dummy page for new rune page
    const newPage: RunePage = {
      id: -1, // Temporary ID
      name: 'Yeni Rün Sayfası',
      primaryStyleId: 8000, // Default to Precision
      subStyleId: 8100, // Default to Domination
      selectedPerkIds: [],
      current: false,
      isEditable: true
    }
    setEditingPage(newPage)
    setIsCreatingNew(true)
    setIsEditModalOpen(true)
  }

  // Handle delete page
  const handleDeletePage = async (pageId: number) => {
    if (!confirm('Bu rün sayfasını silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const result = await window.api.runesDeletePage(pageId)
      if (result.success) {
        toast.success('Rün sayfası silindi')
        await loadRunePages()
      } else {
        toast.error('Rün sayfası silinemedi')
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
      toast.error('Bir hata oluştu')
    }
  }

  // Handle save page
  const handleSavePage = async () => {
    setIsEditModalOpen(false)
    setEditingPage(null)
    setIsCreatingNew(false)
    await loadRunePages()
    toast.success(isCreatingNew ? 'Rün sayfası oluşturuldu' : 'Rün sayfası kaydedildi')
  }

  // Get rune tree icon
  const getRuneTreeIcon = (styleId: number) => {
    const treeIcons: Record<number, string> = {
      8000: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7201_precision.png',
      8100: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7200_domination.png',
      8200: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7202_sorcery.png',
      8300: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7204_resolve.png',
      8400: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7203_whimsy.png'
    }
    return treeIcons[styleId] || ''
  }

  if (!isOpen) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[calc(100vh-160px)] overflow-hidden bg-gradient-to-br from-[#010a13] via-[#0a1428] to-[#010a13] border-2 border-purple-500/30 rounded-xl shadow-2xl animate-slide-down"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-purple-100">Rün Sayfası Seç</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateNew}
                disabled={disabled}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
              >
                + Yeni Sayfa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-purple-300 hover:text-purple-100"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {runePages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Rün sayfası bulunamadı</div>
            ) : (
              runePages.map((page) => (
                <div
                  key={page.id}
                  className={`group relative flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedPageId === page.id
                      ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500/60 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-900/40 hover:bg-gray-800/60 border-2 border-gray-700/30 hover:border-purple-500/40'
                  }`}
                >
                  {/* Rune tree icons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <img
                        src={getRuneTreeIcon(page.primaryStyleId)}
                        alt="Primary"
                        className="w-12 h-12 rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="relative">
                      <img
                        src={getRuneTreeIcon(page.subStyleId)}
                        alt="Secondary"
                        className="w-8 h-8 rounded-lg opacity-80"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Page name */}
                  <button
                    onClick={() => handlePageSelect(page.id)}
                    disabled={disabled || isLoading}
                    className="flex-1 text-left text-sm font-semibold text-purple-100 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {page.name}
                  </button>

                  {/* Current indicator - REMOVED */}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPage(page)}
                      disabled={disabled}
                      className="h-8 w-8 p-0 text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {page.isEditable && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePage(page.id)
                        }}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant={targetPageId === page.id ? 'default' : 'outline'}
                      onClick={() => handleAutoRuneToggle(page.id)}
                      disabled={disabled}
                      className={`h-8 px-3 text-xs font-medium ${
                        targetPageId === page.id
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg shadow-purple-500/30'
                          : 'border-purple-500/30 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500/60'
                      }`}
                    >
                      {targetPageId === page.id ? '⭐ Otomatik' : 'Otomatik'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPage && (
        <RunePageEditorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingPage(null)
          }}
          page={editingPage}
          onSave={handleSavePage}
        />
      )}
    </>,
    document.body
  )
}

export function AutoRuneSelector({ disabled }: { disabled?: boolean }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<RunePage | null>(null)
  const [targetPageId, setTargetPageId] = useState<number | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)

  // Load current page
  const loadCurrentPage = async () => {
    try {
      const result = await window.api.runesGetCurrentPage()
      if (result.success && result.page) {
        setCurrentPage(result.page)
      }
    } catch (error) {
      console.error('Failed to load current page:', error)
    }
  }

  // Load auto-rune status
  const loadAutoRuneStatus = async () => {
    try {
      const result = await window.api.autoRuneGetStatus()
      if (result.success) {
        setTargetPageId(result.targetPageId)
        setIsEnabled(result.isRunning)
      }
    } catch (error) {
      console.error('Failed to load auto-rune status:', error)
    }
  }

  useEffect(() => {
    loadCurrentPage()
    loadAutoRuneStatus()

    // Reload when modal closes to refresh data
    const interval = setInterval(() => {
      if (!isModalOpen) {
        loadCurrentPage()
        loadAutoRuneStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isModalOpen])

  // Handle enable/disable toggle
  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        if (!targetPageId) {
          toast.error('Önce bir rün sayfası seçin')
          return
        }
        await window.api.autoRuneStart()
        setIsEnabled(true)
        toast.success('Otomatik rün aktif')
      } else {
        await window.api.autoRuneStop()
        setIsEnabled(false)
        toast.success('Otomatik rün devre dışı')
      }
    } catch (error) {
      console.error('Failed to toggle auto-rune:', error)
      toast.error('Bir hata oluştu')
    }
  }

  // Get rune tree icon (second instance in component)
  const getRuneTreeIcon = (styleId: number) => {
    const treeIcons: Record<number, string> = {
      8000: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7201_precision.png',
      8100: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7200_domination.png',
      8200: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7202_sorcery.png',
      8300: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7204_resolve.png',
      8400: 'https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7203_whimsy.png'
    }
    return treeIcons[styleId] || ''
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-semibold text-purple-100">Otomatik Rün Seçici</div>
            {currentPage ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <img
                    src={getRuneTreeIcon(currentPage.primaryStyleId)}
                    alt="Primary"
                    className="w-5 h-5 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <img
                    src={getRuneTreeIcon(currentPage.subStyleId)}
                    alt="Secondary"
                    className="w-4 h-4 rounded opacity-70"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 truncate">{currentPage.name}</span>
                {targetPageId === currentPage.id && isEnabled && (
                  <span className="text-xs text-purple-400 flex-shrink-0">⭐</span>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">Rün sayfası seç</div>
            )}
          </div>
          <div className="text-purple-400">›</div>
        </button>

        <div className="flex flex-col items-center gap-1">
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={disabled || !targetPageId}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600"
          />
          <span className="text-[10px] text-gray-500">{isEnabled ? 'Aktif' : 'Pasif'}</span>
        </div>
      </div>

      <RuneSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          loadCurrentPage()
          loadAutoRuneStatus()
        }}
        disabled={disabled}
      />
    </>
  )
}
