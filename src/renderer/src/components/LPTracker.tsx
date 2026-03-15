import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface LPEntry {
  id: string
  timestamp: number
  lp: number
  change: number
  result: 'win' | 'loss' | 'dodge'
}

interface LPTrackerProps {
  onClose: () => void
}

export function LPTracker({ onClose }: LPTrackerProps) {
  const { t } = useTranslation()
  const [entries] = useState<LPEntry[]>([])
  const [currentLP] = useState(0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden border-0 bg-gradient-to-br from-surface/95 to-elevated/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
              <span className="bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                {t('lpTracker.title', 'LP Takip')}
              </span>
            </CardTitle>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface/50 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-auto max-h-[calc(80vh-120px)]">
          {/* Current LP Display */}
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                {t('lpTracker.currentLP', 'Mevcut LP')}
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {currentLP}
              </p>
            </div>
          </div>

          {/* LP History */}
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">
                  {t('lpTracker.noEntries', 'Henüz LP kaydı yok')}
                </p>
                <p className="text-sm text-text-muted mt-2">
                  {t(
                    'lpTracker.noEntriesDescription',
                    'Oyun bittiğinde LP değişiklikleri burada görünecek'
                  )}
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface/50 border border-border/30 hover:border-border/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {entry.change > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : entry.change < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                      <Minus className="w-5 h-5 text-text-muted" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {entry.result === 'win'
                          ? t('lpTracker.win', 'Zafer')
                          : entry.result === 'loss'
                            ? t('lpTracker.loss', 'Mağlubiyet')
                            : t('lpTracker.dodge', 'Dodge')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(entry.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        entry.change > 0
                          ? 'text-green-500'
                          : entry.change < 0
                            ? 'text-red-500'
                            : 'text-text-muted'
                      }`}
                    >
                      {entry.change > 0 ? '+' : ''}
                      {entry.change}
                    </p>
                    <p className="text-xs text-text-secondary">{entry.lp} LP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
