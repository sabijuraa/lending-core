'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Vault } from '@phosphor-icons/react'
import { TokenLogo } from '@/components/ui/TokenLogo'

type Pair = { collateral: string; loan: string }

const tilt = 'perspective(1400px) rotateX(18deg) rotateY(-30deg) rotateZ(-6deg)'

function MarketSlab({ pair, top, left, z, delay, bob }: { pair: Pair; top: number; left: number; z: number; delay: number; bob: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', top, left, zIndex: z }}
    >
      <motion.div
        animate={bob ? { y: [0, -8, 0] } : undefined}
        transition={{ duration: 4.5 + z * 0.6, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 }}
        whileHover={{ y: -12, transition: { duration: 0.25 } }}
      >
      <div
        style={{
          width: 240,
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderRadius: 14,
          background: 'linear-gradient(160deg, #FFFFFF 0%, #F3F5EF 100%)',
          border: '1px solid #DCE2D8',
          boxShadow: '5px 7px 0 #CFD8CB, 6px 9px 0 #BFCABA, 22px 30px 40px rgba(16,43,39,0.14)',
          transform: tilt,
          transformOrigin: 'center',
        }}
      >
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#E6EDE3',
          border: '1px solid #CFD8CB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <TokenLogo symbol={pair.collateral} size={26} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.01em' }}>
            {pair.collateral} / {pair.loan}
          </div>
          <span style={{
            display: 'inline-block',
            marginTop: 4,
            padding: '1px 8px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--positive)',
            background: 'var(--positive-dim)',
          }}>
            Active
          </span>
        </div>
      </div>
      </motion.div>
    </motion.div>
  )
}

export function HeroVisual({ pairs }: { pairs: Pair[] }) {
  const shown = pairs.slice(0, 3)
  const bob = !useReducedMotion()
  return (
    <>
      {/* vault block behind the market slabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', top: 16, right: 24, zIndex: 0 }}
      >
        <div style={{
          width: 230,
          height: 190,
          borderRadius: 18,
          background: 'linear-gradient(150deg, #E9EEE6 0%, #D3DDCF 100%)',
          border: '1px solid #C9D3C4',
          boxShadow: '8px 10px 0 #BCC8B7, 10px 13px 0 #AAB8A5, 30px 40px 50px rgba(16,43,39,0.16)',
          transform: tilt,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: 18,
        }}>
          <div style={{
            borderRadius: 12,
            background: 'linear-gradient(160deg, #2D6A55 0%, #174D40 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
          }}>
            <Vault size={42} weight="duotone" color="#DDE8D9" />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'stretch', padding: '6px 4px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1,
                borderRadius: 4,
                background: i % 2 ? '#C3CFBE' : '#B2C0AD',
              }} />
            ))}
          </div>
        </div>
      </motion.div>

      {shown.map((pair, i) => (
        <MarketSlab
          key={`${pair.collateral}-${pair.loan}`}
          pair={pair}
          top={70 + i * 88}
          left={40 + i * 46}
          z={i + 1}
          delay={0.15 + i * 0.1}
          bob={bob}
        />
      ))}
    </>
  )
}
