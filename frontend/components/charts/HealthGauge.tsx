'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion'
import { getHealthStatus } from '@/lib/formatting'

const MAX = 2.5

interface Props { value: number; size?: 'lg' | 'sm'; showLabel?: boolean }

export function HealthGauge({ value, size = 'lg', showLabel = true }: Props) {
  const dim = size === 'lg' ? 160 : 96
  const cx = dim / 2, cy = dim / 2 + 10
  const r = size === 'lg' ? 60 : 36
  const sw = size === 'lg' ? 8 : 5
  const status = getHealthStatus(value)
  const color = status === 'safe' ? '#059669' : status === 'warning' ? '#D97706' : '#DC2626'
  // Arc runs from 0 on the left (red) through 1.0 (amber) to 2.5 and above on the right (green).
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const angle = useTransform(mv, (h) => -90 + Math.max(0, Math.min(MAX, h)) / MAX * 180)
  const prev = useRef(0)

  useEffect(() => {
    const target = Number.isFinite(value) ? value : MAX
    const c = animate(prev.current, target, { duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => mv.set(v) })
    prev.current = Number.isFinite(value) ? value : MAX
    return c.stop
  }, [value, mv, reduce])

  const arc = (a1: number, a2: number) => {
    const r2p = (a: number) => ({ x: cx + r * Math.cos(a * Math.PI / 180), y: cy + r * Math.sin(a * Math.PI / 180) })
    const s = r2p(a1), e = r2p(a2)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
  }

  return (
    <div style={{ position: 'relative', width: dim, height: dim / 2 + 20 }}>
      <svg role="img" aria-label={`Health factor ${Number.isFinite(value) ? value.toFixed(2) : 'with no debt'}`} width={dim} height={dim / 2 + 20} viewBox={`0 0 ${dim} ${dim / 2 + 20}`}>
        <path d={arc(-180, 0)} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc(-180, -108)} fill="none" stroke="var(--danger)" strokeWidth={sw} strokeLinecap="round" opacity="0.85" />
        <path d={arc(-108, -72)} fill="none" stroke="var(--warning)" strokeWidth={sw} opacity="0.85" />
        <path d={arc(-72, 0)} fill="none" stroke="var(--positive)" strokeWidth={sw} strokeLinecap="round" opacity="0.85" />
        <motion.g style={{ originX: `${cx}px`, originY: `${cy}px`, rotate: angle }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + sw / 2 + 2} stroke="var(--text-1)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={4} fill="var(--text-1)" />
          <circle cx={cx} cy={cy} r={2} fill={color} />
        </motion.g>
        {showLabel && <>
          <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={size === 'lg' ? '22' : '14'} fontWeight="500" fill={color}>{value === Infinity ? '∞' : value.toFixed(2)}</text>
          {size === 'lg' && <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#6B7280">Health Factor</text>}
        </>}
      </svg>
    </div>
  )
}
