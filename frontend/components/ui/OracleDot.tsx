'use client'
import { motion } from 'framer-motion'
import { getOracleStatus, formatTimeAgo } from '@/lib/formatting'

interface Props { lastUpdate: number; maxStaleness: number; showLabel?: boolean; size?: number }

export function OracleDot({ lastUpdate, maxStaleness, showLabel = false, size = 8 }: Props) {
  const status = getOracleStatus(lastUpdate, maxStaleness)
  const color = status === 'fresh' ? '#00C48C' : status === 'warning' ? '#F5A623' : '#E55353'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={`Oracle: ${status}`}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {status === 'fresh' && (
          <motion.div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: color, opacity: 0.3 }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }} />
        )}
        <div style={{ width: size, height: size, borderRadius: '50%', background: color }} />
      </div>
      {showLabel && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{formatTimeAgo(lastUpdate)}</span>}
    </div>
  )
}
