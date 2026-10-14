'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Heartbeat, Wallet, Sliders } from '@phosphor-icons/react'
import { Reveal } from '@/components/ui/Reveal'
import s from './home.module.css'

// Example position used purely to illustrate how the health factor reacts to price.
const COLLATERAL = 2
const START_PRICE = 3000
const DEBT = 3000
const LLTV = 0.86

function status(hf: number) {
  if (hf < 1) return { label: 'Liquidatable', color: 'var(--danger)' }
  if (hf < 1.25) return { label: 'At risk', color: 'var(--warning)' }
  return { label: 'Safe', color: 'var(--positive)' }
}

export function PositionShowcase() {
  const [change, setChange] = useState(0)
  const price = START_PRICE * (1 + change / 100)
  const hf = (COLLATERAL * price * LLTV) / DEBT
  const st = status(hf)
  const liqDrop = (1 - DEBT / (COLLATERAL * LLTV * START_PRICE)) * 100
  const fill = Math.max(0, Math.min(hf / 3, 1))
  const ARC = 251.3

  return (
    <section className={s.block}>
      <div className="section-container">
        <div className={s.storyGrid}>
          <Reveal from="left">
            <p className={s.eyebrow}>Your position, at a glance</p>
            <h2 className={s.blockTitle}>Always know where you stand.</h2>
            <p className={s.blockSub}>
              Your dashboard turns every loan into one simple number. Above one you are safe, below one your collateral can be liquidated. Drag the slider to see how a price move changes it.
            </p>
            <ul className={s.featureList}>
              <li><Heartbeat size={18} weight="duotone" /> Health factor updates with every price change</li>
              <li><Sliders size={18} weight="duotone" /> See how far prices can fall before you are at risk</li>
              <li><Wallet size={18} weight="duotone" /> Add collateral or repay from the same screen</li>
            </ul>
            <Link href="/dashboard" className="btn btn-primary">
              Open your dashboard <ArrowRight size={13} weight="bold" />
            </Link>
          </Reveal>

          <Reveal from="right" delay={0.1}>
            <motion.div whileHover={{ y: -4 }} className={s.showcase}>
              <div className={s.showcaseHead}>
                <span>WETH / USDC</span>
                <span className={s.exampleTag}>Example position</span>
              </div>

              <div className={s.gaugeWrap}>
                <svg viewBox="0 0 200 120" className={s.gauge} aria-hidden="true">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--border-subtle)" strokeWidth="12" strokeLinecap="round" />
                  <motion.path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={st.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={ARC}
                    animate={{ strokeDashoffset: ARC * (1 - fill) }}
                    initial={{ strokeDashoffset: ARC }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  />
                </svg>
                <div className={s.gaugeText}>
                  <div className={s.gaugeValue}>{hf.toFixed(2)}</div>
                  <div className={s.gaugeLabel} style={{ color: st.color }}>{st.label}</div>
                </div>
              </div>

              <div className={s.showcaseRows}>
                <div><span>Collateral</span><strong>{COLLATERAL} WETH</strong></div>
                <div><span>Borrowed</span><strong>{DEBT.toLocaleString()} USDC</strong></div>
                <div><span>Safe until a drop of</span><strong>{liqDrop.toFixed(0)}%</strong></div>
              </div>

              <label className={s.sliderLabel}>
                <span>WETH price change</span>
                <strong style={{ color: change < 0 ? 'var(--danger)' : 'var(--text-1)' }}>
                  {change > 0 ? '+' : ''}{change}%
                </strong>
              </label>
              <input
                type="range"
                min={-60}
                max={30}
                step={1}
                value={change}
                onChange={e => setChange(Number(e.target.value))}
                className={s.slider}
                aria-label="WETH price change"
              />
              <p className={s.showcaseFoot}>Illustration only. Real positions use live market prices.</p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
