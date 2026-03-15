interface LogoIconProps {
  size?: number
  className?: string
}

/**
 * SVG-based logo icon component that replaces PNG logo
 * Provides better performance and scalability
 */
export function LogoIcon({ size = 20, className = '' }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern geometric logo design */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Main logo shape - stylized "A" for Autrex */}
      <path
        d="M12 2L4 20h3.5l1.5-4h6l1.5 4H20L12 2z"
        fill="url(#logoGradient)"
        stroke="currentColor"
        strokeWidth="0.5"
      />

      {/* Inner accent */}
      <path d="M12 6L9.5 14h5L12 6z" fill="rgba(255,255,255,0.2)" />

      {/* Bottom accent line */}
      <rect x="8" y="18" width="8" height="2" rx="1" fill="url(#logoGradient)" opacity="0.8" />
    </svg>
  )
}
