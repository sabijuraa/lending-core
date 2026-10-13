import Link from 'next/link'
import { Skeleton } from './Skeleton'

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} height={44} />)}
    </div>
  )
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card" style={{ padding: 24, borderColor: 'var(--danger)' }}>
      <p style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 6 }}>Could not load this</p>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: onRetry ? 14 : 0 }}>{message}</p>
      {onRetry && <button className="btn btn-dark btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  )
}

export function EmptyBlock({ title, body, href, cta }: { title: string; body: string; href?: string; cta?: string }) {
  return (
    <div className="card" style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{title}</p>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: href ? 16 : 0 }}>{body}</p>
      {href && cta && <Link href={href} className="btn btn-primary btn-sm">{cta}</Link>}
    </div>
  )
}

export function DemoNotice() {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'chain') return null
  return (
    <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
      Demo data. Figures are illustrative and reset when you reload.
    </p>
  )
}
