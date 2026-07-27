'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { calculateBorrowAPY, calculateSupplyAPY, formatPercent } from '@/lib/formatting'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'

interface Props { currentUtilization?: number; size?: 'hero' | 'card' | 'mini'; interactive?: boolean; animated?: boolean }

const SIZES = {
  hero: { width: 700, height: 260, p: { t: 24, r: 24, b: 40, l: 48 } },
  card: { width: 500, height: 200, p: { t: 16, r: 16, b: 32, l: 40 } },
  mini: { width: 280, height: 120, p: { t: 8, r: 8, b: 24, l: 32 } },
}

export function KinkedRateCurve({ currentUtilization = 0.713, size = 'card', interactive = true, animated = true }: Props) {
  const { baseRate, kinkRate, maxRate, kink } = RATE_MODEL_PARAMS
  const { width, height, p } = SIZES[size]
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverU, setHoverU] = useState<number | null>(null)
  const [drawn, setDrawn] = useState(!animated)
  const [dotOn, setDotOn] = useState(!animated)
  const cw = width - p.l - p.r
  const ch = height - p.t - p.b

  const pts = Array.from({ length: 201 }, (_, i) => {
    const u = i / 200
    const b = calculateBorrowAPY(u, baseRate, kinkRate, maxRate, kink)
    const s = calculateSupplyAPY(u, b)
    return { u, x: p.l + u * cw, yb: p.t + ch - (b / maxRate) * ch, ys: p.t + ch - (s / maxRate) * ch }
  })

  const bPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yb.toFixed(1)}`).join(' ')
  const sPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.ys.toFixed(1)}`).join(' ')
  const kinkX = p.l + kink * cw

  const activeU = hoverU !== null ? hoverU : currentUtilization
  const activeBorrow = calculateBorrowAPY(activeU, baseRate, kinkRate, maxRate, kink)
  const activeSupply = calculateSupplyAPY(activeU, activeBorrow)
  const dotX = p.l + activeU * cw
  const dotY = p.t + ch - (activeBorrow / maxRate) * ch

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const rawX = (e.clientX - rect.left) * (width / rect.width) - p.l
    setHoverU(Math.max(0, Math.min(1, rawX / cw)))
  }, [interactive, width, p.l, cw])

  useEffect(() => {
    if (animated) {
      const t1 = setTimeout(() => setDrawn(true), 100)
      const t2 = setTimeout(() => setDotOn(true), 900)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [animated])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseMove={handleMove} onMouseLeave={() => setHoverU(null)}>
        {[0, 0.33, 0.67, 1].map(v => (
          <line key={v} x1={p.l} y1={p.t + ch - v * ch} x2={p.l + cw} y2={p.t + ch - v * ch} stroke="#1A1B1E" strokeWidth="0.5" />
        ))}
        {size !== 'mini' && ['0%', '20%', '40%', '60%', '80%', '100%'].map((l, i) => (
          <text key={l} x={p.l + (i / 5) * cw} y={height - 4} textAnchor="middle" fill="#6B7280" fontSize="10" fontFamily="JetBrains Mono">{l}</text>
        ))}
        <line x1={kinkX} y1={p.t} x2={kinkX} y2={p.t + ch} stroke="#6B7280" strokeWidth="0.5" strokeDasharray="3,3" />
        {size !== 'mini' && <text x={kinkX} y={p.t - 6} textAnchor="middle" fill="#6B7280" fontSize="10">Kink</text>}
        <motion.path d={sPath} fill="none" stroke="#60A5FA" strokeWidth={1.5} strokeDasharray="4,3" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 0.7 : 0 }} transition={{ duration: 0.8, delay: 0.2 }} />
        <motion.path d={bPath} fill="none" stroke="#00E5CC" strokeWidth={2} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }} transition={{ duration: 0.8 }} />
        {interactive && hoverU !== null && <>
          <line x1={dotX} y1={p.t} x2={dotX} y2={p.t + ch} stroke="#1A1B1E" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1={p.l} y1={dotY} x2={dotX} y2={dotY} stroke="#1A1B1E" strokeWidth="0.5" strokeDasharray="3,3" />
        </>}
        {dotOn && <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.circle cx={dotX} cy={dotY} r={10} fill="transparent" stroke="var(--color-accent)" strokeWidth="0.5" opacity={0.3}
            animate={hoverU === null ? { r: [10, 14, 10], opacity: [0.3, 0, 0.3] } : {}} transition={{ duration: 2, repeat: Infinity }} />
          <circle cx={dotX} cy={dotY} r={5} fill="white" stroke="var(--color-accent)" strokeWidth="1.5" />
        </motion.g>}
        <line x1={p.l} y1={p.t} x2={p.l} y2={p.t + ch} stroke="#1A1B1E" strokeWidth="0.5" />
        <line x1={p.l} y1={p.t + ch} x2={p.l + cw} y2={p.t + ch} stroke="#1A1B1E" strokeWidth="0.5" />
      </svg>
      {dotOn && (
        <div style={{ position: 'absolute', top: `${((dotY - 80) / height) * 100}%`, left: `${((dotX + 12) / width) * 100}%`, background: 'var(--color-bg-surface-2)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', pointerEvents: 'none', zIndex: 10, minWidth: 140 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Utilization: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>{formatPercent(activeU * 100)}</span></div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Borrow: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{formatPercent(activeBorrow * 100)} APR</span></div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Supply: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-positive)' }}>{formatPercent(activeSupply * 100)} APY</span></div>
        </div>
      )}
    </div>
  )
}
