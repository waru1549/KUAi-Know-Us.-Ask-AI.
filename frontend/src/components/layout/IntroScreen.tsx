import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'

import { useLanguage } from '../../contexts/language-context'
import KuaiLogo from './KuaiLogo'
import { rememberIntroSeen } from './introStorage'

const PLAY_MS = 3400
const LEAVE_MS = 900

interface IntroScreenProps {
  onFinish: () => void
}

/**
 * Animated welcome screen before the portfolio:
 * hyperspace streaks → logo materialises → KUAi letters rise → tagline types →
 * "Enter" appears. Entering warps the camera forward into the site.
 * Skip any time with the button, Esc or Enter. Reduced-motion users get a static version.
 */
function IntroScreen({ onFinish }: IntroScreenProps) {
  const { language } = useLanguage()
  const isThai = language === 'th'

  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const enterRef = useRef<HTMLButtonElement>(null)

  const copy = isThai
    ? {
        region: 'หน้าต้อนรับ KUAi',
        enter: 'เข้าสู่จักรวาลของเรา',
        skip: 'ข้าม',
        loading: 'กำลังเตรียมจักรวาล…',
      }
    : {
        region: 'KUAi welcome screen',
        enter: 'Enter our universe',
        skip: 'Skip',
        loading: 'Preparing the universe…',
      }

  const leave = useCallback(() => {
    if (leaving) return
    rememberIntroSeen()
    setLeaving(true)
    window.setTimeout(onFinish, LEAVE_MS)
  }, [leaving, onFinish])

  // Reveal the Enter button once the opening sequence has played.
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setReady(true), reduceMotion ? 0 : PLAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (ready) enterRef.current?.focus()
  }, [ready])

  // Keyboard: Esc skips, Enter continues.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        event.preventDefault()
        leave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [leave])

  // Keep the page behind from scrolling while the intro is open.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  const wordmark = ['K', 'U', 'A', 'i']
  const tagline = 'KNOW US. ASK AI.'

  return (
    <section
      aria-label={copy.region}
      className={`intro fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#03020a] text-white ${
        leaving ? 'intro--leaving' : ''
      }`}
    >
      {/* Deep space backdrop */}
      <div aria-hidden="true" className="intro-space absolute inset-0">
        <div className="galaxy-stars galaxy-stars--1" />
        <div className="galaxy-stars galaxy-stars--2" />
        <div className="intro-hyperspace" />
        <div className="intro-nebula intro-nebula--a" />
        <div className="intro-nebula intro-nebula--b" />
      </div>

      <button
        type="button"
        onClick={leave}
        className="absolute right-5 top-5 z-10 min-h-11 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10 hover:text-white sm:right-8 sm:top-8"
      >
        {copy.skip}
      </button>

      <div className="intro-stage relative flex flex-col items-center px-6 text-center">
        {/* Glow ring + logo mark */}
        <div className="intro-mark relative">
          <div aria-hidden="true" className="intro-ring" />
          <KuaiLogo variant="mark" className="relative size-40 sm:size-52" />
        </div>

        {/* Wordmark: letters rise one by one */}
        <p
          aria-label="KUAi"
          className="mt-4 font-display text-6xl font-extrabold tracking-[-0.03em] sm:text-8xl"
        >
          {wordmark.map((letter, index) => (
            <span key={letter} aria-hidden="true" className="kuai-word">
              <span
                className={index >= 2 ? 'kuai-shine' : undefined}
                style={{ animationDelay: `${1.25 + index * 0.12}s` }}
              >
                {letter}
              </span>
            </span>
          ))}
        </p>

        {/* Tagline types itself out */}
        <p className="mt-4 font-mono text-xs tracking-[0.42em] text-indigo-200 sm:text-sm">
          <span className="intro-type" style={{ '--chars': tagline.length } as CSSProperties}>
            {tagline}
          </span>
        </p>

        {/* Progress, then the Enter button */}
        <div className="mt-12 flex h-16 items-center justify-center">
          {ready ? (
            <button
              ref={enterRef}
              type="button"
              onClick={leave}
              className="intro-enter kuai-gradient-button inline-flex min-h-14 items-center gap-3 rounded-full px-8 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta"
            >
              {copy.enter}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <div role="status" className="flex flex-col items-center gap-3">
              <div aria-hidden="true" className="h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
                <div className="intro-progress h-full rounded-full bg-linear-to-r from-fuchsia-400 via-violet-400 to-cyan-300" />
              </div>
              <span className="text-xs text-slate-400">{copy.loading}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default IntroScreen
