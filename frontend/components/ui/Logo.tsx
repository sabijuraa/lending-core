import Link from 'next/link'

/** The lending-core hexagon mark. */
export function LogoMark({ size = 24, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5" stroke={color} strokeWidth="1.2" fill="none" />
      <polygon
        points="12,5 18,8.5 18,15.5 12,19 6,15.5 6,8.5"
        stroke={color}
        strokeWidth="0.6"
        fill="rgba(23,77,64,0.06)"
        transform="rotate(15 12 12)"
      />
    </svg>
  )
}

/** Mark plus wordmark, linking home by default. */
export function Logo({ href = '/', size = 24, color, textColor = 'var(--text-1)' }: { href?: string; size?: number; color?: string; textColor?: string }) {
  return (
    <Link href={href} aria-label="lending-core home" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
      <LogoMark size={size} color={color} />
      <span style={{ fontSize: 15, fontWeight: 600, color: textColor, letterSpacing: '-0.02em' }}>lending-core</span>
    </Link>
  )
}
