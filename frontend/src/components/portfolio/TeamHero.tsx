import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type CSSProperties,
  type PointerEvent,
} from 'react'

import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { useLanguage } from '../../contexts/language-context'
import {
  getLocalizedText,
  usePortfolioData,
} from '../../data/portfolioData'

const QUESTION_ROTATION_MS = 2600

function TeamHero() {
  const { language } = useLanguage()
  const { group, members } = usePortfolioData()
  const navigate = useNavigate()

  const spotlightRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const [questionIndex, setQuestionIndex] = useState(0)

  const copy =
    language === 'th'
      ? {
          askLabel: 'ถามคำถามเกี่ยวกับทีม',
          ask: 'ถาม AI',
          askHint: 'ตอบได้ทั้งภาษาไทยและอังกฤษ · ขับเคลื่อนด้วย Google Gemini',
          meetTeam: 'รู้จักทีมของเรา',
          sample: 'ตัวอย่างบทสนทนา',
          sampleQuestion: 'ใครดูแลฐานข้อมูลของทีม?',
          questions: [
            'ใครเป็นคนทำ Chat UI ของทีม?',
            'ทีมนี้ใช้ Tech Stack อะไรบ้าง?',
            'ภูมิเคยทำโปรเจกต์อะไรมาบ้าง?',
            'วิวดูแลส่วนไหนของโปรเจกต์?',
          ],
        }
      : {
          askLabel: 'Ask a question about the team',
          ask: 'Ask AI',
          askHint: 'Answers in Thai or English · Powered by Google Gemini',
          meetTeam: 'Meet the team',
          sample: 'Sample conversation',
          sampleQuestion: 'Who looks after the team database?',
          questions: [
            'Who built the chat UI?',
            'What tech stack does the team use?',
            'What has Phum built before?',
            'Which part of the project does View own?',
          ],
        }

  // Rotate the example question shown in the empty ask box.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuestionIndex((current) => (current + 1) % 4)
    }, QUESTION_ROTATION_MS)

    return () => window.clearInterval(timer)
  }, [])

  const appFullName = group.appFullName || group.teamName
  const tagline = getLocalizedText(group.taglineI18n, language) || group.tagline
  const introduction = getLocalizedText(group.introduction, language)

  // Split the tagline so each word can rise in on its own.
  const taglineWords = tagline.split(/\s+/).filter(Boolean)

  // Build the sample answer from real data: the backend member's name and role.
  const backendMember = members.find((member) => member.roleKey === 'backend')
  const sampleAnswer = backendMember
    ? `${getLocalizedText(backendMember.nicknameI18n ?? { en: backendMember.nickname, th: backendMember.nickname }, language)} — ${getLocalizedText(backendMember.roleNameI18n, language) || backendMember.roleName}`
    : ''

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    spotlightRef.current?.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    spotlightRef.current?.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  const handleAsk = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = question.trim() || copy.questions[questionIndex]
    navigate(`/chat?q=${encodeURIComponent(text)}`)
  }

  return (
    <section
      aria-labelledby="team-hero-title"
      onPointerMove={handlePointerMove}
      className="relative isolate flex min-h-[calc(100vh-73px)] items-center overflow-hidden px-5 py-20 sm:py-28 lg:px-8"
    >
      {/* Spotlight that follows the pointer */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(520px circle at var(--spot-x, 70%) var(--spot-y, 35%), rgb(240 171 252 / 0.14), transparent 60%)',
        }}
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="min-w-0">
          <p className="kuai-fade inline-flex items-center gap-2 rounded-full border border-accent-magenta/30 bg-fuchsia-500/10 px-4 py-2 font-mono text-xs tracking-[0.2em] text-accent-magenta">
            <Sparkles size={14} aria-hidden="true" />
            {appFullName.toUpperCase()}
          </p>

          <h1
            id="team-hero-title"
            className="mt-8 font-display text-5xl font-extrabold uppercase leading-[0.92] tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl xl:text-[8rem]"
          >
            {taglineWords.map((word, index) => {
              const isLast = index === taglineWords.length - 1
              const isSecondLine = index >= Math.ceil(taglineWords.length / 2)

              return (
                <span key={`${index}-${word}`} className="kuai-word">
                  <span
                    className={isLast ? 'kuai-shine' : isSecondLine ? 'kuai-glow-text' : undefined}
                    style={{ animationDelay: `${0.05 + index * 0.1}s` }}
                  >
                    {word}
                    {!isLast && ' '}
                  </span>
                </span>
              )
            })}
          </h1>

          {introduction && (
            <p
              className="kuai-fade mt-8 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              style={{ animationDelay: '0.7s' }}
            >
              {introduction}
            </p>
          )}

          {/* Ask the AI straight from the hero */}
          <form
            onSubmit={handleAsk}
            className="kuai-fade mt-10 max-w-2xl"
            style={{ animationDelay: '0.85s' }}
          >
            <label htmlFor="hero-question" className="sr-only">
              {copy.askLabel}
            </label>

            <div
              className="kuai-ring kuai-glass flex items-center gap-3 rounded-full border border-white/10 bg-surface-900 py-2 pl-5 pr-2 shadow-glow"
              style={{ '--kuai-ring-color': '#22d3ee' } as CSSProperties}
            >
              <Sparkles size={20} className="shrink-0 text-accent-magenta" aria-hidden="true" />

              <input
                id="hero-question"
                type="text"
                value={question}
                maxLength={2000}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={copy.questions[questionIndex]}
                className="h-11 min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                className="kuai-gradient-button inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta"
              >
                {copy.ask}
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            </div>

            <p className="mt-3 pl-5 text-xs text-slate-400">{copy.askHint}</p>
          </form>

          <a
            href="#members"
            className="kuai-fade mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            style={{ animationDelay: '1s' }}
          >
            {copy.meetTeam}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>

        {/* Floating sample conversation */}
        {sampleAnswer && (
          <aside
            aria-label={copy.sample}
            className="kuai-fade hidden lg:block"
            style={{ animationDelay: '1s' }}
          >
            <div className="kuai-float kuai-glass rounded-[1.75rem] border border-white/12 bg-white/6 p-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="kuai-orb size-9 rounded-xl" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-white">KUAi Assistant</p>
                  <p className="text-xs text-accent-cyan">{copy.sample}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 text-sm leading-6">
                <p className="max-w-[85%] self-end rounded-[18px_18px_4px_18px] bg-linear-to-br from-fuchsia-600 to-violet-600 px-4 py-2.5 text-white">
                  {copy.sampleQuestion}
                </p>
                <p className="max-w-[90%] rounded-[18px_18px_18px_4px] border border-white/10 bg-white/8 px-4 py-3 text-slate-200">
                  {sampleAnswer}
                  <span className="kuai-caret" aria-hidden="true" />
                </p>
              </div>

              <Link
                to="/chat"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-magenta hover:text-white"
              >
                KUAi Assistant
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        )}
      </div>
    </section>
  )
}

export default TeamHero
