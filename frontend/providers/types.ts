export type MarketView = {
  /** URL slug, the collateral symbol in lower case */
  slug: string
  id: `0x${string}`
  collateralSymbol: string
  collateralName: string
  loanSymbol: string
  lltv: number
  liquidationBonus: number
  supplyAPY: number
  borrowAPY: number
  utilization: number
  totalSupplied: number
  totalBorrowed: number
  oraclePrice: number
  oracleLastUpdate: number
  maxStaleness: number
}

export type PositionView = {
  slug: string
  supplied: number
  borrowed: number
  collateral: number
  /** collateral value times LLTV divided by debt, Infinity when debt is zero */
  healthFactor: number
}

export type ActivityItem = {
  id: string
  kind: 'supply' | 'withdraw' | 'borrow' | 'repay' | 'liquidate'
  slug: string
  amount: number
  account: string
  timestamp: number
  /** transaction hash when known */
  hash?: string
}

export type ProtocolStats = {
  totalSupplied: number
  totalBorrowed: number
  marketsLive: number
}

export type TxResult = { hash: string }

export type LiquidatablePosition = PositionView & { account: string }

export type CreateMarketInput = {
  loanToken: `0x${string}`
  collateralToken: `0x${string}`
  oracle: `0x${string}`
  irm: `0x${string}`
  /** fraction, e.g. 0.86 */
  lltv: number
  /** fraction, e.g. 0.05 */
  liquidationBonus: number
  /** seconds */
  maxStaleness: number
}

export interface DataProvider {
  readonly source: 'mock' | 'chain'
  getStats(): Promise<ProtocolStats>
  getMarkets(): Promise<MarketView[]>
  getMarket(slug: string): Promise<MarketView | null>
  getPositions(account: string): Promise<PositionView[]>
  getActivity(slug?: string, account?: string): Promise<ActivityItem[]>
  getLiquidatable(): Promise<LiquidatablePosition[]>
  supply(slug: string, amount: number, account: string): Promise<TxResult>
  withdraw(slug: string, amount: number, account: string): Promise<TxResult>
  supplyCollateral(slug: string, amount: number, account: string): Promise<TxResult>
  borrow(slug: string, amount: number, account: string): Promise<TxResult>
  repay(slug: string, amount: number, account: string): Promise<TxResult>
  withdrawCollateral(slug: string, amount: number, account: string): Promise<TxResult>
  /** Repays the borrower's whole debt and seizes collateral plus the bonus to the caller. */
  liquidate(slug: string, borrower: string, account: string): Promise<TxResult>
  createMarket(input: CreateMarketInput, account: string): Promise<TxResult>
}

export function healthFactor(collateral: number, price: number, lltv: number, debt: number) {
  if (debt <= 0) return Infinity
  return (collateral * price * lltv) / debt
}
