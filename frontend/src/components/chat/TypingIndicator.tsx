
import { useLanguage } from '../../contexts/language-context'

import type { Language } from '../../data/portfolioData'

interface TypingIndicatorCopy {
  label: string
}

const typingIndicatorCopy: Record<Language, TypingIndicatorCopy> = {
  en: {
    label: 'Team AI is thinking...',
  },
  th: {
    label: 'ผู้ช่วย AI กำลังคิด...',
  },
}

function TypingIndicator() {
  const { language } = useLanguage()
  const copy = typingIndicatorCopy[language]

  return (
    <div
      role="status"
      aria-live="polite"
      className="kuai-message flex items-center gap-3"
    >
      <div
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-fuchsia-500 via-violet-600 to-cyan-400 font-display text-xs font-extrabold text-white"
        aria-hidden="true"
      >
        Ai
      </div>

      <div className="flex items-center gap-1.5 rounded-[4px_20px_20px_20px] border border-white/10 bg-white/7 px-4 py-4">
        <span className="sr-only">{copy.label}</span>
        <span className="kuai-typing-dot" aria-hidden="true" />
        <span className="kuai-typing-dot" aria-hidden="true" />
        <span className="kuai-typing-dot" aria-hidden="true" />
      </div>
    </div>
  )
}

export default TypingIndicator
