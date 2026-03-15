interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading' | 'error' | 'success'
  text?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export function StatusIndicator({ 
  status, 
  text, 
  size = 'md', 
  animated = true 
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    loading: 'bg-yellow-500',
    error: 'bg-red-500',
    success: 'bg-emerald-500'
  }

  const glowClasses = {
    online: 'shadow-green-500/50',
    offline: 'shadow-gray-500/50',
    loading: 'shadow-yellow-500/50',
    error: 'shadow-red-500/50',
    success: 'shadow-emerald-500/50'
  }

  return (
    <div className="flex items-center gap-2">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[status]} 
          rounded-full 
          ${animated ? 'breathe' : ''}
          shadow-lg ${glowClasses[status]}
        `} 
      />
      {text && (
        <span className="text-sm text-text-secondary">{text}</span>
      )}
    </div>
  )
}