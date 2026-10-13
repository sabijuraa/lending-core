'use client'
import { useAccount } from 'wagmi'
import { useData } from '@/providers/provider'

/** Connected address, or a local demo account when running on mock data. */
export function useAccountId() {
  const { address } = useAccount()
  const data = useData()
  if (address) return { account: address as string, isDemo: false }
  if (data.source === 'mock') return { account: 'demo-account', isDemo: true }
  return { account: null, isDemo: false }
}
