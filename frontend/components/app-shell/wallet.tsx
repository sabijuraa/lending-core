'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { wagmiConfig } from '@/lib/wagmi'
import { useMounted } from '@/lib/use-mounted'

const APP_PREFIXES = ['/dashboard', '/markets', '/supply', '/borrow', '/earn', '/portfolio', '/liquidations', '/transactions', '/analytics']

export function isAppPath(pathname: string) {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export const TARGET_CHAIN = wagmiConfig.chains[0]

/** Wallet state and actions shared by the app shell and app pages. */
export function useWallet() {
  const account = useAccount()
  const mounted = useMounted()
  const address = mounted ? account.address : undefined
  const isConnected = mounted && account.isConnected
  const chainId = mounted ? account.chainId : undefined
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const router = useRouter()
  const pathname = usePathname()

  const connectWallet = () =>
    connect(
      { connector: injected() },
      {
        onSuccess: () => {
          if (!isAppPath(pathname)) router.push('/dashboard')
        },
      },
    )

  return {
    address,
    isConnected: isConnected && !!address,
    isConnecting: isPending,
    wrongNetwork: isConnected && chainId !== undefined && chainId !== TARGET_CHAIN.id,
    isSwitching,
    connectWallet,
    disconnect: () => disconnect(),
    switchNetwork: () => switchChain({ chainId: TARGET_CHAIN.id }),
  }
}

/** Plain text Connect Wallet button, no icon. */
export function ConnectWalletButton({ className = 'btn btn-primary', style }: { className?: string; style?: React.CSSProperties }) {
  const { connectWallet, isConnecting } = useWallet()
  return (
    <button type="button" className={className} style={style} onClick={connectWallet} disabled={isConnecting}>
      {isConnecting ? 'Connecting' : 'Connect Wallet'}
    </button>
  )
}
