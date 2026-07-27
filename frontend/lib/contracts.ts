export const CONTRACT_ADDRESSES = {
  LendingCore: '0x0000000000000000000000000000000000000001' as `0x${string}`,
  KinkedRateModel: '0x0000000000000000000000000000000000000002' as `0x${string}`,
} as const

export const DEMO_MARKETS = [
  { id: '0x1234' as `0x${string}`, collateralSymbol: 'wstETH', loanSymbol: 'USDC', collateralName: 'Wrapped Staked ETH', loanName: 'USD Coin', lltv: 0.8, liquidationBonus: 0.05, supplyAPY: 4.2, borrowAPY: 6.8, utilization: 0.713, totalSupplied: 18_400_000, totalBorrowed: 13_119_200, oracleLastUpdate: Date.now() - 2 * 60 * 1000, maxStaleness: 60 * 60 * 1000, chain: 'Arbitrum' },
  { id: '0x2345' as `0x${string}`, collateralSymbol: 'WBTC', loanSymbol: 'USDC', collateralName: 'Wrapped Bitcoin', loanName: 'USD Coin', lltv: 0.75, liquidationBonus: 0.05, supplyAPY: 3.8, borrowAPY: 5.9, utilization: 0.65, totalSupplied: 12_100_000, totalBorrowed: 7_865_000, oracleLastUpdate: Date.now() - 5 * 60 * 1000, maxStaleness: 60 * 60 * 1000, chain: 'Arbitrum' },
  { id: '0x3456' as `0x${string}`, collateralSymbol: 'ETH', loanSymbol: 'DAI', collateralName: 'Ethereum', loanName: 'Dai', lltv: 0.8, liquidationBonus: 0.05, supplyAPY: 4.5, borrowAPY: 7.1, utilization: 0.782, totalSupplied: 9_800_000, totalBorrowed: 7_663_600, oracleLastUpdate: Date.now() - 14 * 60 * 1000, maxStaleness: 60 * 60 * 1000, chain: 'Arbitrum' },
  { id: '0x4567' as `0x${string}`, collateralSymbol: 'LINK', loanSymbol: 'USDC', collateralName: 'Chainlink', loanName: 'USD Coin', lltv: 0.65, liquidationBonus: 0.08, supplyAPY: 2.1, borrowAPY: 3.4, utilization: 0.31, totalSupplied: 4_200_000, totalBorrowed: 1_302_000, oracleLastUpdate: Date.now() - 60 * 1000, maxStaleness: 60 * 60 * 1000, chain: 'Arbitrum' },
]

export const PROTOCOL_STATS = {
  totalSupplied: 44_500_000,
  totalBorrowed: 29_949_800,
  marketsLive: 4,
  badDebtRealized: 0,
}

export const RATE_MODEL_PARAMS = {
  baseRate: 0.02,
  kinkRate: 0.10,
  maxRate: 1.50,
  kink: 0.80,
}
