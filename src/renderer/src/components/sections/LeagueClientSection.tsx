import { useAtomValue } from 'jotai'
import { CheckCircle, Shield, Target, Settings, Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { leagueClientEnabledAtom } from '../../store/atoms/settings.atoms'
import {
  autoAcceptEnabledAtom,
  autoPickEnabledAtom,
  autoBanEnabledAtom,
  lcuConnectedAtom
} from '../../store/atoms/lcu.atoms'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

export function LeagueClientSection() {
  const { t } = useTranslation()
  const lcuConnected = useAtomValue(lcuConnectedAtom)
  const leagueClientEnabled = useAtomValue(leagueClientEnabledAtom)
  const autoAcceptEnabled = useAtomValue(autoAcceptEnabledAtom)
  const autoPickEnabled = useAtomValue(autoPickEnabledAtom)
  const autoBanEnabled = useAtomValue(autoBanEnabledAtom)

  const features = [
    {
      id: 'auto-accept',
      title: t('settings.autoAccept.title', 'Auto Accept'),
      description: t('settings.autoAccept.description', 'Automatically accept match ready checks'),
      icon: CheckCircle,
      enabled: autoAcceptEnabled,
      status: leagueClientEnabled && autoAcceptEnabled ? 'active' : 'inactive'
    },
    {
      id: 'auto-ban',
      title: t('settings.autoBan.title', 'Auto Ban'),
      description: t(
        'settings.autoBan.description',
        'Automatically ban champions during champion select'
      ),
      icon: Shield,
      enabled: autoBanEnabled,
      status: leagueClientEnabled && autoBanEnabled ? 'active' : 'inactive'
    },
    {
      id: 'auto-pick',
      title: t('settings.autoPick.title', 'Auto Pick'),
      description: t(
        'settings.autoPick.description',
        'Automatically pick champions during champion select'
      ),
      icon: Target,
      enabled: autoPickEnabled,
      status: leagueClientEnabled && autoPickEnabled ? 'active' : 'inactive'
    }
  ]

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">
            {t('leagueClient.title', 'League Client Features')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'leagueClient.description',
              'Manage your League of Legends client automation features'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lcuConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              {t('leagueClient.connected', 'Connected')}
            </Badge>
          ) : (
            <Badge variant="secondary">
              <WifiOff className="w-3 h-3 mr-1" />
              {t('leagueClient.disconnected', 'Disconnected')}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {!leagueClientEnabled && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">
                {t('leagueClient.disabled.title', 'League Client Integration Disabled')}
              </CardTitle>
              <CardDescription className="text-orange-700">
                {t(
                  'leagueClient.disabled.description',
                  'Enable League Client integration in settings to use these features.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="border-orange-300 text-orange-800 hover:bg-orange-100"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('leagueClient.openSettings', 'Open Settings')}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.id}
                className={`transition-all ${
                  feature.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`w-5 h-5 ${
                        feature.status === 'active' ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                    <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                      {feature.status === 'active'
                        ? t('leagueClient.status.active', 'Active')
                        : t('leagueClient.status.inactive', 'Inactive')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('leagueClient.instructions.title', 'How to Use')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                {t('leagueClient.instructions.step1', 'Make sure League of Legends is running')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  'leagueClient.instructions.step2',
                  'Enable League Client integration in Settings'
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  'leagueClient.instructions.step3',
                  'Configure your preferred automation features'
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                4
              </div>
              <p className="text-sm text-muted-foreground">
                {t(
                  'leagueClient.instructions.step4',
                  'Features will activate automatically during matches'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
