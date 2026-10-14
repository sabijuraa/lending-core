'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Wallet } from '@phosphor-icons/react'
import { useData } from '@/providers/provider'
import { healthFactor, type MarketView, type PositionView } from '@/providers/types'
import { useAccountId } from '@/lib/use-account-id'
import { TxButton } from '@/components/market/TxButton'
import { TokenPair } from '@/components/ui/TokenLogo'
import { formatUSD, formatPercent } from '@/lib/formatting'
import { AmountField, Segmented, SummaryRows, hfLabel, hfTone, panel } from './AppUi'

type Tab = 'borrow' | 'repay'

/** Post collateral and borrow, or repay, in one market. The position comes from the parent so previews stay in sync. */
export function BorrowPanel({ m, pos, onChanged }: { m: MarketView; pos: PositionView | undefined; onChanged: () => void }) {
  const data = useData()
  const { account } = useAccountId()
  const { connect } = useConnect()
  const [tab, setTab] = useState<Tab>('borrow')
  const [collateral, setCollateral] = useState('')
  const [amount, setAmount] = useState('')

  const col = pos?.collateral ?? 0
  const debt = pos?.borrowed ?? 0
  const addCol = Number(collateral) || 0
  const amt = Number(amount) || 0
  const liquidity = Math.max(0, m.totalSupplied - m.totalBorrowed)
  const limit = Math.max(0, Math.min(liquidity, (col + addCol) * m.oraclePrice * m.lltv - debt))
  const hfNow = healthFactor(col, m.oraclePrice, m.lltv, debt)
  const nextDebt = tab === 'borrow' ? debt + amt : Math.max(0, debt - amt)
  const hfAfter = healthFactor(col + (tab === 'borrow' ? addCol : 0), m.oraclePrice, m.lltv, nextDebt)
  const liqPrice = nextDebt > 0 && col + addCol > 0 ? nextDebt / ((col + addCol) * m.lltv) : null

  function done() { setCollateral(''); setAmount(''); onChanged() }

  const connectBtn = (
    <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => connect({ connector: injected() })}>
      <Wallet size={16} weight="bold" /> Connect wallet to continue
    </button>
  )

  return (
    <div style={{ ...panel, padding: 22, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={30} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{m.collateralSymbol} / {m.loanSymbol}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Borrow {m.loanSymbol} against {m.collateralSymbol}</div>
        </div>
      </div>

      <Segmented id={`borrow-${m.slug}`} value={tab} onChange={(t) => { setTab(t); setAmount(''); setCollateral('') }}
        options={[{ value: 'borrow', label: 'Borrow' }, { value: 'repay', label: 'Repay' }]} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, minWidth: 0 }}>
          {tab === 'borrow' ? (
            <>
              <StepLabel n={1} text={`Add ${m.collateralSymbol} as collateral`} note={col > 0 ? `${col.toLocaleString()} ${m.collateralSymbol} posted` : undefined} />
              <AmountField id={`col-${m.slug}`} label="Collateral to add" symbol={m.collateralSymbol} value={collateral} onChange={setCollateral} max={null} maxLabel="Wallet" />
              {account && (
                <TxButton label={addCol > 0 ? `Add ${addCol.toLocaleString()} ${m.collateralSymbol}` : 'Enter collateral to add'} disabled={!(addCol > 0)}
                  run={() => data.supplyCollateral(m.slug, addCol, account)} onDone={done} />
              )}
              <StepLabel n={2} text={`Borrow ${m.loanSymbol}`} />
              <AmountField id={`bor-${m.slug}`} label="You borrow" symbol={m.loanSymbol} value={amount} onChange={setAmount} max={limit} maxLabel="Borrow limit" />
            </>
          ) : (
            <AmountField id={`rep-${m.slug}`} label="You repay" symbol={m.loanSymbol} value={amount} onChange={setAmount} max={debt} maxLabel="Owed" />
          )}

          <SummaryRows rows={[
            { label: 'Borrow APY', value: formatPercent(m.borrowAPY, 2) },
            { label: 'Debt after', value: formatUSD(nextDebt) },
            { label: 'Health factor', value: Number.isFinite(hfNow) || Number.isFinite(hfAfter) ? <>{hfLabel(hfNow)} <span style={{ color: 'var(--text-4)' }}>to</span> {hfLabel(hfAfter)}</> : 'No debt', tone: Number.isFinite(hfAfter) ? hfTone(hfAfter) : 'positive' },
            { label: `Liquidated if ${m.collateralSymbol} falls to`, value: liqPrice ? formatUSD(liqPrice) : 'Not at risk' },
          ]} />

          {tab === 'borrow' && amt > 0 && hfAfter < 1 && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>This borrow would put your position underwater right away. Add collateral or borrow less.</p>
          )}
          {tab === 'borrow' && amt > 0 && hfAfter >= 1 && hfAfter < 1.2 && (
            <p style={{ fontSize: 13, color: 'var(--warning)', margin: 0 }}>This leaves very little room. A small price drop could trigger a liquidation.</p>
          )}

          {!account ? connectBtn : tab === 'borrow' ? (
            <TxButton label={amt > 0 ? `Borrow ${amt.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!(amt > 0) || hfAfter < 1 || amt > limit + 1e-9}
              run={() => data.borrow(m.slug, amt, account)} onDone={done} />
          ) : (
            <TxButton label={amt > 0 ? `Repay ${amt.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!(amt > 0) || debt === 0}
              run={() => data.repay(m.slug, Math.min(amt, debt), account)} onDone={done} />
          )}
        </motion.div>
      </AnimatePresence>

      <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--text-3)', margin: 0 }}>
        If your health factor drops below 1, anyone can repay your debt and take your collateral plus a {formatPercent(m.liquidationBonus * 100, 0)} bonus. Keep a buffer.
      </p>
    </div>
  )
}

function StepLabel({ n, text, note }: { n: number; text: string; note?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--accent-tint)' }}>{n}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{text}</span>
      {note && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{note}</span>}
    </div>
  )
}
