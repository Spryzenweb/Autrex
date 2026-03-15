import { useAtomValue } from 'jotai'
import { licenseAtom, LicenseType } from '../store/atoms/license.atoms'
import { Shield, Clock, AlertTriangle } from 'lucide-react'

export function LicenseStatus() {
  const license = useAtomValue(licenseAtom)

  if (!license.isActivated || !license.licenseInfo) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span className="font-medium">Lisans Yok</span>
      </div>
    )
  }

  const getLicenseTypeLabel = (type: LicenseType): string => {
    const typeMap: Record<LicenseType, string> = {
      [LicenseType.REGULAR]: 'Ömür Boyu',
      [LicenseType.DAILY]: 'Günlük',
      [LicenseType.WEEKLY]: 'Haftalık',
      [LicenseType.MONTHLY]: 'Aylık',
      [LicenseType.TRIAL]: 'Deneme'
    }
    return typeMap[type] || 'Bilinmeyen'
  }

  const getStatusColor = () => {
    if (!license.expiresAt)
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'

    const expiresDate = new Date(license.expiresAt)
    const now = new Date()
    const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 0) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    if (daysLeft <= 1)
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    if (daysLeft <= 7)
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'

    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${getStatusColor()}`}>
      <Shield className="w-4 h-4" />
      <div className="flex items-center gap-2">
        <span className="font-medium">{getLicenseTypeLabel(license.licenseInfo.type)}</span>
        {license.remainingTime && (
          <>
            <span className="opacity-50">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{license.remainingTime}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
