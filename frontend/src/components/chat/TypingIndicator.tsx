
import { useLanguage } from '../../contexts/language-context'
import SatelliteAvatar from '../space/SatelliteAvatar'

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
      <SatelliteAvatar />

      <div className="flex items-center gap-2.5 rounded-[4px_20px_20px_20px] border border-cyan-300/35 bg-cyan-950/35 px-4 py-3">
        <span className="sr-only">{copy.label}</span>
        <span className="kuai-waves" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] text-accent-cyan" aria-hidden="true">
          RECEIVING TRANSMISSION…
        </span>
      </div>
    </div>
  )
}

export default TypingIndicator
