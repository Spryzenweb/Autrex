import { useState } from 'react'
import { Palette, Check, Settings, Sun, Moon, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { useAtom } from 'jotai'
import { showSettingsDialogAtom } from '../store/atoms/ui.atoms'
import { lightThemes, darkThemes } from '../themes/themes'
import { ThemeMode } from '../themes/types'

export function ThemeSelector() {
  const { t } = useTranslation()
  const { theme, themeConfig, setTheme, setMode } = useTheme()
  const [, setShowSettingsDialog] = useAtom(showSettingsDialogAtom)
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId)
  }

  const handleModeChange = (mode: ThemeMode) => {
    setMode(mode)
  }

  // Extract base theme name for comparison
  const currentBaseTheme = theme.id.replace(/-light|-dark/, '')

  return (
    <div className="flex items-center gap-2">
      {/* Settings Button */}
      <button
        onClick={() => setShowSettingsDialog(true)}
        className="p-2 rounded-lg glass hover:glass-strong transition-all hover-lift"
        title={t('settings.title')}
      >
        <Settings className="w-5 h-5 text-text-secondary" />
      </button>

      {/* Theme Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg glass hover:glass-strong transition-all hover-lift"
          title={t('theme.selector')}
        >
          <Palette className="w-5 h-5 text-text-secondary" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Theme selector panel */}
            <div className="absolute right-0 top-12 z-50 w-80 glass-strong rounded-xl shadow-2xl border border-white/20 p-4 animate-slide-down">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('theme.selector')}
                </h3>
              </div>

              {/* Mode Selection */}
              <div className="mb-4 p-3 rounded-lg glass">
                <div className="text-sm text-text-secondary mb-2">{t('theme.mode')}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModeChange('light')}
                    className={`flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      themeConfig.mode === 'light'
                        ? 'glass-strong border-2 border-purple-500'
                        : 'glass hover:glass-strong'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">{t('theme.light')}</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('dark')}
                    className={`flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      themeConfig.mode === 'dark'
                        ? 'glass-strong border-2 border-purple-500'
                        : 'glass hover:glass-strong'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">{t('theme.dark')}</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('system')}
                    className={`flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                      themeConfig.mode === 'system'
                        ? 'glass-strong border-2 border-purple-500'
                        : 'glass hover:glass-strong'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">{t('theme.system')}</span>
                  </button>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="mb-2">
                <div className="text-sm text-text-secondary mb-2">{t('theme.colorScheme')}</div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {(theme.isDark ? darkThemes : lightThemes).map((themeOption) => {
                  const baseThemeName = themeOption.id.replace(/-light|-dark/, '')
                  const isSelected = currentBaseTheme === baseThemeName

                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeSelect(baseThemeName)}
                      className={`w-full p-3 rounded-lg transition-all hover-lift ${
                        isSelected
                          ? 'glass-strong border-2 border-purple-500'
                          : 'glass hover:glass-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Theme preview - color circles */}
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg"
                            style={{ backgroundColor: themeOption.colors.primary[500] }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white/20 shadow-lg"
                            style={{ backgroundColor: themeOption.colors.secondary[500] }}
                          />
                        </div>

                        {/* Theme info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {themeOption.name.replace(/ Light| Dark/, '')}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-green-400" />}
                          </div>
                          {themeOption.description && (
                            <p className="text-xs text-text-secondary">{themeOption.description}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Info hint */}
              <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-text-secondary">💡 {t('theme.hint')}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
