'use client'

// Token color/icon mapping matching the reference design
const TOKEN_CONFIG: Record<string, { bg: string; shadow: string; icon: React.ReactNode }> = {
  WETH: {
    bg: 'linear-gradient(135deg, #627EEA 0%, #4A6DE5 100%)',
    shadow: 'rgba(98,126,234,0.3)',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" style={{ width: '55%', height: '55%' }}>
        <path d="M9 1L3 9.5L9 7V1Z" fill="rgba(255,255,255,0.85)" />
        <path d="M9 1L15 9.5L9 7V1Z" fill="rgba(255,255,255,0.6)" />
        <path d="M9 12.5L3 10L9 8V12.5Z" fill="rgba(255,255,255,0.9)" />
        <path d="M9 12.5L15 10L9 8V12.5Z" fill="rgba(255,255,255,0.7)" />
        <path d="M9 13.5L3 11L9 17V13.5Z" fill="rgba(255,255,255,0.85)" />
        <path d="M9 13.5L15 11L9 17V13.5Z" fill="rgba(255,255,255,0.6)" />
      </svg>
    ),
  },
  ETH: {
    bg: 'linear-gradient(135deg, #627EEA 0%, #4A6DE5 100%)',
    shadow: 'rgba(98,126,234,0.3)',
    icon: (
      <svg viewBox="0 0 18 18" fill="none" style={{ width: '55%', height: '55%' }}>
        <path d="M9 1L3 9.5L9 7V1Z" fill="rgba(255,255,255,0.85)" />
        <path d="M9 1L15 9.5L9 7V1Z" fill="rgba(255,255,255,0.6)" />
        <path d="M9 12.5L3 10L9 8V12.5Z" fill="rgba(255,255,255,0.9)" />
        <path d="M9 12.5L15 10L9 8V12.5Z" fill="rgba(255,255,255,0.7)" />
        <path d="M9 13.5L3 11L9 17V13.5Z" fill="rgba(255,255,255,0.85)" />
        <path d="M9 13.5L15 11L9 17V13.5Z" fill="rgba(255,255,255,0.6)" />
      </svg>
    ),
  },
  USDC: {
    bg: 'linear-gradient(135deg, #2775CA 0%, #1A5FB4 100%)',
    shadow: 'rgba(39,117,202,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '60%', height: '60%' }}>
        <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" fontFamily="Arial, sans-serif">$</text>
      </svg>
    ),
  },
  USDT: {
    bg: 'linear-gradient(135deg, #26A17B 0%, #1E8B6B 100%)',
    shadow: 'rgba(38,161,123,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '50%', height: '50%' }}>
        <path d="M10 4V16M6 7H14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  DAI: {
    bg: 'linear-gradient(135deg, #F5AC37 0%, #D4941E 100%)',
    shadow: 'rgba(245,172,55,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">D</text>
      </svg>
    ),
  },
  WBTC: {
    bg: 'linear-gradient(135deg, #F7931A 0%, #E8850F 100%)',
    shadow: 'rgba(247,147,26,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">B</text>
      </svg>
    ),
  },
  BTC: {
    bg: 'linear-gradient(135deg, #F7931A 0%, #E8850F 100%)',
    shadow: 'rgba(247,147,26,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <text x="10" y="14.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">B</text>
      </svg>
    ),
  },
  cbETH: {
    bg: 'linear-gradient(135deg, #0052FF 0%, #003ACC 100%)',
    shadow: 'rgba(0,82,255,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <circle cx="10" cy="10" r="5" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M8 10L10 8L12 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  LINK: {
    bg: 'linear-gradient(135deg, #2A5ADA 0%, #1E4AC0 100%)',
    shadow: 'rgba(42,90,218,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '60%', height: '60%' }}>
        <path d="M10 3L14.5 5.5V10.5L10 13L5.5 10.5V5.5L10 3Z" stroke="white" strokeWidth="1.3" fill="none" />
      </svg>
    ),
  },
  stETH: {
    bg: 'linear-gradient(135deg, #00A3FF 0%, #0083CC 100%)',
    shadow: 'rgba(0,163,255,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <path d="M10 3L5 10.5L10 8.5V3Z" fill="rgba(255,255,255,0.85)" />
        <path d="M10 3L15 10.5L10 8.5V3Z" fill="rgba(255,255,255,0.6)" />
        <circle cx="10" cy="14" r="3" stroke="white" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  SOL: {
    bg: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
    shadow: 'rgba(153,69,255,0.3)',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '55%', height: '55%' }}>
        <path d="M5 13.5H13L15 11.5H7L5 13.5Z" fill="white" />
        <path d="M5 6.5H13L15 8.5H7L5 6.5Z" fill="white" />
        <path d="M5 10H13L15 8H7L5 10Z" fill="rgba(255,255,255,0.7)" />
      </svg>
    ),
  },
}

function getTokenConfig(symbol: string) {
  // Try exact match first, then try uppercase
  const key = symbol.toUpperCase()
  if (TOKEN_CONFIG[symbol]) return TOKEN_CONFIG[symbol]
  if (TOKEN_CONFIG[key]) return TOKEN_CONFIG[key]

  // Fallback: generate a color from the symbol
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return {
    bg: `linear-gradient(135deg, hsl(${hue}, 55%, 50%) 0%, hsl(${hue}, 60%, 40%) 100%)`,
    shadow: `hsla(${hue}, 55%, 50%, 0.3)`,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" style={{ width: '60%', height: '60%' }}>
        <text x="10" y="14" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial, sans-serif">
          {symbol.slice(0, 2)}
        </text>
      </svg>
    ),
  }
}

interface TokenLogoProps {
  symbol: string
  size?: number
  style?: React.CSSProperties
}

export function TokenLogo({ symbol, size = 32, style }: TokenLogoProps) {
  const config = getTokenConfig(symbol)

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: config.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 2px 6px ${config.shadow}`,
      flexShrink: 0,
      ...style,
    }}>
      {config.icon}
    </div>
  )
}

interface TokenPairProps {
  collateral: string
  loan: string
  size?: number
}

export function TokenPair({ collateral, loan, size = 32 }: TokenPairProps) {
  const overlap = size * 0.45

  return (
    <div style={{
      position: 'relative',
      width: size + (size - overlap),
      height: size,
      flexShrink: 0,
    }}>
      <TokenLogo
        symbol={collateral}
        size={size}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 2,
        }}
      />
      <TokenLogo
        symbol={loan}
        size={size}
        style={{
          position: 'absolute',
          left: size - overlap,
          top: 0,
          zIndex: 1,
          border: '2px solid #FFFFFF',
        }}
      />
    </div>
  )
}
