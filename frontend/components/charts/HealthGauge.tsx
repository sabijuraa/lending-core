'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { getHealthStatus } from '@/lib/formatting'

interface Props { value: number; size?: 'lg' | 'sm'; showLabel?: boolean }

export function HealthGauge({ value, size = 'lg', showLabel = true }: Props) {
  const dim = size === 'lg' ? 160 : 96
  const cx = dim / 2, cy = dim / 2 + 10
  const r = size === 'lg' ? 60 : 36
  const sw = size === 'lg' ? 8 : 5
  const status = getHealthStatus(value)
  const color = status === 'safe' ? '#00C48C' : status === 'warning' ? '#F5A623' : '#E55353'
  const mv = useMotionValue(1)
  const angle = useTransform(mv, (h) => -90 + (Math.max(1, Math.min(4, h)) - 1) / 3 * 180)
  const prev = useRef(1)

  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.8, ease: [0.34, 1.56, 0.64, 1], onUpdate: (v) => mv.set(v) })
    prev.current = value
    return c.stop
  }, [value, mv])

  const arc = (a1: number, a2: number) => {
    const r2p = (a: number) => ({ x: cx + r * Math.cos(a * Math.PI / 180), y: cy + r * Math.sin(a * Math.PI / 180) })
    const s = r2p(a1), e = r2p(a2)
    return `M ${s.x} ${s.y} A ${r} ${r} 0 0 1 ${e.x} ${e.y}`
  }

  return (
    <div style={{ position: 'relative', width: dim, height: dim / 2 + 20 }}>
      <svg width={dim} height={dim / 2 + 20} viewBox={`0 0 ${dim} ${dim / 2 + 20}`}>
        <path d={arc(-180, 0)} fill="none" stroke="#1A1B1E" strokeWidth={sw} strokeLinecap="round" />
        <path d={arc(-180, -120)} fill="none" stroke="#00C48C" strokeWidth={sw} strokeLinecap="round" opacity="0.8" />
        <path d={arc(-120, -60)} fill="none" stroke="#F5A623" strokeWidth={sw} strokeLinecap="round" opacity="0.8" />
        <path d={arc(-60, 0)} fill="none" stroke="#E55353" strokeWidth={sw} strokeLinecap="round" opacity="0.8" />
        <motion.g style={{ originX: `${cx}px`, originY: `${cy}px`, rotate: angle }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + sw / 2 + 2} stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={4} fill="white" />
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
