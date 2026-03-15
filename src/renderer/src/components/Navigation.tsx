import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Home,
  UserCircle,
  Image,
  Trophy,
  User,
  Award,
  Package,
  ShoppingCart,
  AlertTriangle,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  UserCog,
  Sliders
} from 'lucide-react'

interface NavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

interface TabCategory {
  id: string
  label: string
  icon: any
  tabs: Array<{ id: string; label: string; icon: any }>
}

export function Navigation({ activeTab = 'home', onTabChange }: NavigationProps) {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['main', 'profile', 'tools'])
  )

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab)
    onTabChange?.(tab)
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const categories: TabCategory[] = [
    {
      id: 'main',
      label: 'Ana Menü',
      icon: Home,
      tabs: [{ id: 'home', label: t('nav.home', 'Ana Sayfa'), icon: Home }]
    },
    {
      id: 'profile',
      label: 'Profil Yönetimi',
      icon: UserCircle,
      tabs: [
        { id: 'profile-bio', label: 'Bio & Durum', icon: UserCircle },
        { id: 'rank-override', label: 'Rank Gösterimi', icon: Trophy }
      ]
    },
    {
      id: 'game',
      label: 'Oyun İçi',
      icon: Users,
      tabs: [{ id: 'champion-select-stats', label: 'Takım İstatistikleri', icon: Users }]
    },
    {
      id: 'tools',
      label: 'Araçlar',
      icon: Settings,
      tabs: [
        { id: 'loot-manager', label: t('navigation.lootManager'), icon: Package },
        { id: 'champion-buyer', label: t('navigation.championBuyer'), icon: ShoppingCart },
        { id: 'report-tool', label: t('navigation.reportTool'), icon: AlertTriangle },
        { id: 'accounts-manager', label: t('navigation.accountsManager'), icon: UserCog },
        { id: 'settings-editor', label: t('navigation.settingsEditor'), icon: Sliders },
        { id: 'misc-tools', label: t('navigation.miscTools'), icon: Settings }
      ]
    }
  ]

  return (
    <nav className="w-64 glass border-r border-white/10 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Menü
        </h2>
      </div>

      <div className="flex-1 p-2">
        {categories.map((category) => {
          const CategoryIcon = category.icon
          const isExpanded = expandedCategories.has(category.id)

          return (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-text-secondary hover:glass-strong hover:text-text-primary transition-all"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4" />
                  <span className="font-medium text-sm">{category.label}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-2 mt-1 space-y-1">
                  {category.tabs.map((tab) => {
                    const TabIcon = tab.icon
                    const isActive = currentTab === tab.id

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover-lift ${
                          isActive
                            ? 'gradient-gaming text-white shadow-lg glow-primary'
                            : 'text-text-secondary hover:glass-strong hover:text-text-primary'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
