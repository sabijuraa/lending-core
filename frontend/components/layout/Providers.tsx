'use client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@/lib/wagmi'
import { useState } from 'react'
import { DataProviderRoot } from '@/providers/provider'

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 12000 } } }))
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>
        <DataProviderRoot>{children}</DataProviderRoot>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
