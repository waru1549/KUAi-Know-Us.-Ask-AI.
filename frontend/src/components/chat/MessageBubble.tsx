
import RichText from './RichText'
import SatelliteAvatar from '../space/SatelliteAvatar'
import { useLanguage } from '../../contexts/language-context'

import type { Language } from '../../data/portfolioData'
import type { ChatMessage } from '../../types/chat'

interface MessageBubbleProps {
  message: ChatMessage
}

interface MessageBubbleCopy {
  user: string
  assistant: string
}

const messageBubbleCopy: Record<Language, MessageBubbleCopy> = {
  en: {
    user: 'You',
    assistant: 'Team AI',
  },
  th: {
    user: 'คุณ',
    assistant: 'ผู้ช่วย AI',
  },
}

function MessageBubble({ message }: MessageBubbleProps) {
  const { language } = useLanguage()
  const copy = messageBubbleCopy[language]

  const isUser = message.role === 'user'

  const formattedTime = new Date(
    message.createdAt,
  ).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`kuai-message flex w-full gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* AI Avatar */}
      {!isUser && <SatelliteAvatar />}

      <div
        className={`flex min-w-0 max-w-[85%] flex-col gap-1 sm:max-w-[75%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Sender name for screen readers; the bubble style shows it visually */}
        <span className="sr-only">
          {isUser ? copy.user : copy.assistant}
        </span>

        <div
          className={`px-4 py-3 ${
            isUser
              ? 'rounded-[20px_20px_4px_20px] bg-linear-to-br from-fuchsia-600 to-violet-600 text-white'
              : 'rounded-[4px_20px_20px_20px] border border-white/10 bg-white/7 text-slate-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-7">
              {message.content}
            </p>
          ) : (
            <RichText text={message.content} />
          )}
        </div>

        <time
          dateTime={message.createdAt}
          className="px-1 text-[10px] text-slate-500"
        >
          {formattedTime}
        </time>
      </div>
    </div>
  )
}

export default MessageBubble
