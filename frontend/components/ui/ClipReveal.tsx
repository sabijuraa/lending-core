'use client'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
  style?: React.CSSProperties
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
  type?: 'clip' | 'slide' | 'fade'
}

export function ClipReveal({ children, delay = 0, className, style, as: Tag = 'div', type = 'clip' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  if (type === 'clip') {
    return (
      <div ref={ref} style={{ overflow: 'hidden', ...style }} className={className}>
        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
          animate={inView ? { clipPath: 'inset(0 0% 0 0)', opacity: 1 } : {}}
          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  if (type === 'slide') {
    return (
      <div ref={ref} style={{ overflow: 'hidden', ...style }} className={className}>
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  )
}
