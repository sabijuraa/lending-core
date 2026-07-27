'use client'
import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Wallet, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'
import { HealthGauge } from '@/components/charts/HealthGauge'
import { formatUSD, formatPercent, getHealthStatus } from '@/lib/formatting'

const POS = {
  healthFactor: 2.47,
  netSupplied: 24500,
  netBorrowed: 8200,
  netAPY: 2.8,
  supplied: [
    { symbol: 'USDC', market: 'wstETH/USDC', amount: 20000, value: 20000, shares: 19847, apy: 4.2 },
    { symbol: 'DAI', market: 'ETH/DAI', amount: 4500, value: 4500, shares: 4481, apy: 3.8 },
  ],
  borrowed: [
    { symbol: 'ETH', market: 'wstETH/USDC', amount: 2.41, value: 8200, apy: 6.8, healthFactor: 2.47, liquidationPrice: 1847.20, currentPrice: 3241.50 },
  ],
}

export default function PortfolioPage() {
  const { isConnected } = useAccount()
  const { connect } = useConnect()

  if (!isConnected) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
        <Wallet size={40} style={{ color: 'var(--color-text-muted)' }} />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Connect your wallet</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 300 }}>Connect to view your positions across all markets.</p>
        </div>
        <button className="btn btn-primary" onClick={() => connect({ connector: injected() })}>Connect Wallet</button>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Demo preview below</p>
      </div>
    )
  }

  const status = getHealthStatus(POS.healthFactor)
  const healthColor = status === 'safe' ? 'var(--color-positive)' : status === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'

  return (
    <div style={{ minHeight: '100vh', padding: '48px 0 96px' }}>
      <div style={{ borderBottom: '0.5px solid var(--color-border)', marginBottom: 48 }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '20px 80px', alignItems: 'center', gap: 0 }}>
          {[{ label: 'NET SUPPLIED', value: formatUSD(POS.netSupplied, true) }, { label: 'NET BORROWED', value: formatUSD(POS.netBorrowed, true) }].map(({ label, value }, i) => (
            <div key={label} style={{ paddingRight: 24, borderRight: '0.5px solid var(--color-border)' }}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '0.5px solid var(--color-border)', padding: '0 24px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-accent)', marginBottom: 4 }}>HEALTH</div>
            <HealthGauge value={POS.healthFactor} size="sm" showLabel />
          </div>
          <div style={{ padding: '0 24px', borderRight: '0.5px solid var(--color-border)' }}>
            <div className="stat-label">NET APY</div>
            <div className="stat-value" style={{ color: 'var(--color-positive)' }}>+{formatPercent(POS.netAPY)}</div>
          </div>
          <div style={{ padding: '0 24px' }}>
            <div className="stat-label">STATUS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: healthColor, marginTop: 4 }}>● {status.charAt(0).toUpperCase() + status.slice(1)}</div>
          </div>
        </div>
      </div>

      <div className="section-container">
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Earning</h2>
          {POS.supplied.map(s => (
            <div key={s.symbol} className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', gap: 24, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-surface-2)', border: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent)' }}>{s.symbol.slice(0, 2)}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{s.symbol}</div>
                  <span className="pill" style={{ fontSize: 10, marginTop: 3 }}>{s.market}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
                {[{ l: 'Supplied', v: `${s.amount.toLocaleString()} ${s.symbol}` }, { l: 'APY', v: formatPercent(s.apy), c: 'var(--color-positive)' }, { l: 'Shares', v: s.shares.toLocaleString() }, { l: 'Value', v: formatUSD(s.value) }].map(({ l, v, c }) => (
                  <div key={l}><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{l}</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: (c as string) || undefined }}>{v}</div></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-dark" style={{ fontSize: 13 }}>Withdraw</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Borrowing</h2>
          {POS.borrowed.map(b => (
            <div key={b.symbol} className="card" style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 24, borderLeft: '2px solid var(--color-warning)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-surface-2)', border: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-warning)' }}>{b.symbol.slice(0, 2)}</div>
                  <div><div style={{ fontSize: 14, fontWeight: 500 }}>{b.symbol}</div><span className="pill" style={{ fontSize: 10, marginTop: 3 }}>{b.market}</span></div>
                </div>
                <div><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Borrowed</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>{b.amount} {b.symbol}</div></div>
                <div style={{ marginTop: 6 }}><div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Borrow APR</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-warning)' }}>{formatPercent(b.apy)}</div></div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-warning)', marginBottom: 8 }}>Liquidation Price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, color: 'var(--color-warning)', lineHeight: 1, marginBottom: 6 }}>{formatUSD(b.liquidationPrice)}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Current: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{formatUSD(b.currentPrice)}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-ghost" style={{ fontSize: 13 }}>Add Collateral</button>
                <button className="btn btn-primary" style={{ fontSize: 13 }}>Repay {b.symbol}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
