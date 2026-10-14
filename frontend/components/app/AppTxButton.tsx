'use client'
import { useEffect, useRef, useState } from 'react'
import { useData } from '@/providers/provider'
import { wagmiConfig } from '@/lib/wagmi'
import { truncateAddress } from '@/lib/formatting'

type Phase = 'idle' | 'wallet' | 'pending' | 'done' | 'error'

/** Turns wallet and RPC errors into one short sentence a person can act on. */
export function readableError(e: unknown): string {
  const err = e as { shortMessage?: string; message?: string; name?: string } | null
  const raw = (err?.shortMessage || err?.message || '').split('\n')[0].trim()
  if (/user (rejected|denied)|rejected the request|denied transaction/i.test(raw) || err?.name === 'UserRejectedRequestError') {
    return 'You cancelled the request in your wallet. Nothing was sent.'
  }
  if (/insufficient funds/i.test(raw)) return 'Your wallet does not have enough ETH to pay the network fee.'
  if (/connector not connected|no connector|not connected/i.test(raw)) return 'Connect your wallet and try again.'
  if (/chain mismatch|wrong network|does not match the target chain/i.test(raw)) return 'Switch your wallet to the right network and try again.'
  if (/execution reverted/i.test(raw)) {
    const reason = raw.replace(/.*execution reverted:?/i, '').trim()
    return reason ? `The transaction was rejected by the contract. ${reason}` : 'The transaction was rejected by the contract. Check the amount and try again.'
  }
  return raw || 'The transaction failed. Please try again.'
}

function txUrl(hash: string) {
  const base = wagmiConfig.chains[0]?.blockExplorers?.default.url
  return base ? `${base}/tx/${hash}` : null
}

/**
 * Primary action button that walks one transaction through every state.
 * Waiting for the wallet comes first, then the network, then a receipt with a link.
 */
export function AppTxButton({ label, disabled, run, onDone, variant = 'primary' }: {
  label: string
  disabled?: boolean
  run: () => Promise<{ hash: string }>
  onDone?: () => void
  variant?: 'primary' | 'secondary'
}) {
  const data = useData()
  const [phase, setPhase] = useState<Phase>('idle')
  const [msg, setMsg] = useState('')
  const [hash, setHash] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function go() {
    setPhase('wallet'); setMsg(''); setHash('')
    // Wallet prompts usually resolve within a few seconds, after which the request is on the network.
    timer.current = setTimeout(() => setPhase((p) => (p === 'wallet' ? 'pending' : p)), 4000)
    try {
      const r = await run()
      setHash(r.hash); setPhase('done'); onDone?.()
    } catch (e) {
      setPhase('error'); setMsg(readableError(e))
    } finally {
      if (timer.current) clearTimeout(timer.current)
    }
  }

  const busy = phase === 'wallet' || phase === 'pending'
  const text = phase === 'wallet' ? 'Confirm in your wallet' : phase === 'pending' ? 'Processing transaction' : label
  const url = hash && data.source === 'chain' ? txUrl(hash) : null

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button
        type="button"
        className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'} btn-lg`}
        style={{ width: '100%', justifyContent: 'center' }}
        disabled={disabled || busy}
        aria-busy={busy}
        onClick={go}
      >
        {busy && <span className="lc-spinner" aria-hidden="true" />}
        {text}
      </button>
      <div aria-live="polite" style={{ fontSize: 13, lineHeight: 1.5 }}>
        {phase === 'wallet' && <span style={{ color: 'var(--text-3)' }}>Approve the request in your wallet to continue.</span>}
        {phase === 'pending' && <span style={{ color: 'var(--text-3)' }}>Waiting for confirmation. If your wallet is still open, approve it there. Some actions ask for two signatures, an approval and then the action.</span>}
        {phase === 'done' && (
          <span style={{ color: 'var(--positive)' }}>
            Transaction confirmed.{' '}
            {url
              ? <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>View transaction {truncateAddress(hash, 6, 4)}</a>
              : <span style={{ color: 'var(--text-3)' }}>Reference {truncateAddress(hash, 6, 4)}</span>}
          </span>
        )}
        {phase === 'error' && <span role="alert" style={{ color: 'var(--danger)' }}>{msg}</span>}
      </div>
      <style>{`
        .lc-spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid currentColor; border-right-color: transparent; display: inline-block; animation: lc-spin 0.8s linear infinite; }
        @keyframes lc-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .lc-spinner { animation-duration: 2.4s; } }
      `}</style>
    </div>
  )
}
