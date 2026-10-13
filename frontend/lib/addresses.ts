import type { Address } from 'viem'

/**
 * Base Sepolia addresses. Copy them from deployments/base-sepolia.json after
 * the deploy script runs and set them as NEXT_PUBLIC_* variables.
 */
const ZERO = '0x0000000000000000000000000000000000000000' as Address

export const ADDRESSES = {
  chainId: 84532,
  LendingCore: (process.env.NEXT_PUBLIC_LENDING_CORE ?? ZERO) as Address,
  LendingCoreView: (process.env.NEXT_PUBLIC_LENDING_CORE_VIEW ?? ZERO) as Address,
  USDC: (process.env.NEXT_PUBLIC_USDC ?? ZERO) as Address,
  WETH: (process.env.NEXT_PUBLIC_WETH ?? ZERO) as Address,
  WBTC: (process.env.NEXT_PUBLIC_WBTC ?? ZERO) as Address,
  KinkedRateModel: (process.env.NEXT_PUBLIC_IRM ?? ZERO) as Address,
  WETHOracle: (process.env.NEXT_PUBLIC_WETH_ORACLE ?? ZERO) as Address,
  WBTCOracle: (process.env.NEXT_PUBLIC_WBTC_ORACLE ?? ZERO) as Address,
} as const

export const isDeployed = ADDRESSES.LendingCore !== ZERO

export const explorer = (addr: string) => `https://sepolia.basescan.org/address/${addr}`
