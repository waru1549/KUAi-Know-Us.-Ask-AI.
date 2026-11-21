import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import { useLanguage } from '../../contexts/language-context'
import type { Language } from '../../data/portfolioData'
import SpaceShip from '../space/SpaceShip'
import { rememberIntroSeen } from './introStorage'

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

const LAUNCH_MS = 2150 // ship shakes, launches, stars stretch, flash
const LEAVE_MS = 800
const ORBIT_DEG_PER_FRAME = 0.12
const PAUSE_AFTER_INPUT_MS = 4500

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/+$/, '')

/* -------------------------------------------------------------------------- */
/* Crew shown on the hologram (live data with a built-in fallback)             */
/* -------------------------------------------------------------------------- */

interface Pair {
  en: string
  th: string
}

interface CrewCard {
  id: string
  nickname: Pair
  fullName: Pair
  role: string
  contribution: Pair
  skills: readonly string[]
  avatar?: string
}

const FALLBACK_CREW: readonly CrewCard[] = [
  {
    id: 'member-1',
    nickname: { en: 'Ice', th: 'ไอซ์' },
    fullName: { en: 'Warunee Kludpan', th: 'วารุณี กลัดพันธ์' },
    role: 'Frontend Developer & UI/UX Designer',
    contribution: { en: 'Portfolio UI, chat UI and state management', th: 'Portfolio UI, Chat UI และ State Management' },
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
    avatar: '/images/projects/member-1/member-1.jpg',
  },
  {
    id: 'member-2',
    nickname: { en: 'Phum', th: 'ภูมิ' },
    fullName: { en: 'Thanakrit Archawabool', th: 'ธนกฤต อาชะวะบูล' },
    role: 'Backend Developer & Database Engineer',
    contribution: { en: 'Express API, PostgreSQL and AI context injection', th: 'Express API, PostgreSQL และ AI Context Injection' },
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Prompt Engineering'],
    avatar: '/images/projects/member-2/member-2.jpeg',
  },
  {
    id: 'member-3',
    nickname: { en: 'View', th: 'วิว' },
    fullName: { en: 'Thitiyaporn Mekcha-um', th: 'ฐิติญาภรณ์ เมฆชะอุ้ม' },
    role: 'DevOps & Full-Stack QA Engineer',
    contribution: {
      en: 'GitHub Actions CI/CD, automated deploys (Render + Vercel) and automated testing',
      th: 'GitHub Actions CI/CD, Deploy อัตโนมัติ (Render + Vercel) และ Automated Testing',
    },
    skills: ['GitHub Actions', 'Render', 'Vercel', 'Vitest'],
    avatar: '/images/projects/member-3/member-3.jpg',
  },
]

type MaybePair = { en?: string; th?: string } | undefined

function pick(value: MaybePair, fallback: Pair): Pair {
  return { en: value?.en?.trim() || fallback.en, th: value?.th?.trim() || fallback.th }
}

/** Turn the /api/portfolio members into hologram cards, keeping fallback values for gaps. */
function toCrew(result: unknown): readonly CrewCard[] | null {
  if (typeof result !== 'object' || result === null || !('members' in result)) return null
  const members = (result as { members: unknown }).members
  if (!Array.isArray(members) || members.length !== FALLBACK_CREW.length) return null

  return members.map((raw, index) => {
    const base = FALLBACK_CREW[index]
    const m = (raw ?? {}) as {
      id?: string; nickname?: string; fullName?: string; avatar?: string; highlightSkills?: string[]
      nicknameI18n?: MaybePair; fullNameI18n?: MaybePair; roleNameI18n?: MaybePair; mainContribution?: MaybePair
    }
    return {
      id: m.id ?? base.id,
      nickname: pick(m.nicknameI18n ?? { en: m.nickname, th: m.nickname }, base.nickname),
      fullName: pick(m.fullNameI18n ?? { en: m.fullName, th: m.fullName }, base.fullName),
      role: m.roleNameI18n?.en?.trim() || base.role,
      contribution: pick(m.mainContribution, base.contribution),
      skills: m.highlightSkills?.length ? m.highlightSkills.slice(0, 4) : base.skills,
      avatar: m.avatar || base.avatar,
    }
  })
}

/* -------------------------------------------------------------------------- */
/* Copy                                                                        */
/* -------------------------------------------------------------------------- */

interface IntroCopy {
  region: string
  kicker: string
  title1: string
  title2: string
  goLabel: string
  hint: string
  skip: string
  transmission: string
  enter: string
  prev: string
  next: string
}

const COPY: Record<Language, IntroCopy> = {
  en: {
    region: 'KUAi welcome journey',
    kicker: 'KUAi — Know Us. Ask AI.',
    title1: 'Ready for launch',
    title2: 'into our universe',
    goLabel: 'GO — launch the ship',
    hint: 'Press GO to warp to our crew',
    skip: 'Skip',
    transmission: 'INCOMING TRANSMISSION · CREW',
    enter: 'Enter the portfolio',
    prev: 'Previous crew member',
    next: 'Next crew member',
  },
  th: {
    region: 'การเดินทางต้อนรับของ KUAi',
    kicker: 'KUAi — Know Us. Ask AI.',
    title1: 'พร้อมออกเดินทาง',
    title2: 'สู่จักรวาลของเรา',
    goLabel: 'GO — ออกเดินทาง',
    hint: 'กด GO เพื่อวาร์ปไปพบลูกเรือของเรา',
    skip: 'ข้าม',
    transmission: 'INCOMING TRANSMISSION · CREW',
    enter: 'เข้าสู่ Portfolio',
    prev: 'ลูกเรือคนก่อนหน้า',
    next: 'ลูกเรือคนถัดไป',
  },
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

/* -------------------------------------------------------------------------- */
/* Starfield with warp speed                                                   */
/* -------------------------------------------------------------------------- */

function useStarfield(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  speedRef: React.RefObject<number>,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext?.('2d')
    if (!canvas || !ctx) return

    const colors = ['#ffffff', '#e9d5ff', '#a5f3fc', '#f5d0fe', '#c7d2fe']
    let width = 0
    let height = 0
    let stars: { x: number; y: number; z: number; pz: number; c: string }[] = []
    let speed = speedRef.current
    let frame = 0

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.width = window.innerWidth * dpr
      height = canvas.height = window.innerHeight * dpr
      stars = Array.from({ length: 650 }, () => {
        const z = Math.random() * width
        return {
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z,
          pz: z,
          c: colors[Math.floor(Math.random() * colors.length)],
        }
      })
    }

    const draw = () => {
      speed += (speedRef.current - speed) * 0.06
      ctx.fillStyle = speed > 6 ? 'rgba(5,3,15,0.35)' : 'rgba(5,3,15,0.9)'
      ctx.fillRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      for (const s of stars) {
        s.pz = s.z
        s.z -= speed * (width / 900)
        if (s.z < 1) {
          s.x = (Math.random() - 0.5) * width * 2
          s.y = (Math.random() - 0.5) * height * 2
          s.z = width
          s.pz = s.z
        }
        const sx = cx + (s.x / s.z) * (width / 2)
        const sy = cy + (s.y / s.z) * (height / 2)
        const px = cx + (s.x / s.pz) * (width / 2)
        const py = cy + (s.y / s.pz) * (height / 2)
        const r = Math.max(0.4, (1 - s.z / width) * 2.4)
        ctx.globalAlpha = Math.min(1, (1 - s.z / width) * 1.4)
        ctx.strokeStyle = s.c
        ctx.fillStyle = s.c
        if (speed > 3) {
          ctx.lineWidth = r
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(sx, sy)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      frame = window.requestAnimationFrame(draw)
    }

    seed()
    frame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', seed)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', seed)
    }
  }, [canvasRef, speedRef])
}

/* -------------------------------------------------------------------------- */
/* Hologram pieces                                                             */
/* -------------------------------------------------------------------------- */

function ProjectorPad() {
  return (
    <svg className="intro-projector" viewBox="0 0 300 130" aria-hidden="true">
      <defs>
        <linearGradient id="intro-rim" x1="20" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312e81" /><stop offset=".18" stopColor="#e9d5ff" /><stop offset=".42" stopColor="#7c3aed" />
          <stop offset=".7" stopColor="#c4b5fd" /><stop offset=".88" stopColor="#38bdf8" /><stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="intro-side" x1="0" y1="60" x2="0" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b21b6" /><stop offset="1" stopColor="#0b0720" />
        </linearGradient>
        <radialGradient id="intro-core" cx=".5" cy=".45" r=".6">
          <stop stopColor="#ffffff" /><stop offset=".35" stopColor="#a5f3fc" /><stop offset=".75" stopColor="#0ea5e9" /><stop offset="1" stopColor="#075985" />
        </radialGradient>
        <radialGradient id="intro-table" cx=".5" cy=".5" r=".5">
          <stop stopColor="#67e8f9" stopOpacity=".35" /><stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <filter id="intro-core-blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <ellipse cx="150" cy="100" rx="150" ry="26" fill="url(#intro-table)" />
      <path d="M20 62 v16 a130 32 0 0 0 260 0 v-16 Z" fill="url(#intro-side)" />
      <ellipse cx="150" cy="78" rx="130" ry="32" fill="none" stroke="#f0abfc" strokeOpacity=".35" />
      <ellipse cx="150" cy="62" rx="130" ry="32" fill="url(#intro-rim)" />
      <ellipse cx="150" cy="62" rx="130" ry="32" fill="none" stroke="#f5d0fe" strokeOpacity=".55" />
      <ellipse cx="150" cy="62" rx="100" ry="24" fill="#120a2a" stroke="#a78bfa" strokeWidth="2" />
      <ellipse cx="150" cy="62" rx="86" ry="20" fill="none" stroke="#05030f" strokeWidth="9" strokeDasharray="70 14" />
      <ellipse className="intro-core-glow" cx="150" cy="60" rx="70" ry="16" fill="#67e8f9" filter="url(#intro-core-blur)" />
      <ellipse className="intro-core" cx="150" cy="60" rx="64" ry="14" fill="url(#intro-core)" />
      <path d="M92 58 C 120 50, 180 50, 208 58" stroke="#fff" strokeOpacity=".7" strokeWidth="2" fill="none" />
      <path d="M26 72 C 70 96, 230 96, 274 72" stroke="#67e8f9" strokeOpacity=".55" fill="none" />
      <circle className="kuai-blink" cx="150" cy="101" r="2.5" fill="#f0abfc" />
      <circle className="kuai-blink kuai-blink--late" cx="104" cy="98" r="2" fill="#67e8f9" />
      <circle className="kuai-blink kuai-blink--late" cx="196" cy="98" r="2" fill="#67e8f9" />
      <ellipse cx="150" cy="116" rx="96" ry="9" fill="#a78bfa" opacity=".16" />
    </svg>
  )
}

function HoloGlobe() {
  return (
    <svg className="intro-globe" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="intro-globe-fill" cx=".4" cy=".35" r=".7">
          <stop stopColor="#a5f3fc" stopOpacity=".35" /><stop offset="1" stopColor="#0891b2" stopOpacity=".05" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="78" fill="url(#intro-globe-fill)" stroke="#67e8f9" strokeOpacity=".7" />
      <ellipse cx="100" cy="100" rx="78" ry="26" fill="none" stroke="#67e8f9" strokeOpacity=".35" />
      <ellipse cx="100" cy="70" rx="68" ry="20" fill="none" stroke="#67e8f9" strokeOpacity=".25" />
      <ellipse cx="100" cy="130" rx="68" ry="20" fill="none" stroke="#67e8f9" strokeOpacity=".25" />
      <ellipse className="intro-meridian" cx="100" cy="100" rx="78" ry="78" fill="none" stroke="#a5f3fc" strokeOpacity=".5" />
      <ellipse className="intro-meridian intro-meridian--2" cx="100" cy="100" rx="78" ry="78" fill="none" stroke="#a5f3fc" strokeOpacity=".4" />
      <ellipse className="intro-meridian intro-meridian--3" cx="100" cy="100" rx="78" ry="78" fill="none" stroke="#a5f3fc" strokeOpacity=".3" />
      <text x="100" y="108" textAnchor="middle" fontFamily="'Bricolage Grotesque', 'Space Grotesk', sans-serif" fontWeight="700" fontSize="26" fill="#ecfeff" opacity=".9">
        KUAi
      </text>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Intro journey: ship → warp → hologram crew → portfolio                      */
/* -------------------------------------------------------------------------- */

type Phase = 'ship' | 'launch' | 'holo'

interface IntroScreenProps {
  onFinish: () => void
}

/**
 * The welcome journey before the portfolio:
 * 1. The KUAi ship floats; GO launches it and the stars stretch into warp.
 * 2. A projector pad beams up three crew holograms orbiting a holo-globe.
 * 3. "Enter the portfolio" (or Skip / Esc at any time) opens the site.
 * Reduced-motion visitors skip the warp and the orbit stays still.
 */
function IntroScreen({ onFinish }: IntroScreenProps) {
  const { language } = useLanguage()
  const copy = COPY[language]

  const [reduceMotion] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState<Phase>('ship')
  const [leaving, setLeaving] = useState(false)
  const [flash, setFlash] = useState(0)
  const [crew, setCrew] = useState<readonly CrewCard[]>(FALLBACK_CREW)
  const [front, setFront] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speedRef = useRef(0.6)
  const goRef = useRef<HTMLButtonElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const globeRef = useRef<HTMLDivElement>(null)
  const angleRef = useRef(0)
  const targetRef = useRef<number | null>(null)
  const resumeAtRef = useRef(0)
  const frontRef = useRef(0)
  const timersRef = useRef<number[]>([])

  useStarfield(canvasRef, speedRef)

  // Load the live crew details; the built-in copy shows until (or if) it arrives.
  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBaseUrl}/api/portfolio`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: unknown) => {
        const live = toCrew(result)
        if (live) setCrew(live)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  // Clear any pending launch timers if the intro closes early.
  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const leave = useCallback(() => {
    if (leaving) return
    rememberIntroSeen()
    setLeaving(true)
    timersRef.current.push(window.setTimeout(onFinish, LEAVE_MS))
  }, [leaving, onFinish])

  const launch = useCallback(() => {
    if (phase !== 'ship') return
    if (reduceMotion) {
      setPhase('holo')
      return
    }
    setPhase('launch')
    timersRef.current.push(
      window.setTimeout(() => { speedRef.current = 55 }, 450),
      window.setTimeout(() => setFlash((value) => value + 1), 1900),
      window.setTimeout(() => {
        speedRef.current = 0.35
        angleRef.current = -40
        targetRef.current = 0
        resumeAtRef.current = performance.now() + 2500
        setPhase('holo')
      }, LAUNCH_MS),
    )
  }, [phase, reduceMotion])

  const bringToFront = useCallback((index: number) => {
    const step = 360 / crew.length
    const diff = ((((index * step - angleRef.current) % 360) + 540) % 360) - 180
    targetRef.current = angleRef.current + diff
    resumeAtRef.current = performance.now() + PAUSE_AFTER_INPUT_MS
  }, [crew.length])

  // Focus the main action of each scene for keyboard users.
  useEffect(() => {
    if (phase === 'ship') goRef.current?.focus()
    if (phase === 'holo') enterRef.current?.focus()
  }, [phase])

  // Keyboard: Esc skips; arrows rotate the crew.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        leave()
      } else if (phase === 'holo' && event.key === 'ArrowRight') {
        bringToFront((frontRef.current + 1) % crew.length)
      } else if (phase === 'holo' && event.key === 'ArrowLeft') {
        bringToFront((frontRef.current + crew.length - 1) % crew.length)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [bringToFront, crew.length, leave, phase])

  // Keep the page behind from scrolling while the intro is open.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Orbit the three hologram cards around the globe.
  useEffect(() => {
    if (phase !== 'holo') return
    let frame = 0
    const step = 360 / crew.length

    const tick = (now: number) => {
      if (targetRef.current !== null) {
        angleRef.current += (targetRef.current - angleRef.current) * 0.08
        if (Math.abs(targetRef.current - angleRef.current) < 0.05) {
          angleRef.current = targetRef.current
          targetRef.current = null
        }
      } else if (!reduceMotion && now > resumeAtRef.current) {
        angleRef.current += ORBIT_DEG_PER_FRAME
      }

      const radius = window.innerWidth < 520 ? 104 : 270
      let best = 0
      let bestCos = -2
      cardRefs.current.forEach((card, index) => {
        if (!card) return
        const phi = ((index * step - angleRef.current) * Math.PI) / 180
        const depth = (Math.cos(phi) + 1) / 2
        card.style.transform = `translate3d(${Math.sin(phi) * radius}px, ${(1 - depth) * -26}px, ${Math.cos(phi) * radius - radius}px) rotateY(${Math.sin(phi) * -18}deg)`
        card.style.opacity = (0.35 + depth * 0.65).toFixed(3)
        card.style.zIndex = String(Math.round(depth * 100))
        card.style.filter = `blur(${((1 - depth) * 1.6).toFixed(2)}px)`
        if (Math.cos(phi) > bestCos) {
          bestCos = Math.cos(phi)
          best = index
        }
      })
      if (globeRef.current) globeRef.current.style.transform = `translateZ(${-radius}px)`
      if (best !== frontRef.current) {
        frontRef.current = best
        setFront(best)
      }
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [crew.length, phase, reduceMotion])

  const pad = (value: number) => String(value).padStart(2, '0')
  const previous = (front + crew.length - 1) % crew.length
  const next = (front + 1) % crew.length

  return (
    <section
      aria-label={copy.region}
      className={`intro fixed inset-0 z-[100] overflow-hidden bg-[#05030f] text-white ${leaving ? 'intro--leaving' : ''}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />
      <div aria-hidden="true" className="intro-nebula" />
      {flash > 0 && <div key={flash} aria-hidden="true" className="intro-flash" />}

      <button
        type="button"
        onClick={leave}
        className="absolute right-5 top-5 z-20 min-h-11 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10 hover:text-white sm:right-8 sm:top-8"
      >
        {copy.skip}
      </button>

      {/* Scene 1: the KUAi ship floats, waiting for GO */}
      {phase !== 'holo' && (
        <div className={`intro-scene ${phase === 'launch' ? 'intro-scene--launch' : ''}`}>
          <p className="intro-fade font-mono text-xs tracking-[0.35em] text-accent-cyan">{copy.kicker}</p>
          <h1 className="intro-fade mt-3 text-center font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            {copy.title1}
            <br />
            <span className="kuai-shine">{copy.title2}</span>
          </h1>

          <div className="intro-ship-wrap">
            <SpaceShip className="intro-ship" title="KUAi spaceship" />
          </div>

          <button ref={goRef} type="button" onClick={launch} aria-label={copy.goLabel} className="intro-fade intro-go">
            GO
          </button>
          <p className="intro-fade mt-3 text-sm text-slate-300">{copy.hint}</p>
        </div>
      )}

      {/* Scene 2: three crew holograms orbit above the projector */}
      {phase === 'holo' && (
        <div className="intro-scene intro-scene--holo">
          <div className="intro-stage">
            <p className="intro-stage-head font-mono text-[11px] tracking-[0.22em] text-accent-cyan">
              ◉ {copy.transmission} {pad(crew.length)} · {pad(front + 1)} / {pad(crew.length)}
            </p>
            <div className="intro-column" aria-hidden="true" />
            <div className="intro-orbit-floor" aria-hidden="true" />
            <div className="intro-ring">
              <div ref={globeRef} className="intro-globe-wrap"><HoloGlobe /></div>
              {crew.map((member, index) => (
                <article
                  key={member.id}
                  ref={(element) => { cardRefs.current[index] = element }}
                  className={`intro-card ${index === front ? 'intro-card--front' : ''}`}
                  onClick={() => bringToFront(index)}
                >
                  <div className="intro-card-top">
                    <div className="intro-card-photo">
                      {member.avatar && <img src={member.avatar} alt="" />}
                    </div>
                    <div>
                      <h2 className="font-display text-[22px] font-bold leading-tight text-cyan-50">
                        {member.nickname[language]}
                      </h2>
                      <p className="text-xs text-cyan-200">{member.role}</p>
                    </div>
                  </div>
                  <div className="intro-card-more">
                    <p className="mt-2.5 text-[13px] text-cyan-100">
                      {member.fullName.en} · {member.fullName.th}
                    </p>
                    <div className="mt-3 rounded-xl border border-cyan-300/30 bg-cyan-950/40 px-3 py-2.5">
                      <p className="font-mono text-[10px] tracking-[0.2em] text-accent-cyan">MAIN CONTRIBUTION</p>
                      <p className="mt-1 text-[13px] text-cyan-50">{member.contribution[language]}</p>
                    </div>
                    <ul className="intro-card-skills mt-2.5 flex flex-wrap gap-1.5">
                      {member.skills.map((skill) => (
                        <li key={skill} className="rounded-full border border-cyan-300/35 px-2 py-0.5 text-[10px] text-cyan-100">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <ProjectorPad />

          <div className="mt-1.5 flex items-center justify-center gap-4">
            <button type="button" className="intro-arrow" aria-label={copy.prev} onClick={() => bringToFront(previous)}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="flex gap-2">
              {crew.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  aria-label={member.nickname[language]}
                  aria-pressed={index === front}
                  onClick={() => bringToFront(index)}
                  className={`intro-dot ${index === front ? 'intro-dot--on' : ''}`}
                />
              ))}
            </div>
            <button type="button" className="intro-arrow" aria-label={copy.next} onClick={() => bringToFront(next)}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <button
            ref={enterRef}
            type="button"
            onClick={leave}
            className="kuai-gradient-button mt-4 inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta"
          >
            {copy.enter}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}

export default IntroScreen
