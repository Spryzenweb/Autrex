import { ReactNode } from 'react'

interface ModernCardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'gradient' | 'neumorphic' | 'glow'
  hover?: boolean
}

export function ModernCard({ 
  children, 
  className = '', 
  variant = 'glass',
  hover = true 
}: ModernCardProps) {
  const baseClasses = 'rounded-xl p-4 transition-all duration-300'
  
  const variantClasses = {
    glass: 'glass border border-white/10',
    gradient: 'gradient-gaming text-white',
    neumorphic: 'neumorphic',
    glow: 'glass border border-purple-500/30 glow-primary'
  }

  const hoverClasses = hover ? 'hover-lift hover:shadow-2xl' : ''

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
