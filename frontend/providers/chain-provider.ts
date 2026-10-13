import { createPublicClient, http, parseUnits, formatUnits, type Address } from 'viem'
import { baseSepolia } from 'viem/chains'
import { writeContract, waitForTransactionReceipt } from 'wagmi/actions'
import LendingCoreAbi from '@/lib/abi/LendingCore.json'
import TestTokenAbi from '@/lib/abi/TestToken.json'
import { ADDRESSES, isDeployed } from '@/lib/addresses'
import { wagmiConfig } from '@/lib/wagmi'
import { RATE_MODEL_PARAMS } from '@/lib/contracts'
import { calculateBorrowAPY, calculateSupplyAPY } from '@/lib/formatting'
import type { DataProvider, MarketView, PositionView } from './types'
import { healthFactor } from './types'

const client = createPublicClient({ chain: baseSepolia, transport: http() })
const abi = LendingCoreAbi as never
const erc20 = TestTokenAbi as never

/** The two markets created by DeployBaseSepolia, with the same parameters. */
const MARKETS = [
  { slug: 'weth', collateralSymbol: 'WETH', collateralName: 'Wrapped Ether', collateral: ADDRESSES.WETH, oracle: ADDRESSES.WETHOracle, collateralDecimals: 18, lltv: 0.86e18 },
  { slug: 'wbtc', collateralSymbol: 'WBTC', collateralName: 'Wrapped Bitcoin', collateral: ADDRESSES.WBTC, oracle: ADDRESSES.WBTCOracle, collateralDecimals: 8, lltv: 0.8e18 },
] as const

const LOAN_DECIMALS = 6
const STALENESS = 7 * 86_400

function params(m: (typeof MARKETS)[number]) {
  return {
    loanToken: ADDRESSES.USDC,
    collateralToken: m.collateral,
    oracle: m.oracle,
    irm: ADDRESSES.KinkedRateModel,
    lltv: BigInt(m.lltv),
    liquidationBonus: BigInt(0.05e18),
    maxStaleness: BigInt(STALENESS),
  }
}

function find(slug: string) {
  const m = MARKETS.find((x) => x.slug === slug)
  if (!m) throw new Error('That market does not exist.')
  return m
}

function requireDeployed() {
  if (!isDeployed) throw new Error('Contracts are not deployed to Base Sepolia yet. Switch to the demo data source.')
}

async function readMarket(m: (typeof MARKETS)[number]): Promise<MarketView> {
  const id = (await client.readContract({ address: ADDRESSES.LendingCore, abi, functionName: 'idOf', args: [params(m)] })) as `0x${string}`
  const [supplyAssets, , borrowAssets, , lastAccrued] = (await client.readContract({ address: ADDRESSES.LendingCore, abi, functionName: 'market', args: [id] })) as bigint[]
  const [price, updatedAt] = (await client.readContract({ address: m.oracle, abi: [{ type: 'function', name: 'price', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }, { type: 'uint256' }] }], functionName: 'price' })) as [bigint, bigint]
  const totalSupplied = Number(formatUnits(supplyAssets, LOAN_DECIMALS))
  const totalBorrowed = Number(formatUnits(borrowAssets, LOAN_DECIMALS))
  const utilization = totalSupplied > 0 ? totalBorrowed / totalSupplied : 0
  const { baseRate, kinkRate, maxRate, kink } = RATE_MODEL_PARAMS
  const borrowAPY = calculateBorrowAPY(utilization, baseRate, kinkRate, maxRate, kink) * 100
  // price is 1e36 scaled between token units, so convert to loan per whole collateral token
  const oraclePrice = Number(price) / 10 ** (36 - m.collateralDecimals + LOAN_DECIMALS)
  void lastAccrued
  return {
    slug: m.slug, id, collateralSymbol: m.collateralSymbol, collateralName: m.collateralName, loanSymbol: 'USDC',
    lltv: m.lltv / 1e18, liquidationBonus: 0.05, supplyAPY: calculateSupplyAPY(utilization, borrowAPY), borrowAPY, utilization,
    totalSupplied, totalBorrowed, oraclePrice, oracleLastUpdate: Number(updatedAt) * 1000, maxStaleness: STALENESS * 1000,
  }
}

async function send(slug: string, fn: string, amount: number, account: string, collateralSide = false) {
  requireDeployed()
  const m = find(slug)
  const decimals = collateralSide ? m.collateralDecimals : LOAN_DECIMALS
  const token = collateralSide ? m.collateral : ADDRESSES.USDC
  const value = parseUnits(String(amount), decimals)
  const needsApproval = fn === 'supply' || fn === 'repay' || fn === 'supplyCollateral'
  if (needsApproval) {
    const h = await writeContract(wagmiConfig, { address: token, abi: erc20, functionName: 'approve', args: [ADDRESSES.LendingCore, value] })
    await waitForTransactionReceipt(wagmiConfig, { hash: h })
  }
  const withReceiver = fn === 'withdraw' || fn === 'borrow'
  const args = withReceiver ? [params(m), value, account, account] : [params(m), value, account]
  const hash = await writeContract(wagmiConfig, { address: ADDRESSES.LendingCore, abi, functionName: fn, args })
  await waitForTransactionReceipt(wagmiConfig, { hash })
  return { hash }
}

export const chainProvider: DataProvider = {
  source: 'chain',
  async getStats() {
    const ms = await this.getMarkets()
    return {
      totalSupplied: ms.reduce((s, m) => s + m.totalSupplied, 0),
      totalBorrowed: ms.reduce((s, m) => s + m.totalBorrowed, 0),
      marketsLive: ms.length,
    }
  },
  async getMarkets() {
    if (!isDeployed) return []
    return Promise.all(MARKETS.map(readMarket))
  },
  async getMarket(slug) {
    if (!isDeployed) return null
    const m = MARKETS.find((x) => x.slug === slug)
    return m ? readMarket(m) : null
  },
  async getPositions(account) {
    if (!isDeployed) return []
    const out: PositionView[] = []
    for (const m of MARKETS) {
      const mv = await readMarket(m)
      const [supplyShares, borrowShares, collateral] = (await client.readContract({ address: ADDRESSES.LendingCore, abi, functionName: 'position', args: [mv.id, account as Address] })) as bigint[]
      const [sa, ss, ba, bs] = (await client.readContract({ address: ADDRESSES.LendingCore, abi, functionName: 'market', args: [mv.id] })) as bigint[]
      const supplied = ss > BigInt(0) ? Number(formatUnits((supplyShares * sa) / ss, LOAN_DECIMALS)) : 0
      const borrowed = bs > BigInt(0) ? Number(formatUnits((borrowShares * ba) / bs, LOAN_DECIMALS)) : 0
      const col = Number(formatUnits(collateral, m.collateralDecimals))
      if (supplied || borrowed || col) out.push({ slug: m.slug, supplied, borrowed, collateral: col, healthFactor: healthFactor(col, mv.oraclePrice, mv.lltv, borrowed) })
    }
    return out
  },
  // Event history comes from the Ponder indexer in packages/indexer once it is hosted.
  async getActivity() { return [] },
  async getLiquidatable() { return [] },
  supply: (slug, amount, account) => send(slug, 'supply', amount, account),
  withdraw: (slug, amount, account) => send(slug, 'withdraw', amount, account),
  supplyCollateral: (slug, amount, account) => send(slug, 'supplyCollateral', amount, account, true),
  borrow: (slug, amount, account) => send(slug, 'borrow', amount, account),
  repay: (slug, amount, account) => send(slug, 'repay', amount, account),
}
