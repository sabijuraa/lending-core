'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { calculateBorrowAPY, formatPercent } from '@/lib/formatting'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'

const W = 520
const H = 220
const P = { t: 26, r: 16, b: 28, l: 44 }
const KINK_COLOR = '#C7772E'

/** Borrow rate against utilization, with the kink and the current utilization marked. */
export function LcRateCurve({ utilization }: { utilization: number }) {
  const { baseRate, kinkRate, maxRate, kink } = RATE_MODEL_PARAMS
  const reduce = useReducedMotion()
  const cw = W - P.l - P.r
  const ch = H - P.t - P.b
  const x = (u: number) => P.l + u * cw
  const y = (r: number) => P.t + ch - (r / maxRate) * ch

  const pts = Array.from({ length: 101 }, (_, i) => {
    const u = i / 100
    return [x(u), y(calculateBorrowAPY(u, baseRate, kinkRate, maxRate, kink))] as const
  })
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ')
  const area = `${line} L${x(1)} ${y(0)} L${x(0)} ${y(0)} Z`
  const ticks = [0, maxRate / 3, (2 * maxRate) / 3, maxRate]
  const u = Math.max(0, Math.min(1, utilization))
  const cu = calculateBorrowAPY(u, baseRate, kinkRate, maxRate, kink)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`Borrow rate curve with the kink at ${formatPercent(kink * 100, 0)} utilization`}>
        <text x={P.l} y={12} fontSize="10" fill="var(--text-3)">Borrow APY</text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={P.l + cw} y1={y(t)} y2={y(t)} stroke="var(--border-subtle)" strokeWidth="1" />
            <text x={P.l - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--text-4)">{formatPercent(t * 100, 0)}</text>
          </g>
        ))}
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={x(v)} y={H - 8} textAnchor={v === 0 ? 'start' : v === 1 ? 'end' : 'middle'} fontSize="10" fill="var(--text-4)">
            {formatPercent(v * 100, 0)}
          </text>
        ))}
        <path d={area} fill="var(--accent)" opacity="0.05" />
        <motion.path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }} />
        <line x1={x(kink)} x2={x(kink)} y1={P.t} y2={P.t + ch} stroke={KINK_COLOR} strokeWidth="1" strokeDasharray="3 3" />
        <text x={x(kink)} y={P.t - 8} textAnchor="middle" fontSize="10" fill={KINK_COLOR}>Kink</text>
        <circle cx={x(kink)} cy={y(kinkRate)} r="4" fill={KINK_COLOR} stroke="var(--surface)" strokeWidth="1.5" />
        <circle cx={x(u)} cy={y(cu)} r="4.5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--text-3)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--positive)', flexShrink: 0 }} />
        Low rates until target utilization, then a steep increase. Now at {formatPercent(u * 100, 0)} utilization.
      </div>
    </div>
  )
}
