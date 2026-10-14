'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useData } from '@/providers/provider'
import { healthFactor, type MarketView, type PositionView } from '@/providers/types'
import { TokenPair } from '@/components/ui/TokenLogo'
import { formatUSD, formatPercent } from '@/lib/formatting'
import { AmountField, ConnectWalletButton, Segmented, SummaryRows, hfLabel, hfTone, panel, useWallet } from './AppUi'
import { AppTxButton } from './AppTxButton'

export type BorrowTab = 'borrow' | 'repay' | 'collateral'
type ColMode = 'add' | 'withdraw'

/** Borrow, repay, or manage collateral in one market. The position comes from the parent so previews stay in sync. */
export function BorrowPanel({ m, pos, onChanged, initialTab = 'borrow', initialColMode = 'add' }: {
  m: MarketView
  pos: PositionView | undefined
  onChanged: () => void
  initialTab?: BorrowTab
  initialColMode?: ColMode
}) {
  const data = useData()
  const account = useWallet()
  const [tab, setTab] = useState<BorrowTab>(initialTab)
  const [colMode, setColMode] = useState<ColMode>(initialColMode)
  const [collateral, setCollateral] = useState('')
  const [amount, setAmount] = useState('')

  const col = pos?.collateral ?? 0
  const debt = pos?.borrowed ?? 0
  const addCol = Number(collateral) || 0
  const amt = Number(amount) || 0
  const liquidity = Math.max(0, m.totalSupplied - m.totalBorrowed)
  const hfNow = healthFactor(col, m.oraclePrice, m.lltv, debt)

  // Borrow tab lets you add collateral and borrow in the same view.
  const borrowLimit = Math.max(0, Math.min(liquidity, (col + addCol) * m.oraclePrice * m.lltv - debt))
  // The most collateral that can leave while the position stays above a health factor of 1.
  const freeCollateral = debt > 0 ? Math.max(0, col - debt / (m.oraclePrice * m.lltv)) : col
  const withdrawableCol = Math.floor(freeCollateral * 0.999 * 1e8) / 1e8

  let nextCol = col
  let nextDebt = debt
  if (tab === 'borrow') { nextCol = col + addCol; nextDebt = debt + amt }
  if (tab === 'repay') nextDebt = Math.max(0, debt - amt)
  if (tab === 'collateral') nextCol = colMode === 'add' ? col + amt : Math.max(0, col - amt)
  const hfAfter = healthFactor(nextCol, m.oraclePrice, m.lltv, nextDebt)
  const liqPrice = nextDebt > 0 && nextCol > 0 ? nextDebt / (nextCol * m.lltv) : null

  function done() { setCollateral(''); setAmount(''); onChanged() }
  function switchTab(t: BorrowTab) { setTab(t); setAmount(''); setCollateral('') }

  const collateralSymbolAmount = (v: number) => `${v.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${m.collateralSymbol}`

  return (
    <div style={{ ...panel, padding: 22, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 18, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TokenPair collateral={m.collateralSymbol} loan={m.loanSymbol} size={30} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{m.collateralSymbol} / {m.loanSymbol}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Borrow {m.loanSymbol} against {m.collateralSymbol}</div>
        </div>
      </div>

      <Segmented id={`borrow-${m.slug}`} value={tab} onChange={switchTab}
        options={[{ value: 'borrow', label: 'Borrow' }, { value: 'repay', label: 'Repay' }, { value: 'collateral', label: 'Collateral' }]} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16, minWidth: 0 }}>
          {tab === 'borrow' && (
            <>
              <StepLabel n={1} text={`Add ${m.collateralSymbol} as collateral`} note={col > 0 ? `${collateralSymbolAmount(col)} posted` : undefined} />
              <AmountField id={`col-${m.slug}`} label="Collateral to add" symbol={m.collateralSymbol} value={collateral} onChange={setCollateral} max={null} maxLabel="Wallet" />
              {account && (
                <AppTxButton variant="secondary" label={addCol > 0 ? `Add ${collateralSymbolAmount(addCol)}` : 'Enter collateral to add'} disabled={!(addCol > 0)}
                  run={() => data.supplyCollateral(m.slug, addCol, account)} onDone={() => { setCollateral(''); onChanged() }} />
              )}
              <StepLabel n={2} text={`Borrow ${m.loanSymbol}`} />
              <AmountField id={`bor-${m.slug}`} label="You borrow" symbol={m.loanSymbol} value={amount} onChange={setAmount} max={account ? borrowLimit : null} maxLabel="Borrow limit" />
            </>
          )}
          {tab === 'repay' && (
            <AmountField id={`rep-${m.slug}`} label="You repay" symbol={m.loanSymbol} value={amount} onChange={setAmount} max={account ? debt : null} maxLabel="Owed" />
          )}
          {tab === 'collateral' && (
            <>
              <Segmented id={`colmode-${m.slug}`} value={colMode} onChange={(v) => { setColMode(v); setAmount('') }}
                options={[{ value: 'add', label: 'Add collateral' }, { value: 'withdraw', label: 'Withdraw collateral' }]} />
              <AmountField id={`colm-${colMode}-${m.slug}`} label={colMode === 'add' ? 'Collateral to add' : 'Collateral to withdraw'} symbol={m.collateralSymbol}
                value={amount} onChange={setAmount} max={account && colMode === 'withdraw' ? withdrawableCol : null} maxLabel="Withdrawable" />
              {colMode === 'withdraw' && account && col === 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>You have no {m.collateralSymbol} posted in this market.</p>
              )}
              {colMode === 'withdraw' && account && col > 0 && debt > 0 && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                  While you have debt, part of your collateral has to stay in place. Repay to free more of it.
                </p>
              )}
            </>
          )}

          <SummaryRows rows={[
            { label: 'Borrow APY', value: formatPercent(m.borrowAPY, 2) },
            { label: 'Collateral after', value: `${collateralSymbolAmount(nextCol)} (${formatUSD(nextCol * m.oraclePrice)})` },
            { label: 'Debt after', value: formatUSD(nextDebt) },
            { label: 'Health factor', value: Number.isFinite(hfNow) || Number.isFinite(hfAfter) ? <>{hfLabel(hfNow)} <span style={{ color: 'var(--text-4)' }}>to</span> {hfLabel(hfAfter)}</> : 'No debt', tone: Number.isFinite(hfAfter) ? hfTone(hfAfter) : 'positive' },
            { label: `Liquidated if ${m.collateralSymbol} falls to`, value: liqPrice ? formatUSD(liqPrice) : 'Not at risk' },
          ]} />

          {amt > 0 && hfAfter < 1 && (tab === 'borrow' || (tab === 'collateral' && colMode === 'withdraw')) && (
            <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>This would put your position below a health factor of 1 right away. Add collateral, borrow less, or withdraw less.</p>
          )}
          {amt > 0 && hfAfter >= 1 && hfAfter < 1.2 && (tab === 'borrow' || (tab === 'collateral' && colMode === 'withdraw')) && (
            <p style={{ fontSize: 13, color: 'var(--warning)', margin: 0 }}>This leaves very little room. A small price drop could trigger a liquidation.</p>
          )}
          {tab === 'repay' && account && debt === 0 && (
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>You have no debt in this market.</p>
          )}

          {!account ? <ConnectWalletButton /> : tab === 'borrow' ? (
            <AppTxButton label={amt > 0 ? `Borrow ${amt.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!(amt > 0) || hfAfter < 1 || amt > borrowLimit + 1e-9 || addCol > 0}
              run={() => data.borrow(m.slug, amt, account)} onDone={done} />
          ) : tab === 'repay' ? (
            <AppTxButton label={amt > 0 ? `Repay ${amt.toLocaleString()} ${m.loanSymbol}` : 'Enter an amount'} disabled={!(amt > 0) || debt === 0}
              run={() => data.repay(m.slug, Math.min(amt, debt), account)} onDone={done} />
          ) : colMode === 'add' ? (
            <AppTxButton label={amt > 0 ? `Add ${collateralSymbolAmount(amt)}` : 'Enter an amount'} disabled={!(amt > 0)}
              run={() => data.supplyCollateral(m.slug, amt, account)} onDone={done} />
          ) : (
            <AppTxButton label={amt > 0 ? `Withdraw ${collateralSymbolAmount(amt)}` : 'Enter an amount'} disabled={!(amt > 0) || col === 0 || amt > withdrawableCol + 1e-12}
              run={() => data.withdrawCollateral(m.slug, amt, account)} onDone={done} />
          )}
          {tab === 'borrow' && account && addCol > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>Add your collateral first, then borrow.</p>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--primary)', background: 'var(--accent-tint)' }}>{n}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{text}</span>
      {note && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>{note}</span>}
    </div>
  )
}
