'use client'
import { motion } from 'framer-motion'
import { ShieldCheck } from '@phosphor-icons/react'
import { ClipReveal } from '@/components/ui/ClipReveal'
import { formatUSD, formatPercent, formatTimeAgo, getHealthStatus } from '@/lib/formatting'

const AT_RISK = [
  { address: '0x3a7f...c891', market: 'wstETH/USDC', healthFactor: 1.04, collateralValue: 12450, debtValue: 11980, bonus: 5.2 },
  { address: '0x8b2c...a447', market: 'ETH/DAI', healthFactor: 1.09, collateralValue: 8920, debtValue: 8190, bonus: 4.8 },
  { address: '0xc7d2...0912', market: 'wstETH/USDC', healthFactor: 1.13, collateralValue: 22100, debtValue: 19540, bonus: 5.0 },
]

const HISTORY = [
  { id: 1, time: Date.now() - 2*60000, market: 'wstETH/USDC', address: '0x3a7f...c891', debtRepaid: 11980, debtSym: 'USDC', collateralSeized: 4.18, collSym: 'wstETH', bonus: 5.2, tx: 'C81F...1497' },
  { id: 2, time: Date.now() - 47*60000, market: 'ETH/DAI', address: '0x9f1e...b334', debtRepaid: 4200, debtSym: 'DAI', collateralSeized: 1.42, collSym: 'ETH', bonus: 9.6, tx: '6B35...8396' },
  { id: 3, time: Date.now() - 2*3600000, market: 'WBTC/USDC', address: '0x2c8a...7f21', debtRepaid: 28900, debtSym: 'USDC', collateralSeized: 0.41, collSym: 'WBTC', bonus: 5.0, tx: '8C25...99BB' },
]

export default function LiquidationsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Liquidations</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Every liquidation, visible to everyone. Always has been.</p>
          </div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            style={{ background: 'var(--color-positive-dim)', border: '0.5px solid rgba(0,196,140,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>Bad debt</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <ShieldCheck size={18} weight="fill" style={{ color: 'var(--color-positive)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color: 'var(--color-accent)' }}>$0</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>Since deployment</div>
          </motion.div>
        </motion.div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500 }}>Positions at risk</h2>
            <span className="pill pill-danger">{AT_RISK.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {AT_RISK.map((pos, i) => {
              const status = getHealthStatus(pos.healthFactor)
              const border = status === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'
              const hfColor = status === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'
              return (
                <motion.div key={pos.address} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="card" style={{ borderColor: border, padding: 24, borderLeftWidth: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{pos.address}</span>
                    <span className="pill" style={{ fontSize: 11 }}>{pos.market}</span>
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Health factor</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 500, color: hfColor, lineHeight: 1 }}>{pos.healthFactor.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px', marginBottom: 16 }}>
                    {[{ l: 'Collateral', v: formatUSD(pos.collateralValue) }, { l: 'Debt', v: formatUSD(pos.debtValue) }, { l: 'Bonus', v: `+${formatPercent(pos.bonus)}`, c: 'var(--color-positive)' }, { l: 'Profit', v: formatUSD(pos.collateralValue - pos.debtValue), c: 'var(--color-positive)' }].map(({ l, v, c }) => (
                      <div key={l}><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{l}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: (c as string) || undefined }}>{v}</div></div>
                    ))}
                  </div>
                  <button className="btn" style={{ width: '100%', background: border, color: 'white', border: 'none' }}>Liquidate →</button>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>History</h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>{['TIME', 'MARKET', 'ADDRESS', 'DEBT REPAID', 'COLLATERAL', 'BONUS', 'TX'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {HISTORY.map((liq, i) => (
                  <motion.tr key={liq.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{formatTimeAgo(liq.time)}</td>
                    <td style={{ fontSize: 13 }}>{liq.market}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>{liq.address}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatUSD(liq.debtRepaid)} {liq.debtSym}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{liq.collateralSeized} {liq.collSym}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-positive)' }}>+{formatPercent(liq.bonus)}</td>
                    <td><a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>↗ {liq.tx}</a></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
