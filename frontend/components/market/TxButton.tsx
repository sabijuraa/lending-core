'use client'
import { useState } from 'react'
import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useAccountId } from '@/lib/use-account-id'
import { useData } from '@/providers/provider'
import { wagmiConfig } from '@/lib/wagmi'

export type TxPhase = 'idle' | 'pending' | 'done' | 'error'

/** Turns a raw wallet or contract error into one readable sentence. */
export function readableError(e: unknown) {
  const raw = e instanceof Error ? e.message : String(e)
  if (/user rejected|user denied|rejected the request/i.test(raw)) return 'You rejected the request in your wallet.'
  if (/insufficient funds/i.test(raw)) return 'Your wallet does not have enough funds to pay for this transaction.'
  const reverted = raw.match(/reverted with the following reason:\s*(.+)/i) ?? raw.match(/error:\s*([A-Za-z]+)\(\)/)
  if (reverted) return `The contract rejected this transaction (${reverted[1].trim()}).`
  return raw.split('\n')[0] || 'The transaction failed.'
}

/** Link to a transaction on the block explorer for the active chain. */
export function txUrl(hash: string) {
  const base = wagmiConfig.chains[0].blockExplorers?.default.url ?? ''
  return `${base}/tx/${hash}`
}

/** Runs a write and tracks it through pending, confirmed and failed states. */
export function useTx() {
  const [phase, setPhase] = useState<TxPhase>('idle')
  const [error, setError] = useState('')
  const [hash, setHash] = useState('')
  async function send(run: () => Promise<{ hash: string }>, onDone?: () => void) {
    setPhase('pending'); setError(''); setHash('')
    try {
      const r = await run()
      setHash(r.hash); setPhase('done'); onDone?.()
      return true
    } catch (e) {
      setError(readableError(e)); setPhase('error')
      return false
    }
  }
  const reset = () => { setPhase('idle'); setError(''); setHash('') }
  return { phase, error, hash, send, reset }
}

/** Status line under a transaction button. */
export function TxStatus({ phase, error, hash }: { phase: TxPhase; error: string; hash: string }) {
  const data = useData()
  return (
    <div aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5 }}>
      {phase === 'pending' && (
        <span style={{ color: 'var(--text-3)' }}>Confirm in your wallet. The transaction settles once the network includes it.</span>
      )}
      {phase === 'done' && (
        <span style={{ color: 'var(--positive)' }}>
          Confirmed.{' '}
          {data.source === 'chain' ? (
            <a href={txUrl(hash)} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 500 }}>View transaction</a>
          ) : (
            <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{hash.slice(0, 10)}...{hash.slice(-6)}</span>
          )}
        </span>
      )}
      {phase === 'error' && <span style={{ color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}

/** Primary action that asks for a wallet first, then walks the write through its states. */
export function TxButton({ label, disabled, run, onDone, size = 'lg' }: { label: string; disabled?: boolean; run: () => Promise<{ hash: string }>; onDone?: () => void; size?: 'lg' | 'md' }) {
  const tx = useTx()
  const { account } = useAccountId()
  const { connect, isPending: connecting } = useConnect()
  const cls = size === 'lg' ? 'btn btn-primary btn-lg' : 'btn btn-primary'

  if (!account) {
    return (
      <button className={cls} style={{ width: '100%', justifyContent: 'center' }} disabled={connecting} onClick={() => connect({ connector: injected() })}>
        {connecting ? 'Connecting wallet' : 'Connect wallet to continue'}
      </button>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button className={cls} style={{ width: '100%', justifyContent: 'center' }} disabled={disabled || tx.phase === 'pending'} onClick={() => tx.send(run, onDone)}>
        {tx.phase === 'pending' ? 'Waiting for confirmation' : label}
      </button>
      <TxStatus phase={tx.phase} error={tx.error} hash={tx.hash} />
    </div>
  )
}
