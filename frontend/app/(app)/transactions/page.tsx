'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useData } from '@/providers/provider'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import { explorerTx } from '@/lib/addresses'
import { formatNumber, truncateAddress } from '@/lib/formatting'
import { TokenPair } from '@/components/ui/TokenLogo'
import { ConnectWalletButton } from '@/components/app-shell/wallet'
import type { ActivityItem, MarketView } from '@/providers/types'

type Kind = ActivityItem['kind']

const KINDS: { value: 'all' | Kind; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'supply', label: 'Supply' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'borrow', label: 'Borrow' },
  { value: 'repay', label: 'Repay' },
  { value: 'liquidate', label: 'Liquidation' },
]

const KIND_STYLE: Record<Kind, { label: string; color: string; bg: string }> = {
  supply: { label: 'Supply', color: 'var(--positive)', bg: 'var(--positive-dim)' },
  withdraw: { label: 'Withdraw', color: 'var(--text-2)', bg: 'var(--surface-2)' },
  borrow: { label: 'Borrow', color: 'var(--primary)', bg: 'var(--accent-tint, #DDE8D9)' },
  repay: { label: 'Repay', color: 'var(--positive)', bg: 'var(--positive-dim)' },
  liquidate: { label: 'Liquidation', color: 'var(--danger)', bg: 'var(--danger-dim)' },
}

const card: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--r-lg)',
}

const th: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-3)',
  textAlign: 'left',
  padding: '12px 16px',
  background: 'var(--surface-2)',
  borderBottom: '1px solid var(--border-subtle)',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 14,
  color: 'var(--text-1)',
  verticalAlign: 'middle',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
}

function formatWhen(ts: number) {
  const d = new Date(ts)
  return {
    date: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  }
}

function amountLabel(item: ActivityItem, market?: MarketView) {
  return `${formatNumber(item.amount)} ${market?.loanSymbol ?? 'USDC'}`
}

export default function TransactionsPage() {
  const data = useData()
  const { account } = useAccountId()
  const reduce = useReducedMotion()
  const [kind, setKind] = useState<'all' | Kind>('all')
  const [slug, setSlug] = useState<string>('all')

  const activity = useAsync(() => (account ? data.getActivity(undefined, account) : Promise.resolve([] as ActivityItem[])), [account, data])
  const markets = useAsync(() => data.getMarkets(), [data])

  const marketBySlug = useMemo(() => new Map((markets.data ?? []).map((m) => [m.slug, m])), [markets.data])
  const rows = useMemo(
    () => (activity.data ?? []).filter((a) => (kind === 'all' || a.kind === kind) && (slug === 'all' || a.slug === slug)),
    [activity.data, kind, slug],
  )

  if (!account) {
    return (
      <div className="section-container" style={{ padding: '40px 32px 80px' }}>
        <div style={{ ...card, padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>Your transaction history lives here</h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 24 }}>
            Connect a wallet to see every supply, borrow, repayment and withdrawal you make, with a link to each one on the block explorer.
          </p>
          <ConnectWalletButton />
        </div>
      </div>
    )
  }

  const total = activity.data?.length ?? 0

  return (
    <div className="section-container" style={{ padding: '32px 32px 80px' }}>
      <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 15, color: 'var(--text-3)', maxWidth: 620, lineHeight: 1.6 }}>
          Every action you take on lending-core, newest first. Open any transaction on the block explorer to see its full details.
        </p>
      </motion.div>

      <div className="tx-filters" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value as 'all' | Kind)} className="tx-select">
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <select aria-label="Filter by market" value={slug} onChange={(e) => setSlug(e.target.value)} className="tx-select">
          <option value="all">All markets</option>
          {(markets.data ?? []).map((m) => <option key={m.slug} value={m.slug}>{m.collateralSymbol} / {m.loanSymbol}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-3)' }}>
          {rows.length} of {total} transactions
        </span>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        {activity.loading && !activity.data ? (
          <div style={{ padding: 24, display: 'grid', gap: 10 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8, background: 'var(--surface-2)' }} />)}
          </div>
        ) : activity.error ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 16 }}>We could not load your history right now.</p>
            <button type="button" className="btn btn-secondary" onClick={activity.reload}>Try again</button>
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{total === 0 ? 'No transactions yet' : 'Nothing matches these filters'}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
              {total === 0 ? 'Your first supply or borrow will show up here as soon as it confirms.' : 'Try a different type or market.'}
            </p>
            {total === 0 ? (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/markets" className="btn btn-primary">Explore markets</Link>
                <Link href="/earn" className="btn btn-secondary">Compare yields</Link>
              </div>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => { setKind('all'); setSlug('all') }}>Clear filters</button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ ...th, paddingLeft: 24 }}>Time</th>
                  <th style={th}>Type</th>
                  <th style={th}>Market</th>
                  <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: 'right', paddingRight: 24 }}>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a, i) => {
                  const m = marketBySlug.get(a.slug)
                  const k = KIND_STYLE[a.kind]
                  const when = formatWhen(a.timestamp)
                  return (
                    <motion.tr
                      key={a.id}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.03 }}
                      className="tx-row"
                    >
                      <td style={{ ...td, paddingLeft: 24 }}>
                        <div style={{ fontWeight: 500 }}>{when.date}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{when.time}</div>
                      </td>
                      <td style={td}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, color: k.color, background: k.bg }}>{k.label}</span>
                      </td>
                      <td style={td}>
                        {m ? (
                          <Link href={`/markets/${m.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'var(--text-1)', textDecoration: 'none' }}>
                            <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={22} />
                            <span style={{ fontWeight: 500 }}>{m.collateralSymbol} / {m.loanSymbol}</span>
                          </Link>
                        ) : (
                          <span>{a.slug.toUpperCase()}</span>
                        )}
                      </td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 500 }}>{amountLabel(a, m)}</td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--positive)' }}>
                          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--positive)' }} />
                          Confirmed
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: 'right', paddingRight: 24 }}>
                        {a.hash ? (
                          <a href={explorerTx(a.hash)} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
                            {truncateAddress(a.hash, 8, 6)}
                          </a>
                        ) : (
                          <span style={{ fontSize: 13, color: 'var(--text-4)' }}>Pending index</span>
                        )}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .tx-select {
          appearance: none;
          padding: 9px 34px 9px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-default);
          background: var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364756D' stroke-width='1.4' fill='none'/%3E%3C/svg%3E") no-repeat right 12px center;
          font-family: inherit;
          font-size: 13px;
          color: var(--text-1);
          cursor: pointer;
        }
        .tx-select:focus { outline: 2px solid var(--accent-border); outline-offset: 1px; }
        .tx-row { transition: background 120ms ease; }
        .tx-row:hover { background: var(--surface-2); }
        @media (max-width: 960px) {
          .section-container { padding-left: 16px !important; padding-right: 16px !important; }
        }
        @media (max-width: 520px) {
          .tx-filters > span { margin-left: 0 !important; width: 100%; }
        }
      `}</style>
    </div>
  )
}
