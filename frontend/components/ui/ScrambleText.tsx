'use client'
import { useEffect, useRef, useState } from 'react'

const CHARS = '!@#$%^&*()_+-=[]{}|;<>?,./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

interface Props {
  text: string
  trigger?: boolean
  delay?: number
  duration?: number
  style?: React.CSSProperties
  className?: string
}

export function ScrambleText({ text, trigger = true, delay = 0, duration = 800, style, className }: Props) {
  const [display, setDisplay] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const startTime = useRef<number>(0)

  useEffect(() => {
    if (!trigger) return

    timeoutRef.current = setTimeout(() => {
      startTime.current = Date.now()
      let iteration = 0

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime.current
        const progress = Math.min(elapsed / duration, 1)

        const resolved = Math.floor(progress * text.length)

        setDisplay(
          text.split('').map((char, i) => {
            if (char === ' ') return ' '
            if (i < resolved) return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          }).join('')
        )

        iteration++
        if (progress >= 1) {
          setDisplay(text)
          clearInterval(intervalRef.current)
        }
      }, 30)
    }, delay)

    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(intervalRef.current)
    }
  }, [text, trigger, delay, duration])

  return (
    <span style={style} className={className}>
      {display || text.replace(/[^ ]/g, '█')}
    </span>
  )
}
