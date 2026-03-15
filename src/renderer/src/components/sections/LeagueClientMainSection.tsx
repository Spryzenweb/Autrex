import { useAtom, useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Wifi, WifiOff, Crown, UserCheck, Ban, AlertCircle } from 'lucide-react'
import {
  autoAcceptEnabledAtom,
  autoPickEnabledAtom,
  autoBanEnabledAtom,
  autoPickForceAtom,
  autoBanForceAtom,
  lcuConnectedAtom
} from '../../store/atoms/lcu.atoms'
import {
  leagueClientEnabledAtom,
  championDetectionEnabledAtom
} from '../../store/atoms/settings.atoms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { AutoPickChampionSelector } from '../AutoPickChampionSelector'
import { AutoBanChampionSelector } from '../AutoBanChampionSelector'
import { RemoteControlPanel } from '../RemoteControlPanel'
import { AutoRuneSelector } from '../AutoRuneSelector'
import { SpellSelector } from '../SpellSelector'
import bannerImage from '../../assets/auimg.png'

export function LeagueClientMainSection() {
  const { t } = useTranslation()
  const lcuConnected = useAtomValue(lcuConnectedAtom)

  // State definitions
  const [leagueClientEnabled, setLeagueClientEnabled] = useAtom(leagueClientEnabledAtom)
  const [championDetectionEnabled, setChampionDetectionEnabled] = useAtom(
    championDetectionEnabledAtom
  )

  // Auto feature states
  const [autoAcceptEnabled, setAutoAcceptEnabled] = useAtom(autoAcceptEnabledAtom)
  const [autoPickEnabled, setAutoPickEnabled] = useAtom(autoPickEnabledAtom)
  const [autoBanEnabled, setAutoBanEnabled] = useAtom(autoBanEnabledAtom)

  // Force options
  const [autoPickForce, setAutoPickForce] = useAtom(autoPickForceAtom)
  const [autoBanForce, setAutoBanForce] = useAtom(autoBanForceAtom)

  // Handle master toggle changes
  const handleLeagueClientEnabledChange = async (checked: boolean) => {
    setLeagueClientEnabled(checked)
    try {
      await window.api.setSettings('leagueClientEnabled', checked)

      // If disabling, also disable all dependent features
      if (!checked) {
        setAutoAcceptEnabled(false)
        setAutoPickEnabled(false)
        setAutoBanEnabled(false)
        setAutoPickForce(false)
        setAutoBanForce(false)

        await window.api.setSettings('autoAcceptEnabled', false)
        await window.api.setSettings('autoPickEnabled', false)
        await window.api.setSettings('autoBanEnabled', false)
        await window.api.setSettings('autoPickForce', false)
        await window.api.setSettings('autoBanForce', false)
      }
    } catch (error) {
      console.error('Failed to save League Client setting:', error)
    }
  }

  const handleChampionDetectionChange = async (checked: boolean) => {
    setChampionDetectionEnabled(checked)
    try {
      await window.api.setSettings('championDetectionEnabled', checked)
    } catch (error) {
      console.error('Failed to save champion detection setting:', error)
    }
  }

  // Handle auto feature changes
  const handleAutoAcceptEnabledChange = async (checked: boolean) => {
    setAutoAcceptEnabled(checked)
    try {
      await window.api.setSettings('autoAcceptEnabled', checked)
    } catch (error) {
      console.error('Failed to save auto accept setting:', error)
    }
  }

  const handleAutoPickEnabledChange = async (checked: boolean) => {
    setAutoPickEnabled(checked)
    try {
      await window.api.setSettings('autoPickEnabled', checked)

      // If disabling, also disable force mode
      if (!checked) {
        setAutoPickForce(false)
        await window.api.setSettings('autoPickForce', false)
      }
    } catch (error) {
      console.error('Failed to save auto pick setting:', error)
    }
  }

  const handleAutoBanEnabledChange = async (checked: boolean) => {
    setAutoBanEnabled(checked)
    try {
      await window.api.setSettings('autoBanEnabled', checked)

      // If disabling, also disable force mode
      if (!checked) {
        setAutoBanForce(false)
        await window.api.setSettings('autoBanForce', false)
      }
    } catch (error) {
      console.error('Failed to save auto ban setting:', error)
    }
  }

  const handleAutoPickForceChange = async (checked: boolean) => {
    setAutoPickForce(checked)
    try {
      await window.api.setSettings('autoPickForce', checked)
    } catch (error) {
      console.error('Failed to save auto pick force setting:', error)
    }
  }

  const handleAutoBanForceChange = async (checked: boolean) => {
    setAutoBanForce(checked)
    try {
      await window.api.setSettings('autoBanForce', checked)
    } catch (error) {
      console.error('Failed to save auto ban force setting:', error)
    }
  }

  const features = [
    {
      id: 'auto-accept',
      title: t('settings.autoAccept.title', 'Otomatik Kabul'),
      description: t(
        'settings.autoAccept.description',
        'Maç hazır kontrollerini otomatik kabul et'
      ),
      icon: CheckCircle,
      enabled: autoAcceptEnabled,
      status: leagueClientEnabled && autoAcceptEnabled ? 'active' : 'inactive',
      color: 'blue',
      hasForce: false
    },
    {
      id: 'auto-pick',
      title: t('settings.autoPick.title', 'Otomatik Seçim'),
      description: t('settings.autoPick.description', 'Şampiyon seçiminde otomatik şampiyon seç'),
      icon: UserCheck,
      enabled: autoPickEnabled,
      status: leagueClientEnabled && autoPickEnabled ? 'active' : 'inactive',
      color: 'green',
      hasForce: true,
      forceEnabled: autoPickForce
    },
    {
      id: 'auto-ban',
      title: t('settings.autoBan.title', 'Otomatik Yasaklama'),
      description: t(
        'settings.autoBan.description',
        'Şampiyon seçiminde otomatik şampiyon yasakla'
      ),
      icon: Ban,
      enabled: autoBanEnabled,
      status: leagueClientEnabled && autoBanEnabled ? 'active' : 'inactive',
      color: 'red',
      hasForce: true,
      forceEnabled: autoBanForce
    }
  ]

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-surface overflow-hidden">
      {/* Header */}
      <div className="relative flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-surface/50 to-elevated/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 backdrop-blur-sm border border-primary-500/20">
              <Crown className="w-6 h-6 text-primary-500" />
            </div>
            {t('leagueClient.title', 'League Client Features')}
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            {t('leagueClient.description', 'Manage League of Legends client automation features')}
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          {lcuConnected ? (
            <Badge
              variant="default"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg shadow-green-500/25 animate-pulse"
            >
              <Wifi className="w-3 h-3 mr-2" />
              {t('leagueClient.connected', 'Connected')}
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 border border-red-500/20"
            >
              <WifiOff className="w-3 h-3 mr-2" />
              {t('leagueClient.disconnected', 'Disconnected')}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-8">
          {/* Banner Image */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={bannerImage}
              alt="Autrex Banner"
              className="w-full h-auto object-cover max-h-64"
            />
          </div>

          {/* Disabled Warning */}
          {!leagueClientEnabled && (
            <Card className="border-0 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-yellow-500/10 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  {t('leagueClient.disabled.title', 'League Client Integration Disabled')}
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300 ml-11">
                  {t(
                    'leagueClient.disabled.description',
                    'Enable League Client integration above to use these features.'
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Feature Status Cards - Side by Side */}
          {leagueClientEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                const isAutoAccept = feature.id === 'auto-accept'
                const isAutoPick = feature.id === 'auto-pick'
                const isAutoBan = feature.id === 'auto-ban'

                const gradientColors = {
                  blue: 'from-blue-500/20 to-cyan-500/20',
                  green: 'from-green-500/20 to-emerald-500/20',
                  red: 'from-red-500/20 to-pink-500/20'
                }

                const iconColors = {
                  blue: 'text-blue-500',
                  green: 'text-green-500',
                  red: 'text-red-500'
                }

                return (
                  <Card
                    key={feature.id}
                    className={`group relative overflow-hidden border-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                      feature.status === 'active'
                        ? `bg-gradient-to-br ${gradientColors[feature.color]} backdrop-blur-sm shadow-lg animate-slide-up`
                        : 'bg-gradient-to-br from-surface/80 to-elevated/60 backdrop-blur-sm shadow-md hover:shadow-lg'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${gradientColors[feature.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    ></div>
                    <CardHeader className="relative z-10 pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${gradientColors[feature.color]} backdrop-blur-sm border border-${feature.color}-500/20`}
                        >
                          <Icon className={`w-4 h-4 ${iconColors[feature.color]}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={feature.status === 'active' ? 'default' : 'secondary'}
                            className={
                              feature.status === 'active'
                                ? `bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 text-white border-0 shadow-md shadow-${feature.color}-500/25 text-xs`
                                : 'bg-surface/80 backdrop-blur-sm text-xs'
                            }
                          >
                            {feature.status === 'active'
                              ? t('leagueClient.status.active', 'Active')
                              : t('leagueClient.status.inactive', 'Inactive')}
                          </Badge>
                          <Switch
                            checked={feature.enabled}
                            onCheckedChange={(checked) => {
                              if (isAutoAccept) handleAutoAcceptEnabledChange(checked)
                              else if (isAutoPick) handleAutoPickEnabledChange(checked)
                              else if (isAutoBan) handleAutoBanEnabledChange(checked)
                            }}
                            className={`data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-${feature.color}-500 data-[state=checked]:to-${feature.color}-600`}
                          />
                        </div>
                      </div>
                      <CardTitle className="text-base mt-2 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-3">
                      <CardDescription className="text-sm text-text-secondary">
                        {feature.description}
                      </CardDescription>

                      {/* Force Options */}
                      {feature.hasForce && feature.enabled && (
                        <div className="pt-3 border-t border-border/30">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-surface/30 to-elevated/20 backdrop-blur-sm">
                            <div className="flex-1">
                              <h4 className="text-xs font-semibold text-text-primary flex items-center gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-500`}
                                ></div>
                                {isAutoPick
                                  ? t('settings.autoPick.force', 'Zorla Seç')
                                  : t('settings.autoBan.force', 'Zorla Yasakla')}
                              </h4>
                              <p className="text-xs text-text-secondary mt-1 ml-3.5">
                                {isAutoPick
                                  ? t(
                                      'settings.autoPick.forceDescription',
                                      'Zaten seçilmiş şampiyonları da seç'
                                    )
                                  : t(
                                      'settings.autoBan.forceDescription',
                                      'Takım arkadaşının istediği şampiyonu da yasakla'
                                    )}
                              </p>
                            </div>
                            <Switch
                              checked={feature.forceEnabled || false}
                              onCheckedChange={(checked) => {
                                if (isAutoPick) handleAutoPickForceChange(checked)
                                else if (isAutoBan) handleAutoBanForceChange(checked)
                              }}
                              className={`data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-${feature.color}-500 data-[state=checked]:to-${feature.color}-600`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Champion Selection - Integrated directly into feature cards */}
                      {feature.enabled && leagueClientEnabled && (
                        <div className="pt-3 border-t border-border/30">
                          <div className="space-y-2">
                            {isAutoPick && (
                              <AutoPickChampionSelector disabled={!leagueClientEnabled} />
                            )}
                            {isAutoBan && (
                              <AutoBanChampionSelector disabled={!leagueClientEnabled} />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Rune & Spell Selectors - Compact Buttons */}
          {leagueClientEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auto Rune Selector Button */}
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-blue-500/10 backdrop-blur-sm shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative z-10 p-4">
                  <AutoRuneSelector disabled={!leagueClientEnabled} />
                </CardContent>
              </Card>

              {/* Spell Selector Button */}
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-orange-500/10 backdrop-blur-sm shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative z-10 p-4">
                  <SpellSelector disabled={!leagueClientEnabled} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Remote Control Panel */}
          {leagueClientEnabled && (
            <div className="mt-6">
              <RemoteControlPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
