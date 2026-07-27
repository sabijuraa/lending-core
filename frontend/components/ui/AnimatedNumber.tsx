'use client'
import { useEffect, useRef, useState } from 'react'
import { formatUSD, formatPercent, formatNumber } from '@/lib/formatting'

interface Props {
  value: number
  format?: 'currency' | 'percent' | 'number' | 'compact-currency'
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
  className?: string
}

export function AnimatedNumber({ value, format = 'number', decimals = 2, duration = 800, prefix = '', suffix = '', style, className }: Props) {
  const [display, setDisplay] = useState(0)
  const animRef = useRef<number | undefined>(undefined)
  const startRef = useRef(0)
  const startTimeRef = useRef(0)
  const targetRef = useRef(value)

  useEffect(() => {
    const prev = targetRef.current
    targetRef.current = value
    startRef.current = prev
    startTimeRef.current = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const p = Math.min((now - startTimeRef.current) / duration, 1)
      setDisplay(startRef.current + (value - startRef.current) * ease(p))
      if (p < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [value, duration])

  const fmt = () => {
    switch (format) {
      case 'currency': return formatUSD(display)
      case 'compact-currency': return formatUSD(display, true)
      case 'percent': return formatPercent(display, decimals)
      default: return formatNumber(display, decimals)
    }
  }

  return <span style={{ fontFamily: 'var(--font-mono)', ...style }} className={className}>{prefix}{fmt()}{suffix}</span>
}
