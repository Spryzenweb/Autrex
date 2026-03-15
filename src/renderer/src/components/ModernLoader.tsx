interface ModernLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'pulse' | 'dots' | 'gradient'
  text?: string
}

export function ModernLoader({ 
  size = 'md', 
  variant = 'spinner', 
  text 
}: ModernLoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={`${sizeClasses[size]} border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin`} />
        )
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse`} />
        )
      
      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )
      
      case 'gradient':
        return (
          <div className={`${sizeClasses[size]} gradient-animated rounded-full animate-spin`} />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {renderLoader()}
      {text && (
        <p className="text-sm text-text-secondary animate-pulse">{text}</p>
      )}
    </div>
  )
}