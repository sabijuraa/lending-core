'use client'
import { useCallback, useEffect, useState } from 'react'

/** Small loader hook so pages can show skeleton, error and empty states. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])
  useEffect(() => {
    let live = true
    // Show the loading state again whenever the inputs change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fn()
      .then((d) => { if (live) { setData(d); setError(null) } })
      .catch((e: unknown) => { if (live) setError(e instanceof Error ? e.message : 'Something went wrong while loading.') })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])
  return { data, error, loading, reload }
}
