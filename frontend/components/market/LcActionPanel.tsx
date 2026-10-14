'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useReadContract } from 'wagmi'
import { formatUnits, type Address } from 'viem'
import { TokenLogo } from '@/components/ui/TokenLogo'
import { useData } from '@/providers/provider'
import { healthFactor, type MarketView } from '@/providers/types'
import { useAsync } from '@/lib/use-async'
import { useAccountId } from '@/lib/use-account-id'
import { ADDRESSES, isDeployed } from '@/lib/addresses'
import TestTokenAbi from '@/lib/abi/TestToken.json'
import { TxButton } from '@/components/market/TxButton'
import { formatNumber, formatPercent } from '@/lib/formatting'

const erc20 = TestTokenAbi as never

export type Action = 'supply' | 'withdraw' | 'collateral' | 'borrow' | 'repay'
const ACTIONS: { id: Action; label: string }[] = [
  { id: 'supply', label: 'Supply' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'collateral', label: 'Collateral' },
  { id: 'borrow', label: 'Borrow' },
  { id: 'repay', label: 'Repay' },
]

const TOKEN_ADDRESS: Record<string, Address> = { USDC: ADDRESSES.USDC, WETH: ADDRESSES.WETH, WBTC: ADDRESSES.WBTC }
const TOKEN_DECIMALS: Record<string, number> = { USDC: 6, WETH: 18, WBTC: 8 }

/** Wallet balance of a token, or null when it cannot be read. */
function useWalletBalance(symbol: string, account: string | null) {
  const data = useData()
  const address = TOKEN_ADDRESS[symbol]
  const read = useReadContract({
    address,
    abi: erc20,
    functionName: 'balanceOf',
    args: [account as Address],
    query: { enabled: isDeployed && data.source === 'chain' && !!address && !!account && account.startsWith('0x') },
  })
  const raw: unknown = (read as { data?: unknown }).data
  return { balance: typeof raw === 'bigint' ? Number(formatUnits(raw, TOKEN_DECIMALS[symbol] ?? 18)) : null, refetch: read.refetch }
}

/** Supply, withdraw, collateral, borrow and repay for one market, wired to the data provider. */
export function LcActionPanel({ m, onChanged, initialTab = 'supply' }: { m: MarketView; onChanged?: () => void; initialTab?: Action }) {
  const data = useData()
  const { account } = useAccountId()
  const [tab, setTab] = useState<Action>(initialTab)
  const [colMode, setColMode] = useState<'add' | 'remove'>('add')
  const [amount, setAmount] = useState('')
  const positions = useAsync(() => (account ? data.getPositions(account) : Promise.resolve([])), [account, data])
  const pos = positions.data?.find((p) => p.slug === m.slug)
  const loanBal = useWalletBalance(m.loanSymbol, account)
  const colBal = useWalletBalance(m.collateralSymbol, account)

  const liquidity = Math.max(0, m.totalSupplied - m.totalBorrowed)
  const supplied = pos?.supplied ?? 0
  const collateral = pos?.collateral ?? 0
  const debt = pos?.borrowed ?? 0
  const borrowLimit = Math.max(0, Math.min(liquidity, collateral * m.oraclePrice * m.lltv - debt))
  const freeCollateral = Math.max(0, collateral - (debt > 0 ? debt / (m.oraclePrice * m.lltv) : 0))

  const value = Number(amount)
  const valid = Number.isFinite(value) && value > 0
  const v = valid ? value : 0

  const isCollateral = tab === 'collateral'
  const symbol = isCollateral ? m.collateralSymbol : m.loanSymbol
  const action = isCollateral ? (colMode === 'add' ? 'addCollateral' : 'removeCollateral') : tab

  const cfg = {
    supply: { max: loanBal.balance, maxLabel: loanBal.balance !== null ? `Wallet ${formatNumber(loanBal.balance)}` : `Earning ${formatPercent(m.supplyAPY)} APY`, label: `Supply ${m.loanSymbol}`, run: () => data.supply(m.slug, value, account!), over: loanBal.balance !== null && v > loanBal.balance ? 'That is more than your wallet holds.' : '' },
    withdraw: { max: Math.min(supplied, liquidity), maxLabel: `Supplied ${formatNumber(supplied)}`, label: `Withdraw ${m.loanSymbol}`, run: () => data.withdraw(m.slug, value, account!), over: v > supplied ? 'That is more than you supplied.' : v > liquidity ? 'Not enough idle liquidity right now. Try a smaller amount.' : '' },
    addCollateral: { max: colBal.balance, maxLabel: colBal.balance !== null ? `Wallet ${formatNumber(colBal.balance, 4)}` : `Posted ${formatNumber(collateral, 4)}`, label: `Add ${m.collateralSymbol} collateral`, run: () => data.supplyCollateral(m.slug, value, account!), over: colBal.balance !== null && v > colBal.balance ? 'That is more than your wallet holds.' : '' },
    removeCollateral: { max: freeCollateral, maxLabel: `Free ${formatNumber(freeCollateral, 4)}`, label: `Withdraw ${m.collateralSymbol} collateral`, run: () => data.withdrawCollateral(m.slug, value, account!), over: v > collateral ? 'That is more collateral than you posted.' : '' },
    borrow: { max: borrowLimit, maxLabel: `Limit ${formatNumber(borrowLimit)}`, label: `Borrow ${m.loanSymbol}`, run: () => data.borrow(m.slug, value, account!), over: v > liquidity ? 'Not enough liquidity in this market for that amount.' : '' },
    repay: { max: loanBal.balance !== null ? Math.min(debt, loanBal.balance) : debt, maxLabel: `Debt ${formatNumber(debt)}`, label: `Repay ${m.loanSymbol}`, run: () => data.repay(m.slug, value, account!), over: v > debt + 1e-9 ? 'That is more than you owe.' : '' },
  }[action]

  const colAfter = action === 'addCollateral' ? collateral + v : action === 'removeCollateral' ? collateral - v : collateral
  const debtAfter = action === 'borrow' ? debt + v : action === 'repay' ? Math.max(0, debt - v) : debt
  const hfNow = healthFactor(collateral, m.oraclePrice, m.lltv, debt)
  const hfAfter = healthFactor(Math.max(0, colAfter), m.oraclePrice, m.lltv, debtAfter)
  const affectsHealth = action === 'borrow' || action === 'repay' || action === 'removeCollateral' || action === 'addCollateral'
  const unsafe = (action === 'borrow' || action === 'removeCollateral') && hfAfter < 1
  const blocker = !valid ? '' : cfg.over || (unsafe ? 'This would leave your position below a health factor of 1.' : '')
  const needsCollateral = !!account && tab === 'borrow' && collateral <= 0
  const needsDebt = !!account && tab === 'repay' && debt <= 0
  const needsSupply = !!account && tab === 'withdraw' && supplied <= 0

  function refresh() {
    setAmount('')
    positions.reload()
    loanBal.refetch()
    colBal.refetch()
    onChanged?.()
  }

  const hfColor = (h: number) => (h < 1 ? 'var(--danger)' : h < 1.5 ? 'var(--warning)' : 'var(--positive)')
  const hfText = (h: number) => (Number.isFinite(h) ? h.toFixed(2) : 'No debt')

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div role="tablist" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 4, padding: 4, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
        {ACTIONS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setAmount('') }}
            style={{
              position: 'relative', padding: '9px 0', fontSize: 12.5, fontWeight: tab === t.id ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-3)',
              background: 'transparent', border: 'none', borderRadius: 'var(--r-sm)',
              transition: 'color 150ms ease', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {tab === t.id && (
              <motion.span
                layoutId="lc-action-tab"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                style={{ position: 'absolute', inset: 0, background: 'var(--surface)', border: '1px solid var(--accent-border)', borderRadius: 'var(--r-sm)' }}
              />
            )}
            <span style={{ position: 'relative' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {isCollateral && (
        <div style={{ display: 'flex', gap: 6 }}>
          {(['add', 'remove'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setColMode(mode); setAmount('') }}
              className={colMode === mode ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ flex: 1, justifyContent: 'center', padding: '7px 0', fontSize: 12.5 }}
            >
              {mode === 'add' ? 'Add collateral' : 'Withdraw collateral'}
            </button>
          ))}
        </div>
      )}

      {needsCollateral || needsDebt || needsSupply ? (
        <div style={{ padding: '18px 16px', borderRadius: 'var(--r-md)', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', display: 'grid', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
            {needsCollateral && `Borrowing starts with collateral. Post ${m.collateralSymbol} first and your borrow limit appears here.`}
            {needsDebt && 'You have no debt in this market, so there is nothing to repay.'}
            {needsSupply && `You have not supplied ${m.loanSymbol} to this market yet.`}
          </p>
          <button
            className="btn btn-secondary"
            style={{ justifySelf: 'start', fontSize: 13 }}
            onClick={() => { if (needsCollateral) { setTab('collateral'); setColMode('add') } else { setTab('supply') } setAmount('') }}
          >
            {needsCollateral ? `Add ${m.collateralSymbol} collateral` : needsDebt ? 'Supply instead' : `Supply ${m.loanSymbol}`}
          </button>
        </div>
      ) : (
        <>
          <div style={{ border: `1px solid ${blocker ? 'var(--danger)' : 'var(--border-default)'}`, borderRadius: 'var(--r-md)', background: 'var(--surface)', transition: 'border-color 150ms ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                <TokenLogo symbol={symbol} size={20} />
                {symbol}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{cfg.maxLabel}</span>
            </div>
            <input
              inputMode="decimal"
              aria-label={`Amount in ${symbol}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              style={{ width: '100%', padding: '12px 14px', fontSize: 20, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--text-1)', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                disabled={!cfg.max}
                onClick={() => cfg.max && setAmount(String(Math.floor(cfg.max * p * (isCollateral ? 1e4 : 1e2) / 100) / (isCollateral ? 1e4 : 1e2)))}
                style={{
                  padding: '8px 0', fontSize: 12, fontWeight: 500, borderRadius: 'var(--r-sm)', fontFamily: 'inherit',
                  border: '1px solid var(--border-default)', background: 'var(--surface-2)', color: 'var(--text-2)',
                  cursor: cfg.max ? 'pointer' : 'not-allowed', opacity: cfg.max ? 1 : 0.55,
                }}
              >
                {p === 100 ? 'Max' : `${p}%`}
              </button>
            ))}
          </div>

          {affectsHealth && (collateral > 0 || colAfter > 0) && (
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{formatNumber(Math.max(0, colAfter), 4)} {m.collateralSymbol} posted after</span>
              <span>
                Health factor{' '}
                <strong style={{ color: hfColor(hfNow), fontWeight: 600 }}>{hfText(hfNow)}</strong>
                {valid && (
                  <>
                    {' to '}
                    <strong style={{ color: hfColor(hfAfter), fontWeight: 600 }}>{hfText(hfAfter)}</strong>
                  </>
                )}
              </span>
            </div>
          )}

          {blocker && <p style={{ fontSize: 12.5, color: 'var(--danger)' }}>{blocker}</p>}

          <TxButton key={action} label={cfg.label} disabled={!valid || !!blocker} run={cfg.run} onDone={refresh} />
        </>
      )}
    </div>
  )
}

