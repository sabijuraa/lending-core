'use client'
import { motion } from 'framer-motion'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'

interface Props { utilization: number; kink?: number; animated?: boolean; height?: number; showLabel?: boolean }

export function UtilizationBar({ utilization, kink = RATE_MODEL_PARAMS.kink, animated = true, height = 8, showLabel = true }: Props) {
  const color = utilization > kink * 0.85 ? '#F5A623' : '#00E5CC'
  return (
    <div>
      <div style={{ position: 'relative', width: '100%' }}>
        <div style={{ height, background: '#1A1B1E', borderRadius: height / 2, overflow: 'hidden', position: 'relative' }}>
          <motion.div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: color, borderRadius: height / 2, transformOrigin: 'left' }}
            initial={{ scaleX: 0 }} animate={{ scaleX: utilization }}
            transition={animated ? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 } : { duration: 0 }} />
        </div>
        <motion.div style={{ position: 'absolute', top: -2, left: `${kink * 100}%`, width: 1.5, height: height + 4, background: '#6B7280', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: animated ? 0.7 : 0, duration: 0.2 }} />
      </div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>{(utilization * 100).toFixed(1)}%</span>
          <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>Kink {(kink * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  )
}
