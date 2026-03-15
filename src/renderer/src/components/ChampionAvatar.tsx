import { useMemo, useState } from 'react'
import { Badge } from './ui/badge'

interface ChampionAvatarProps {
  championName: string
  championKey?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
  showTooltip?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-lg'
}

/**
 * Champion avatar component with real champion images
 * Falls back to text-based initials if image fails to load
 */
export function ChampionAvatar({
  championName,
  championKey,
  size = 'md',
  variant = 'default',
  className = '',
  showTooltip = true
}: ChampionAvatarProps) {
  const [imageError, setImageError] = useState(false)
  // Generate initials from champion name
  const initials = useMemo(() => {
    if (!championName) return '?'

    // Handle special cases
    const specialCases: Record<string, string> = {
      "Kai'Sa": 'KS',
      "Cho'Gath": 'CG',
      "Kog'Maw": 'KM',
      "Kha'Zix": 'KZ',
      "Vel'Koz": 'VK',
      "Rek'Sai": 'RS',
      "Bel'Veth": 'BV'
    }

    if (specialCases[championName]) {
      return specialCases[championName]
    }

    // Split by spaces and take first letter of each word
    const words = championName.split(' ')
    if (words.length > 1) {
      return words
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    // For single words, take first two letters
    return championName.slice(0, 2).toUpperCase()
  }, [championName])

  // Generate consistent color based on champion name
  const backgroundColor = useMemo(() => {
    if (!championName) return 'hsl(0, 0%, 50%)'

    // Simple hash function to generate consistent colors
    let hash = 0
    for (let i = 0; i < championName.length; i++) {
      hash = championName.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Generate HSL color with good contrast
    const hue = Math.abs(hash) % 360
    const saturation = 60 + (Math.abs(hash) % 30) // 60-90%
    const lightness = 45 + (Math.abs(hash) % 20) // 45-65%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }, [championName])

  const textColor = useMemo(() => {
    // Calculate if we need light or dark text based on background
    if (!championName) return 'white'

    let hash = 0
    for (let i = 0; i < championName.length; i++) {
      hash = championName.charCodeAt(i) + ((hash << 5) - hash)
    }

    const lightness = 45 + (Math.abs(hash) % 20)
    return lightness > 55 ? 'black' : 'white'
  }, [championName])

  // Generate champion image URL
  const championImageUrl = useMemo(() => {
    if (!championKey && !championName) return null

    // Use championKey if available, otherwise use championName
    const key = championKey || championName

    // Data Dragon CDN URL for champion square images
    return `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${key}.png`
  }, [championKey, championName])

  // If image failed or no URL, show text-based avatar
  if (imageError || !championImageUrl) {
    return (
      <Badge
        variant={variant}
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          font-bold
          border-2
          transition-all duration-200
          hover:scale-105
          cursor-pointer
          ${className}
        `}
        style={{
          backgroundColor,
          color: textColor,
          borderColor: variant === 'outline' ? backgroundColor : 'transparent'
        }}
        title={showTooltip ? championName : undefined}
      >
        {initials}
      </Badge>
    )
  }

  // Show image-based avatar
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        overflow-hidden
        border-2
        transition-all duration-200
        hover:scale-105
        cursor-pointer
        ${variant === 'outline' ? 'border-primary-500' : 'border-border/50'}
        ${className}
      `}
      title={showTooltip ? championName : undefined}
    >
      <img
        src={championImageUrl}
        alt={championName}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  )
}

/**
 * Utility function to get champion display color
 */
export function getChampionColor(championName: string): string {
  if (!championName) return 'hsl(0, 0%, 50%)'

  let hash = 0
  for (let i = 0; i < championName.length; i++) {
    hash = championName.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  const saturation = 60 + (Math.abs(hash) % 30)
  const lightness = 45 + (Math.abs(hash) % 20)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
