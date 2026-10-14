'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Reveal } from '@/components/ui/Reveal'
import s from './home.module.css'

const TOKENS = ['WETH', 'WBTC', 'wstETH', 'LINK']
const BAD = 3
const loop = { duration: 4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' as const }

export function IsolationStory() {
  const reduce = useReducedMotion()
  const pulse = (bad: boolean) =>
    reduce
      ? {}
      : {
          animate: bad
            ? { backgroundColor: ['#FFFFFF', '#FBE9E7', '#FBE9E7', '#FFFFFF'], borderColor: ['#D8DDD5', '#B93832', '#B93832', '#D8DDD5'] }
            : {},
          transition: { ...loop, times: [0, 0.3, 0.75, 1] },
        }

  return (
    <section className={s.blockAlt}>
      <div className="section-container">
        <div className={s.storyGrid}>
          <Reveal from="left">
            <p className={s.eyebrow}>Why isolated markets</p>
            <h2 className={s.blockTitle}>One bad market should never sink the rest.</h2>
            <p className={s.blockSub}>
              In a pooled protocol every deposit sits in one shared pot. When a single price feed breaks or a thin token crashes, the losses reach everyone.
            </p>
            <p className={s.blockSub}>
              lending-core gives every pair its own market with its own price source and its own rules. If something goes wrong, the damage stays where it started and your other positions keep running.
            </p>
          </Reveal>

          <div className={s.compare}>
            <Reveal from="right" delay={0.05} className={s.comparePanel}>
              <div className={s.compareHead}>
                <span className={s.compareTag} data-tone="bad">Pooled lending</span>
                <span className={s.compareNote}>One shared pot</span>
              </div>
              <motion.div
                className={s.pool}
                {...(reduce ? {} : {
                  animate: { backgroundColor: ['#F7F8F4', '#FBE9E7', '#FBE9E7', '#F7F8F4'] },
                  transition: { ...loop, times: [0, 0.4, 0.75, 1] },
                })}
              >
                {TOKENS.map((t, i) => (
                  <motion.span key={t} className={s.chip} {...pulse(i === BAD)}>{t}</motion.span>
                ))}
              </motion.div>
              <p className={s.compareCaption}>A problem with one asset spreads to every depositor.</p>
            </Reveal>

            <Reveal from="right" delay={0.15} className={s.comparePanel}>
              <div className={s.compareHead}>
                <span className={s.compareTag} data-tone="good">lending-core</span>
                <span className={s.compareNote}>Separate markets</span>
              </div>
              <div className={s.isoGrid}>
                {TOKENS.map((t, i) => (
                  <motion.div key={t} className={s.isoCell} {...pulse(i === BAD)}>
                    <span className={s.isoName}>{t} / USDC</span>
                    <span className={s.isoState} data-bad={i === BAD ? 'true' : undefined}>
                      {i === BAD ? 'Contained' : 'Unaffected'}
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className={s.compareCaption}>The same problem stays inside the one market that chose it.</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
