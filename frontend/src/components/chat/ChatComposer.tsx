import {
  countGraphemes,
  MAX_CHAT_MESSAGE_GRAPHEMES,
  truncateGraphemes,
} from '../../utils/chatMessage'

import type { FormEvent } from 'react'

import {
  ArrowRight,
  LoaderCircle,
} from 'lucide-react'

import { useLanguage } from '../../contexts/language-context'

import type { Language } from '../../data/portfolioData'

interface ChatComposerProps {
  value: string
  isLoading: boolean
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

interface ChatComposerCopy {
  placeholder: string
  inputLabel: string
  sendMessage: string
  keyboardHint: string
  characterUnit: string
}

const composerCopy: Record<Language, ChatComposerCopy> = {
  en: {
    placeholder: 'Ask anything about our team...',
    inputLabel: 'Type your message',
    sendMessage: 'Send message',
    keyboardHint: 'Enter to send · Shift + Enter for a new line',
    characterUnit: 'characters',
  },
  th: {
    placeholder: 'ถามอะไรก็ได้เกี่ยวกับทีมของเรา...',
    inputLabel: 'พิมพ์ข้อความของคุณ',
    sendMessage: 'ส่งข้อความ',
    keyboardHint: 'กด Enter เพื่อส่ง · Shift + Enter เพื่อขึ้นบรรทัดใหม่',
    characterUnit: 'ตัวอักษร',
  },
}

function ChatComposer({
  value,
  isLoading,
  onChange,
  onSubmit,
}: ChatComposerProps) {
  const { language } = useLanguage()
  const copy = composerCopy[language]

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-white/10 bg-ink-950/30 p-3 sm:p-4"
    >
      <div className="flex items-end gap-2.5">
      <div className="flex min-w-0 flex-1 items-center rounded-[26px] border border-white/10 bg-ink-950/70 px-4 transition focus-within:border-fuchsia-400/50">
        <textarea
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value

            onChange(
              truncateGraphemes(nextValue),
            )
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder={copy.placeholder}
          aria-label={copy.inputLabel}
          aria-describedby="chat-composer-hint chat-composer-count"
          rows={1}
          disabled={isLoading}
          className="max-h-36 min-h-[50px] flex-1 resize-none bg-transparent py-3 text-[15px] leading-6 text-white outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          aria-label={copy.sendMessage}
          className="grid size-[52px] shrink-0 place-items-center rounded-full kuai-gradient-button text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
        >
          {isLoading ? (
            <LoaderCircle
              size={19}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <ArrowRight
              size={20}
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-end gap-2 px-4">
        <p
          id="chat-composer-hint"
          className="sr-only"
        >
          {copy.keyboardHint}
        </p>

        <p
          id="chat-composer-count"
          className="text-[10px] text-slate-500"
        >
          {countGraphemes(value)}/{MAX_CHAT_MESSAGE_GRAPHEMES} {copy.characterUnit}
        </p>
      </div>
    </form>
  )
}

export default ChatComposer
