'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ShieldCheck } from '@phosphor-icons/react'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { UtilizationBar } from '@/components/charts/UtilizationBar'
import { DEMO_MARKETS } from '@/lib/contracts'
import { formatUSD, formatPercent } from '@/lib/formatting'

const AreaChart = dynamic(() => import('recharts').then(r => r.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then(r => r.Area), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(r => r.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(r => r.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(r => r.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(r => r.ResponsiveContainer), { ssr: false })

type Range = '24h' | '7d' | '30d' | '90d'

function genData(days: number) {
  const data = []
  let tvl = 38e6, util = 0.62
  for (let i = days; i >= 0; i--) {
    tvl += (Math.random() - 0.3) * 400000
    util = Math.max(0.55, Math.min(0.82, util + (Math.random() - 0.4) * 0.02))
    const d = new Date(Date.now() - i * 86400000)
    data.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), tvl: Math.max(30e6, tvl), util: parseFloat((util * 100).toFixed(1)) })
  }
  return data
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CT({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--color-bg-surface-2)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name === 'tvl' ? formatUSD(p.value, true) : `${p.value}%`}
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')
  const days = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }[range]
  const data = genData(days)
  const ranges: Range[] = ['24h', '7d', '30d', '90d']
  const metrics = [
    { label: 'TVL', value: 44_500_000, format: 'compact-currency' as const, change: '+$2.1M', pos: true },
    { label: 'Borrowed', value: 29_949_800, format: 'compact-currency' as const, change: '+$890K', pos: true },
    { label: 'Utilization', value: 71.3, format: 'percent' as const, change: '+2.1%', pos: true },
    { label: 'Liquidations (30D)', value: 1_200_000, format: 'compact-currency' as const, sub: '47 events', pos: true },
    { label: 'Interest (30D)', value: 284_000, format: 'compact-currency' as const, change: '+18%', pos: true },
    { label: 'Bad Debt', value: 0, format: 'currency' as const, sub: '0 events', icon: true },
  ]

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Analytics</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Protocol metrics, updated every block.</p>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {ranges.map(r => <button key={r} onClick={() => setRange(r)} className={`pill ${range === r ? 'pill-selected' : ''}`} style={{ cursor: 'pointer', border: 'none', fontSize: 12, padding: '5px 12px', textTransform: 'uppercase' }}>{r}</button>)}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 24 }}>
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {m.icon && <ShieldCheck size={14} weight="fill" style={{ color: 'var(--color-positive)' }} />}
                <AnimatedNumber value={m.value} format={m.format} style={{ fontSize: 18, fontWeight: 500, color: m.icon ? 'var(--color-accent)' : undefined }} />
              </div>
              {(m.change || m.sub) && <div style={{ fontSize: 11, color: m.pos ? 'var(--color-positive)' : 'var(--color-text-muted)', marginTop: 3 }}>{m.change || m.sub}</div>}
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {[
            { key: 'tvl', label: 'Total Value Locked', val: '$44.5M', color: '#00E5CC', gradId: 'tvl', fmt: (v: number) => formatUSD(v, true) },
            { key: 'util', label: 'Utilization', val: '71.3%', color: '#F5A623', gradId: 'util', fmt: (v: number) => `${v}%` },
          ].map(({ key, label, val, color, gradId }) => (
            <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '20px 20px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color }}>{val}</span>
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.1} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 4)} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={38} tickFormatter={v => key === 'tvl' ? formatUSD(v, true) : `${v}%`} />
                    <Tooltip content={<CT />} />
                    <Area type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} fill={`url(#${gradId})`} name={key} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '0.5px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Market breakdown</div>
          </div>
          <table className="data-table">
            <thead><tr>{['MARKET', 'TVL', 'UTILIZATION', 'SUPPLY APY', 'BORROW APY', 'RISK'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {DEMO_MARKETS.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.04 * i }}>
                  <td style={{ fontSize: 14, fontWeight: 500 }}>{m.collateralSymbol} / {m.loanSymbol}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatUSD(m.totalSupplied, true)}</td>
                  <td style={{ width: 160 }}><UtilizationBar utilization={m.utilization} animated={false} /></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-positive)' }}>{formatPercent(m.supplyAPY)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-warning)' }}>{formatPercent(m.borrowAPY)}</td>
                  <td><span className={m.utilization > 0.75 ? 'pill pill-warning' : 'pill pill-positive'}>{m.utilization > 0.75 ? 'Medium' : 'Low'}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
