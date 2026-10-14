'use client'
import { useAccount } from 'wagmi'
import { useMounted } from './use-mounted'

/** The connected wallet address, or null when no wallet is connected. */
export function useAccountId() {
  const { address } = useAccount()
  const mounted = useMounted()
  return { account: mounted ? ((address as string | undefined) ?? null) : null }
}
