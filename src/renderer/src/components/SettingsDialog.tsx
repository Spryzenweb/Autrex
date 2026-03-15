import { Settings, Shield, MessageSquare, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { LicenseManagement } from './LicenseManagement'
import { VersionInfo } from './VersionInfo'
import { AutoMessageSettings } from './AutoMessageSettings'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { useTheme } from '../contexts/ThemeContext'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { t } = useTranslation()
  const { themeConfig, setMode, availableThemes, setTheme } = useTheme()

  // Mevcut tema sisteminden tema seçeneklerini oluştur
  const themeOptions = [
    {
      id: 'default',
      name: 'Varsayılan',
      gradient: 'linear-gradient(135deg, #d4654e 0%, #c24b35 100%)',
      description: 'Klasik Autrex teması'
    },
    {
      id: 'ocean',
      name: 'Okyanus',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)',
      description: 'Deniz mavisi teması'
    },
    {
      id: 'bikkuri',
      name: 'Bikkuri',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #eab308 100%)',
      description: 'Canlı pembe-sarı tema'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      gradient: 'linear-gradient(135deg, #d946ef 0%, #06b6d4 100%)',
      description: 'Neon siber punk teması'
    },
    {
      id: 'night',
      name: 'Gece',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #64748b 100%)',
      description: 'Sakin gece teması'
    },
    {
      id: 'afterdark',
      name: 'Gece Sonrası',
      gradient: 'linear-gradient(135deg, #d97706 0%, #7c3aed 100%)',
      description: 'Siyah arka plan teması'
    }
  ]

  const handleThemeSelect = (themeId: string) => {
    // Apply CSS variables based on theme
    const root = document.documentElement
    
    switch (themeId) {
      case 'neon':
        root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)')
        root.style.setProperty('--color-primary', '#f093fb')
        root.style.setProperty('--color-secondary', '#f5576c')
        break
      case 'cyber':
        root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)')
        root.style.setProperty('--color-primary', '#4facfe')
        root.style.setProperty('--color-secondary', '#00f2fe')
        break
      case 'forest':
        root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)')
        root.style.setProperty('--color-primary', '#56ab2f')
        root.style.setProperty('--color-secondary', '#a8e063')
        break
      case 'sunset':
        root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)')
        root.style.setProperty('--color-primary', '#fa709a')
        root.style.setProperty('--color-secondary', '#fee140')
        break
      default:
        root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
        root.style.setProperty('--color-primary', '#667eea')
        root.style.setProperty('--color-secondary', '#764ba2')
    }
    
    // Update theme context
    setTheme(themeId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>{t('settings.description')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="license" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="license" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('license.title', 'Lisans')}
            </TabsTrigger>
            <TabsTrigger value="automessage" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Oto Mesaj
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="version" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Sürüm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="license" className="space-y-6 mt-6">
            <LicenseManagement />
          </TabsContent>

          <TabsContent value="automessage" className="space-y-6 mt-6">
            <AutoMessageSettings />
          </TabsContent>

          <TabsContent value="theme" className="space-y-6 mt-6">
            {/* Theme Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Tema Ayarları
                </h3>
                <p className="text-sm text-text-secondary">
                  Uygulamanın görünümünü özelleştirin
                </p>
              </div>

              {/* Dark/Light Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-elevated border border-border">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-white">Karanlık Mod</Label>
                  <p className="text-xs text-text-secondary">
                    Aydınlık ve karanlık mod arasında geçiş yapın
                  </p>
                </div>
                <Switch
                  checked={themeConfig.mode === 'dark'}
                  onCheckedChange={(checked) => setMode(checked ? 'dark' : 'light')}
                />
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">Tema Seçimi</Label>
                <div className="grid grid-cols-2 gap-3">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        themeConfig.themeId === theme.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-surface/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Theme preview */}
                        <div
                          className="w-8 h-8 rounded-lg shadow-lg"
                          style={{ background: theme.gradient }}
                        />

                        {/* Theme info */}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-white">{theme.name}</p>
                          <p className="text-xs text-text-secondary">{theme.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preview */}
              <div className="p-4 rounded-lg bg-surface/50 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <Palette className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-white">Tema Önizleme</p>
                    <p className="text-xs text-text-secondary">
                      Seçtiğiniz tema anında uygulanır. Değişiklikleri görmek için farklı
                      sayfalara geçin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="version" className="space-y-6 mt-6">
            <VersionInfo />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <button
            className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            onClick={onClose}
          >
            {t('actions.close')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
