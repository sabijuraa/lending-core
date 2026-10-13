'use client'
import { useState } from 'react'

type Phase = 'idle' | 'pending' | 'done' | 'error'

/** Button that walks a write through pending, confirmed and failed states. */
export function TxButton({ label, disabled, run, onDone }: { label: string; disabled?: boolean; run: () => Promise<{ hash: string }>; onDone?: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [msg, setMsg] = useState('')
  const [hash, setHash] = useState('')
  async function go() {
    setPhase('pending'); setMsg('')
    try {
      const r = await run()
      setHash(r.hash); setPhase('done'); onDone?.()
    } catch (e) {
      setPhase('error'); setMsg(e instanceof Error ? e.message.split('\n')[0] : 'The transaction failed.')
    }
  }
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={disabled || phase === 'pending'} onClick={go}>
        {phase === 'pending' ? 'Waiting for confirmation' : label}
      </button>
      <div aria-live="polite" style={{ fontSize: 13 }}>
        {phase === 'done' && (
          <span style={{ color: 'var(--positive)' }}>
            Confirmed. {process.env.NEXT_PUBLIC_DATA_SOURCE === 'chain'
              ? <a href={`https://sepolia.basescan.org/tx/${hash}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>View on Basescan</a>
              : <span style={{ color: 'var(--text-3)' }}>Demo transaction {hash.slice(0, 10)}</span>}
          </span>
        )}
        {phase === 'error' && <span style={{ color: 'var(--danger)' }}>{msg}</span>}
      </div>
    </div>
  )
}
