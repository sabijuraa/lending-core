import type { ActivityItem, DataProvider, MarketView, PositionView } from './types'
import { healthFactor } from './types'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'
import { calculateBorrowAPY, calculateSupplyAPY } from '@/lib/formatting'

/**
 * Illustrative data for the demo. Numbers are made up and mutate in memory
 * when you act on them, so flows can be tried without a wallet or testnet funds.
 */
const now = Date.now()

const markets: MarketView[] = [
  { slug: 'weth', id: '0x01', collateralSymbol: 'WETH', collateralName: 'Wrapped Ether', loanSymbol: 'USDC', lltv: 0.86, liquidationBonus: 0.05, supplyAPY: 0, borrowAPY: 0, utilization: 0, totalSupplied: 1_840_000, totalBorrowed: 1_311_000, oraclePrice: 3000, oracleLastUpdate: now - 120_000, maxStaleness: 7 * 86_400_000 },
  { slug: 'wbtc', id: '0x02', collateralSymbol: 'WBTC', collateralName: 'Wrapped Bitcoin', loanSymbol: 'USDC', lltv: 0.8, liquidationBonus: 0.05, supplyAPY: 0, borrowAPY: 0, utilization: 0, totalSupplied: 1_210_000, totalBorrowed: 786_000, oraclePrice: 60_000, oracleLastUpdate: now - 300_000, maxStaleness: 7 * 86_400_000 },
  { slug: 'wsteth', id: '0x03', collateralSymbol: 'wstETH', collateralName: 'Wrapped Staked Ether', loanSymbol: 'USDC', lltv: 0.8, liquidationBonus: 0.05, supplyAPY: 0, borrowAPY: 0, utilization: 0, totalSupplied: 640_000, totalBorrowed: 498_000, oraclePrice: 3500, oracleLastUpdate: now - 60_000, maxStaleness: 7 * 86_400_000 },
  { slug: 'link', id: '0x04', collateralSymbol: 'LINK', collateralName: 'Chainlink', loanSymbol: 'USDC', lltv: 0.65, liquidationBonus: 0.08, supplyAPY: 0, borrowAPY: 0, utilization: 0, totalSupplied: 420_000, totalBorrowed: 130_000, oraclePrice: 14, oracleLastUpdate: now - 900_000, maxStaleness: 7 * 86_400_000 },
]

function reprice(m: MarketView) {
  const { baseRate, kinkRate, maxRate, kink } = RATE_MODEL_PARAMS
  m.utilization = m.totalSupplied > 0 ? m.totalBorrowed / m.totalSupplied : 0
  m.borrowAPY = calculateBorrowAPY(m.utilization, baseRate, kinkRate, maxRate, kink) * 100
  m.supplyAPY = calculateSupplyAPY(m.utilization, m.borrowAPY)
}
markets.forEach(reprice)

type Raw = { supplied: number; borrowed: number; collateral: number }
const positions = new Map<string, Map<string, Raw>>()
const others: { account: string; slug: string; raw: Raw }[] = [
  { account: '0x71c4...9a2e', slug: 'weth', raw: { supplied: 0, borrowed: 26_100, collateral: 10 } },
  { account: '0x3b9d...0f17', slug: 'link', raw: { supplied: 0, borrowed: 6_200, collateral: 690 } },
]

const activity: ActivityItem[] = [
  { id: 'a1', kind: 'supply', slug: 'weth', amount: 50_000, account: '0x5e2a...c410', timestamp: now - 3_600_000 },
  { id: 'a2', kind: 'borrow', slug: 'wbtc', amount: 18_000, account: '0x9f31...77d2', timestamp: now - 7_200_000 },
  { id: 'a3', kind: 'repay', slug: 'weth', amount: 4_000, account: '0x71c4...9a2e', timestamp: now - 10_800_000 },
  { id: 'a4', kind: 'liquidate', slug: 'link', amount: 2_300, account: '0x0b77...e3a8', timestamp: now - 86_400_000 },
]

function bucket(account: string, slug: string): Raw {
  const key = account.toLowerCase()
  if (!positions.has(key)) positions.set(key, new Map())
  const map = positions.get(key)!
  if (!map.has(slug)) map.set(slug, { supplied: 0, borrowed: 0, collateral: 0 })
  return map.get(slug)!
}

function view(slug: string, raw: Raw): PositionView {
  const m = markets.find((x) => x.slug === slug)!
  return { slug, ...raw, healthFactor: healthFactor(raw.collateral, m.oraclePrice, m.lltv, raw.borrowed) }
}

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms))
const fakeHash = () => '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')

function act(kind: ActivityItem['kind'], slug: string, amount: number, account: string) {
  if (!(amount > 0)) throw new Error('Enter an amount above zero.')
  const m = markets.find((x) => x.slug === slug)
  if (!m) throw new Error('That market does not exist.')
  const p = bucket(account, slug)
  if (kind === 'supply') { p.supplied += amount; m.totalSupplied += amount }
  if (kind === 'withdraw') {
    if (amount > p.supplied) throw new Error('You cannot withdraw more than you supplied.')
    if (amount > m.totalSupplied - m.totalBorrowed) throw new Error('Not enough idle liquidity in this market right now.')
    p.supplied -= amount; m.totalSupplied -= amount
  }
  if (kind === 'borrow') {
    if (amount > m.totalSupplied - m.totalBorrowed) throw new Error('Not enough liquidity to borrow that much.')
    if (healthFactor(p.collateral, m.oraclePrice, m.lltv, p.borrowed + amount) < 1) throw new Error('This borrow would put your health factor below 1. Add collateral or borrow less.')
    p.borrowed += amount; m.totalBorrowed += amount
  }
  if (kind === 'repay') { const r = Math.min(amount, p.borrowed); p.borrowed -= r; m.totalBorrowed -= r }
  reprice(m)
  const hash = fakeHash()
  activity.unshift({ id: hash.slice(0, 10), kind, slug, amount, account, timestamp: Date.now(), hash })
}

export const mockProvider: DataProvider = {
  source: 'mock',
  async getStats() {
    await delay(200)
    return {
      totalSupplied: markets.reduce((s, m) => s + m.totalSupplied, 0),
      totalBorrowed: markets.reduce((s, m) => s + m.totalBorrowed, 0),
      marketsLive: markets.length,
    }
  },
  async getMarkets() { await delay(250); return markets.map((m) => ({ ...m })) },
  async getMarket(slug) { await delay(200); const m = markets.find((x) => x.slug === slug); return m ? { ...m } : null },
  async getPositions(account) {
    await delay(250)
    const map = positions.get(account.toLowerCase())
    if (!map) return []
    return [...map.entries()].filter(([, r]) => r.supplied || r.borrowed || r.collateral).map(([slug, r]) => view(slug, r))
  },
  async getActivity(slug, account) {
    await delay(200)
    return activity.filter((a) => (!slug || a.slug === slug) && (!account || a.account.toLowerCase() === account.toLowerCase())).slice(0, 50)
  },
  async getLiquidatable() {
    await delay(200)
    return others.filter((o) => o.raw.borrowed > 0).map((o) => ({ account: o.account, ...view(o.slug, o.raw) })).filter((p) => p.healthFactor < 1.05)
  },
  async supply(slug, amount, account) { await delay(); act('supply', slug, amount, account); return { hash: fakeHash() } },
  async withdraw(slug, amount, account) { await delay(); act('withdraw', slug, amount, account); return { hash: fakeHash() } },
  async supplyCollateral(slug, amount, account) {
    await delay()
    if (!(amount > 0)) throw new Error('Enter an amount above zero.')
    bucket(account, slug).collateral += amount
    return { hash: fakeHash() }
  },
  async borrow(slug, amount, account) { await delay(); act('borrow', slug, amount, account); return { hash: fakeHash() } },
  async repay(slug, amount, account) { await delay(); act('repay', slug, amount, account); return { hash: fakeHash() } },
  async withdrawCollateral(slug, amount, account) {
    await delay()
    if (!(amount > 0)) throw new Error('Enter an amount above zero.')
    const m = markets.find((x) => x.slug === slug)
    if (!m) throw new Error('That market does not exist.')
    const p = bucket(account, slug)
    if (amount > p.collateral) throw new Error('You cannot withdraw more collateral than you posted.')
    if (healthFactor(p.collateral - amount, m.oraclePrice, m.lltv, p.borrowed) < 1) throw new Error('This would put your health factor below 1. Repay some debt first.')
    p.collateral -= amount
    return { hash: fakeHash() }
  },
  async liquidate(slug, borrower, account) {
    await delay()
    const o = others.find((x) => x.slug === slug && x.account === borrower)
    const m = markets.find((x) => x.slug === slug)
    if (!o || !m) throw new Error('That position no longer exists.')
    if (healthFactor(o.raw.collateral, m.oraclePrice, m.lltv, o.raw.borrowed) >= 1) throw new Error('This position is healthy and cannot be liquidated.')
    const debt = o.raw.borrowed
    const seized = Math.min(o.raw.collateral, (debt * (1 + m.liquidationBonus)) / m.oraclePrice)
    m.totalBorrowed -= debt
    o.raw = { supplied: 0, borrowed: 0, collateral: o.raw.collateral - seized }
    bucket(account, slug)
    reprice(m)
    const hash = fakeHash()
    activity.unshift({ id: hash.slice(0, 10), kind: 'liquidate', slug, amount: debt, account, timestamp: Date.now(), hash })
    return { hash }
  },
  async createMarket(input) {
    await delay()
    if (!(input.lltv > 0 && input.lltv < 1)) throw new Error('LLTV must be between 0 and 100 percent.')
    if (!(input.liquidationBonus > 0 && input.liquidationBonus <= 0.2)) throw new Error('The liquidation bonus must be above 0 and at most 20 percent.')
    return { hash: fakeHash() }
  },
}
