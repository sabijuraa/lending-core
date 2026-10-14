'use client'
import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** False during server render and hydration, true afterwards. Use it to keep wallet state out of the first render. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
