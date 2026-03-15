import { ReactNode } from 'react'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react'

interface ModernNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  onClose?: () => void
  children?: ReactNode
}

export function ModernNotification({ 
  type, 
  title, 
  message, 
  onClose, 
  children 
}: ModernNotificationProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    error: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    info: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
  }

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }

  const Icon = icons[type]

  return (
    <div className={`glass-strong border rounded-xl p-4 ${colors[type]} animate-slide-down`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColors[type]}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-white">{title}</h4>
          {message && <p className="text-sm text-text-secondary mt-1">{message}</p>}
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </div>
    </div>
  )
}