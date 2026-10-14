'use client'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset = (d: Direction, dist: number) => ({
  x: d === 'left' ? -dist : d === 'right' ? dist : 0,
  y: d === 'up' ? dist : d === 'down' ? -dist : 0,
})

const EASE = [0.16, 1, 0.3, 1] as const

/** Fades and slides its children in once they scroll into view. */
export function Reveal({
  children,
  from = 'up',
  delay = 0,
  distance = 24,
  duration = 0.6,
  className,
  style,
}: {
  children: ReactNode
  from?: Direction
  delay?: number
  distance?: number
  duration?: number
  className?: string
  style?: CSSProperties
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, ...offset(from, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

/** Staggers its StaggerItem children in as the group scrolls into view. */
export function Stagger({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={style}
      variants={container}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={item}>
      {children}
    </motion.div>
  )
}
