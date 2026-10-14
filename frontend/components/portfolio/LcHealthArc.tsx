'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { ShieldCheck, Warning } from '@phosphor-icons/react'
import { getHealthStatus } from '@/lib/formatting'

const MAX = 2.5
const SWEEP = 240
const START = 90 + (360 - SWEEP) / 2

/** Large open arc gauge for the account health factor, filled from 0 to 2.5 and above. */
export function LcHealthArc({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const size = 220
  const c = size / 2
  const r = 92
  const sw = 12
  const finite = Number.isFinite(value)
  const frac = finite ? Math.max(0, Math.min(1, value / MAX)) : 1
  const status = getHealthStatus(value)
  const color = status === 'safe' ? 'var(--accent)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)'

  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) }
  }
  const s = pt(START)
  const e = pt(START + SWEEP)
  const track = `M ${s.x} ${s.y} A ${r} ${r} 0 1 1 ${e.x} ${e.y}`
  const tip = pt(START + SWEEP * frac)

  return (
    <div style={{ position: 'relative', width: size, height: size - 22 }}>
      <svg width={size} height={size - 22} viewBox={`0 0 ${size} ${size - 22}`} role="img"
        aria-label={`Health factor ${finite ? value.toFixed(2) : 'with no debt'}`}>
        <path d={track} fill="none" stroke="var(--accent-soft)" strokeWidth={sw} strokeLinecap="round" />
        <motion.path d={track} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          initial={{ pathLength: reduce ? frac : 0 }} animate={{ pathLength: frac }}
          transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }} />
        {frac > 0.02 && <circle cx={tip.x} cy={tip.y} r={3} fill="var(--surface)" opacity={0.9} />}
        <circle cx={s.x} cy={s.y + 14} r={3} fill="var(--text-1)" />
        <circle cx={e.x} cy={e.y + 14} r={3} fill="none" stroke="var(--border-strong)" strokeWidth="1.5" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>Health Factor</span>
        <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
          {finite ? value.toFixed(2) : '∞'}
        </span>
        <span style={{
          marginTop: 10, width: 26, height: 22, borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: status === 'safe' ? 'var(--positive-dim)' : status === 'warning' ? 'var(--warning-dim)' : 'var(--danger-dim)',
          color: status === 'safe' ? 'var(--positive)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)',
        }}>
          {status === 'safe' ? <ShieldCheck size={14} weight="fill" /> : <Warning size={14} weight="fill" />}
        </span>
      </div>
    </div>
  )
}
