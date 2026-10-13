'use client'
import { motion } from 'framer-motion'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'

interface Props { utilization: number; kink?: number; animated?: boolean; height?: number; showLabel?: boolean }

export function UtilizationBar({ utilization, kink = RATE_MODEL_PARAMS.kink, animated = true, height = 6, showLabel = true }: Props) {
  const color = utilization > kink * 0.85 ? 'var(--warning)' : 'var(--accent)'
  return (
    <div>
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ height, background: 'var(--surface-2)', borderRadius: height / 2, overflow: 'hidden', position: 'relative' }}>
          <motion.div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: color, borderRadius: height / 2, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }} animate={{ scaleX: utilization }}
            transition={animated ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 } : { duration: 0 }} />
        </div>
        <motion.div style={{ position: 'absolute', top: -2, left: `${kink * 100}%`, width: 1.5, height: height + 4, background: 'var(--text-4)', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: animated ? 0.7 : 0, duration: 0.2 }} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{(utilization * 100).toFixed(1)}%</span>
          <span style={{ fontSize: 9, color: 'var(--text-4)' }}>Kink {(kink * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}
