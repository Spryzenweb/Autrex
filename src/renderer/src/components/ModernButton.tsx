import { ReactNode, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'neon' | 'cyber'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  glow?: boolean
}

export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  glow = false,
  className = '',
  disabled,
  ...props
}: ModernButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const variantClasses = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'glass hover:glass-strong text-white border border-white/20',
    ghost: 'hover:glass text-text-primary',
    gradient: 'gradient-gaming text-white shadow-lg hover:shadow-xl hover:scale-105',
    neon: 'gradient-neon text-white shadow-lg glow-neon hover:shadow-2xl hover:scale-105',
    cyber: 'gradient-cyber text-white shadow-lg glow-cyber hover:shadow-2xl hover:scale-105'
  }

  const glowClasses = glow ? 'pulse-glow' : ''
  const disabledClasses = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover-lift'

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${glowClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}