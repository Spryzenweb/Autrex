import { useState, useEffect } from 'react'
import { Loader2, Save, RotateCcw, Upload, Download, Lock, Unlock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface GameSetting {
  name: string
  value: string | number | boolean
  type: 'string' | 'number' | 'boolean'
}

interface SettingsSection {
  name: string
  settings: GameSetting[]
}

export default function SettingsEditorTab() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState<SettingsSection[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [isLocked, setIsLocked] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsLoad()
      if (result.success && result.sections) {
        setSections(result.sections)
        if (result.sections.length > 0 && !activeTab) {
          setActiveTab(result.sections[0].name)
        }
        setIsLocked(result.isLocked || false)

        if (result.sections.length === 0) {
          toast.warning(t('settingsEditor.noFilesFound'))
        } else {
          toast.success(t('settingsEditor.settingsLoaded'))
        }
      } else {
        toast.error(result.error || t('settingsEditor.loadFailed'))
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error)
      toast.error(t('settingsEditor.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsSave({ sections })
      if (result.success) {
        toast.success(t('settingsEditor.settingsSaved'))
        setHasChanges(false)
      } else {
        toast.error(result.error || t('settingsEditor.saveFailed'))
      }
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
      toast.error(t('settingsEditor.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = async () => {
    if (!confirm(t('settingsEditor.confirmReset'))) {
      return
    }
    await loadSettings()
    setHasChanges(false)
    toast.info(t('settingsEditor.settingsReset'))
  }

  const exportSettings = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsExport()
      if (result.success) {
        toast.success(t('settingsEditor.settingsExported'))
      } else {
        toast.error(result.error || t('settingsEditor.exportFailed'))
      }
    } catch (error) {
      console.error('Dışa aktarılamadı:', error)
      toast.error(t('settingsEditor.exportFailed'))
    } finally {
      setLoading(false)
    }
  }

  const importSettings = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsImport()
      if (result.success) {
        toast.success(t('settingsEditor.settingsImported'))
        await loadSettings()
      } else {
        toast.error(result.error || t('settingsEditor.importFailed'))
      }
    } catch (error) {
      console.error('İçe aktarılamadı:', error)
      toast.error(t('settingsEditor.importFailed'))
    } finally {
      setLoading(false)
    }
  }

  const toggleLock = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsToggleLock({ lock: !isLocked })
      if (result.success) {
        setIsLocked(!isLocked)
        toast.success(isLocked ? t('settingsEditor.settingsUnlocked') : t('settingsEditor.settingsLocked'))
      } else {
        toast.error(result.error || t('settingsEditor.lockFailed'))
      }
    } catch (error) {
      console.error('Kilit değiştirilemedi:', error)
      toast.error(t('settingsEditor.lockFailed'))
    } finally {
      setLoading(false)
    }
  }

  const applyToClient = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsApplyToClient({ sections })
      if (result.success) {
        toast.success(t('settingsEditor.appliedToClient'))
      } else {
        toast.error(result.error || t('settingsEditor.applyFailed'))
      }
    } catch (error) {
      console.error('Uygulanamadı:', error)
      toast.error(t('settingsEditor.applyFailed'))
    } finally {
      setLoading(false)
    }
  }

  const applyToAccount = async () => {
    setLoading(true)
    try {
      const result = await window.api.settingsApplyToAccount({ sections })
      if (result.success) {
        toast.success(t('settingsEditor.appliedToAccount'))
      } else {
        toast.error(result.error || t('settingsEditor.applyFailed'))
      }
    } catch (error) {
      console.error('Uygulanamadı:', error)
      toast.error(t('settingsEditor.applyFailed'))
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (sectionName: string, settingName: string, value: any) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.name === sectionName) {
          return {
            ...section,
            settings: section.settings.map((setting) =>
              setting.name === settingName ? { ...setting, value } : setting
            )
          }
        }
        return section
      })
    )
    setHasChanges(true)
  }

  const activeSection = sections.find((s) => s.name === activeTab)

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('settingsEditor.title')}</h2>
            <p className="text-sm text-gray-400">{t('settingsEditor.description')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveSettings}
              disabled={loading || !hasChanges}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t('settingsEditor.save')}
            </button>
            <button
              onClick={resetSettings}
              disabled={loading || !hasChanges}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('settingsEditor.reset')}
            </button>
            <button
              onClick={exportSettings}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('settingsEditor.export')}
            </button>
            <button
              onClick={importSettings}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('settingsEditor.import')}
            </button>
            <button
              onClick={toggleLock}
              disabled={loading}
              className={`px-4 py-2 ${isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-600 rounded-lg flex items-center gap-2`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {isLocked ? t('settingsEditor.lock') : t('settingsEditor.unlock')}
            </button>
          </div>
        </div>
      </div>

      {/* Apply Buttons */}
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex gap-3">
          <button
            onClick={applyToClient}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg"
          >
            {t('settingsEditor.applyToClient')}
          </button>
          <button
            onClick={applyToAccount}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded-lg"
          >
            {t('settingsEditor.applyToAccount')}
          </button>
        </div>
      </div>

      {/* Settings Editor */}
      <div
        className="bg-[#1a1a1a] rounded-lg border border-gray-700 flex"
        style={{ height: '600px' }}
      >
        {sections.length === 0 && !loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-400 mb-4">{t('settingsEditor.noFilesFound')}</p>
              <p className="text-sm text-gray-500 mb-4">{t('settingsEditor.ensureGameInstalled')}</p>
              <button
                onClick={loadSettings}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                {t('settingsEditor.retryLoad')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Sidebar */}
            <div className="w-48 border-r border-gray-700 overflow-y-auto">
              {sections.map((section) => (
                <button
                  key={section.name}
                  onClick={() => setActiveTab(section.name)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                    activeTab === section.name
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-300'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : activeSection ? (
                <div className="space-y-4">
                  {activeSection.settings.map((setting) => (
                    <div key={setting.name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        {setting.name}
                      </label>
                      {setting.type === 'boolean' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.value as boolean}
                            onChange={(e) =>
                              updateSetting(activeSection.name, setting.name, e.target.checked)
                            }
                            disabled={isLocked}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm text-gray-400">
                            {setting.value ? t('settingsEditor.active') : t('settingsEditor.inactive')}
                          </span>
                        </label>
                      ) : setting.type === 'number' ? (
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={setting.value as number}
                            onChange={(e) =>
                              updateSetting(
                                activeSection.name,
                                setting.name,
                                parseFloat(e.target.value)
                              )
                            }
                            disabled={isLocked}
                            className="w-full"
                          />
                          <input
                            type="number"
                            value={setting.value as number}
                            onChange={(e) =>
                              updateSetting(
                                activeSection.name,
                                setting.name,
                                parseFloat(e.target.value)
                              )
                            }
                            disabled={isLocked}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={setting.value as string}
                          onChange={(e) =>
                            updateSetting(activeSection.name, setting.name, e.target.value)
                          }
                          disabled={isLocked}
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {t('settingsEditor.selectTab')}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
