import { useState } from 'react'
import { Palette, Check, Monitor, Sun, Moon, Settings as SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { lightThemes, darkThemes } from '../themes/themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Button } from './ui/button'

export function ThemePicker() {
  const { t } = useTranslation()
  const { theme, themeConfig, setTheme, setMode } = useTheme()
  const [open, setOpen] = useState(false)

  // Extract base theme name for comparison
  const currentBaseTheme = theme.id.replace(/-light|-dark/, '')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 rounded-lg"
          aria-label="Theme picker"
        >
          <Palette className="w-5 h-5 text-secondary-600 dark:text-secondary-300 group-hover:text-secondary-800 dark:group-hover:text-secondary-100 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-base font-semibold">{t('theme.settings')}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Mode Selection - Horizontal Buttons */}
        <div className="px-2 py-3">
          <div className="text-xs font-medium text-text-muted mb-2">{t('theme.mode')}</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMode('light')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                themeConfig.mode === 'light'
                  ? 'bg-primary-500/20 border-2 border-primary-500'
                  : 'bg-surface hover:bg-elevated border-2 border-transparent'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs">{t('theme.light')}</span>
            </button>
            <button
              onClick={() => setMode('dark')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                themeConfig.mode === 'dark'
                  ? 'bg-primary-500/20 border-2 border-primary-500'
                  : 'bg-surface hover:bg-elevated border-2 border-transparent'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">{t('theme.dark')}</span>
            </button>
            <button
              onClick={() => setMode('system')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                themeConfig.mode === 'system'
                  ? 'bg-primary-500/20 border-2 border-primary-500'
                  : 'bg-surface hover:bg-elevated border-2 border-transparent'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-xs">{t('theme.system')}</span>
            </button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <DropdownMenuLabel className="text-xs text-text-muted">{t('theme.colorScheme')}</DropdownMenuLabel>

        {/* Show appropriate themes based on current mode */}
        <div className="max-h-[400px] overflow-y-auto">
          {(theme.isDark ? darkThemes : lightThemes).map((themeOption) => {
            const baseThemeName = themeOption.id.replace(/-light|-dark/, '')
            const isSelected = currentBaseTheme === baseThemeName

            return (
              <DropdownMenuItem
                key={themeOption.id}
                onClick={() => setTheme(baseThemeName)}
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: themeOption.colors.primary[500] }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
                      style={{ backgroundColor: themeOption.colors.secondary[500] }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {themeOption.name.replace(/ Light| Dark/, '')}
                    </div>
                    {themeOption.description && (
                      <div className="text-xs text-text-muted line-clamp-1">
                        {themeOption.description}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />}
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator />

        {/* Info Footer */}
        <div className="px-2 py-2">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <SettingsIcon className="w-3 h-3" />
            <span>{t('theme.systemModeHint')}</span>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
