'use client'
import { motion } from 'framer-motion'

interface FloatingMarketCardProps {
  scale?: number
}

export function FloatingMarketCard({ scale = 1 }: FloatingMarketCardProps) {
  const w = 340 * scale
  const h = 420 * scale

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -8, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateY: -6, rotateX: 3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: w,
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: w,
          background: '#FFFFFF',
          borderRadius: 20 * scale,
          border: '1px solid var(--border-default)',
          boxShadow: `
            6px 8px 0 0 var(--accent),
            0 20px 60px -10px rgba(23,77,64,0.18),
            0 8px 24px -6px rgba(20,42,37,0.08)
          `,
          padding: `${24 * scale}px ${28 * scale}px ${28 * scale}px`,
          transform: 'rotateY(-4deg) rotateX(2deg)',
          transformStyle: 'preserve-3d',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80 * scale,
          background: 'linear-gradient(180deg, rgba(23,77,64,0.03) 0%, transparent 100%)',
          borderRadius: `${20 * scale}px ${20 * scale}px 0 0`,
          pointerEvents: 'none',
        }} />

        {/* Token pair header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 * scale, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 * scale }}>
            {/* Overlapping token circles */}
            <div style={{ position: 'relative', width: 52 * scale, height: 36 * scale }}>
              {/* ETH circle */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 36 * scale,
                height: 36 * scale,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #627EEA 0%, #4A6DE5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(98,126,234,0.3)',
              }}>
                <svg width={18 * scale} height={18 * scale} viewBox="0 0 18 18" fill="none">
                  <path d="M9 1L3 9.5L9 7V1Z" fill="rgba(255,255,255,0.8)" />
                  <path d="M9 1L15 9.5L9 7V1Z" fill="rgba(255,255,255,0.6)" />
                  <path d="M9 12.5L3 10L9 8V12.5Z" fill="rgba(255,255,255,0.9)" />
                  <path d="M9 12.5L15 10L9 8V12.5Z" fill="rgba(255,255,255,0.7)" />
                  <path d="M9 13.5L3 11L9 17V13.5Z" fill="rgba(255,255,255,0.8)" />
                  <path d="M9 13.5L15 11L9 17V13.5Z" fill="rgba(255,255,255,0.6)" />
                </svg>
              </div>
              {/* USDC circle */}
              <div style={{
                position: 'absolute',
                left: 20 * scale,
                top: 0,
                width: 36 * scale,
                height: 36 * scale,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2775CA 0%, #1A5FB4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(39,117,202,0.3)',
              }}>
                <svg width={16 * scale} height={16 * scale} viewBox="0 0 16 16" fill="none">
                  <text x="8" y="12" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial">$</text>
                </svg>
              </div>
            </div>

            <div>
              <div style={{
                fontSize: 16 * scale,
                fontWeight: 600,
                color: 'var(--text-1)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                WETH / USDC
              </div>
              <div style={{
                fontSize: 11 * scale,
                color: 'var(--text-4)',
                marginTop: 2 * scale,
              }}>
                Wrapped Ether / USD Coin
              </div>
            </div>
          </div>

          {/* Active badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5 * scale,
            padding: `${3 * scale}px ${10 * scale}px`,
            borderRadius: 20,
            background: 'rgba(39,116,75,0.1)',
            border: '1px solid rgba(39,116,75,0.25)',
          }}>
            <span style={{
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: '50%',
              background: 'var(--positive)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: 11 * scale,
              fontWeight: 600,
              color: 'var(--positive)',
            }}>
              Active
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'var(--border-subtle)',
          marginBottom: 18 * scale,
        }} />

        {/* Supply and Borrow APY boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10 * scale,
          marginBottom: 18 * scale,
        }}>
          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 10 * scale,
            padding: `${14 * scale}px ${16 * scale}px`,
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale, marginBottom: 6 * scale }}>
              <svg width={14 * scale} height={14 * scale} viewBox="0 0 14 14" fill="none">
                <path d="M7 11V3M7 3L4 6M7 3L10 6" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 11 * scale, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Supply APY
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 22 * scale,
              fontWeight: 600,
              color: 'var(--positive)',
              lineHeight: 1,
            }}>
              3.8%
            </div>
          </div>

          <div style={{
            background: 'var(--surface-2)',
            borderRadius: 10 * scale,
            padding: `${14 * scale}px ${16 * scale}px`,
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale, marginBottom: 6 * scale }}>
              <svg width={14 * scale} height={14 * scale} viewBox="0 0 14 14" fill="none">
                <path d="M7 3V11M7 11L4 8M7 11L10 8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 11 * scale, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Borrow APY
              </span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 22 * scale,
              fontWeight: 600,
              color: 'var(--accent)',
              lineHeight: 1,
            }}>
              5.6%
            </div>
          </div>
        </div>

        {/* Utilization */}
        <div style={{
          background: 'var(--surface-2)',
          borderRadius: 10 * scale,
          padding: `${14 * scale}px ${16 * scale}px`,
          border: '1px solid var(--border-subtle)',
          marginBottom: 18 * scale,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 * scale }}>
            <span style={{ fontSize: 11 * scale, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Utilization
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13 * scale,
              fontWeight: 600,
              color: 'var(--accent)',
            }}>
              64%
            </span>
          </div>
          {/* Utilization progress bar */}
          <div style={{
            height: 8 * scale,
            background: 'rgba(23,77,64,0.08)',
            borderRadius: 4 * scale,
            overflow: 'hidden',
            position: 'relative',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '64%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                borderRadius: 4 * scale,
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--positive) 100%)',
              }}
            />
            {/* Kink marker */}
            <div style={{
              position: 'absolute',
              left: '80%',
              top: -2 * scale,
              bottom: -2 * scale,
              width: 2 * scale,
              background: 'var(--text-4)',
              borderRadius: 1,
              opacity: 0.4,
            }} />
          </div>
        </div>

        {/* Market stats row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `${10 * scale}px 0`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale }}>
            <div style={{
              width: 8 * scale,
              height: 8 * scale,
              borderRadius: '50%',
              background: 'var(--positive)',
            }} />
            <span style={{ fontSize: 11 * scale, color: 'var(--text-3)' }}>Oracle fresh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 * scale }}>
            <svg width={12 * scale} height={12 * scale} viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="var(--accent)" opacity="0.6"/>
            </svg>
            <span style={{ fontSize: 11 * scale, fontWeight: 500, color: 'var(--text-3)' }}>LLTV 86%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
