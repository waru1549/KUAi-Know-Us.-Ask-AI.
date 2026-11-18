
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  AlertCircle,
  History,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from 'lucide-react'

import { useSearchParams } from 'react-router'

import Navbar from '../components/layout/Navbar'
import { useLanguage } from '../contexts/language-context'

import type { Language } from '../data/portfolioData'
import MessageBubble from '../components/chat/MessageBubble'
import TypingIndicator from '../components/chat/TypingIndicator'
import ChatComposer from '../components/chat/ChatComposer'

import {
  deleteChatConversation,
  getChatHistory,
  sendChatMessage,
  ChatApiException,
} from '../services/chatApi'

import type { ChatMessage } from '../types/chat'

interface ChatPageCopy {
  title: string
  description: string
  newChat: string
  newChatAria: string
  history: string
  emptyHistory: string
  moreActions: string
  deleteChat: string
  aiProvider: string
  conversationLabel: string
  messagesLabel: string
  emptyTitle: string
  emptyDescription: string
  tryAsking: string
  suggestedPrompts: readonly string[]
  errorTitle: string
  genericError: string
  retry: string
  disclaimer: string
}

const chatPageCopy: Record<Language, ChatPageCopy> = {
  en: {
    title: 'Team AI Assistant',
    description:
      'Discover our team, members, skills, and projects.',
    newChat: 'New Chat',
    newChatAria: 'Start a new conversation',
    history: 'History',
    emptyHistory: 'No saved conversations in this browser.',
    moreActions: 'More actions',
    deleteChat: 'Delete conversation',
    aiProvider: 'GOOGLE GEMINI',
    conversationLabel: 'Chat conversation',
    messagesLabel: 'Chat conversation messages',
    emptyTitle: 'How can we help you?',
    emptyDescription:
      'Ask questions about our team members, technical skills, previous projects, or collaborative work.',
    tryAsking: 'TRY ASKING',
    suggestedPrompts: [
      'Who are the members of this team?',
      'What are your team skills?',
      'Tell me about your collaborative project.',
    ],
    errorTitle: 'Unable to get AI response',
    genericError: 'Something went wrong. Please try again.',
    retry: 'Retry',
    disclaimer: 'Responses are generated with Google Gemini.',
  },

  th: {
    title: 'ผู้ช่วย AI ประจำทีม',
    description:
      'ค้นพบข้อมูลเกี่ยวกับทีม สมาชิก ทักษะ และผลงานของเรา',
    newChat: 'แชตใหม่',
    newChatAria: 'เริ่มบทสนทนาใหม่',
    history: 'ประวัติแชต',
    emptyHistory: 'ยังไม่มีประวัติแชตในเบราว์เซอร์นี้',
    moreActions: 'ตัวเลือกเพิ่มเติม',
    deleteChat: 'ลบแชตนี้',
    aiProvider: 'GOOGLE GEMINI',
    conversationLabel: 'บทสนทนา',
    messagesLabel: 'ข้อความในการสนทนา',
    emptyTitle: 'วันนี้ให้เราช่วยอะไรได้บ้าง?',
    emptyDescription:
      'สอบถามเกี่ยวกับสมาชิกในทีม ทักษะทางเทคนิค ผลงานที่ผ่านมา หรือโปรเจกต์ที่เราทำร่วมกัน',
    tryAsking: 'ลองถามเราได้เลย',
    suggestedPrompts: [
      'ใครเป็นสมาชิกในทีมนี้บ้าง?',
      'ทีมของเรามีทักษะอะไรบ้าง?',
      'เล่าเกี่ยวกับโปรเจกต์ที่ทีมทำร่วมกันให้ฟังหน่อย',
    ],
    errorTitle: 'ไม่สามารถรับคำตอบจาก AI ได้',
    genericError: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง',
    retry: 'ลองอีกครั้ง',
    disclaimer: 'คำตอบสร้างด้วย Google Gemini',
  },
}

interface SavedConversation {
  readonly conversationId: string
  readonly title: string
  readonly updatedAt: string
}

const CHAT_HISTORY_STORAGE_KEY = 'team-portfolio-ai-chat-history-v1'
const MAX_SAVED_CONVERSATIONS = 30

function isSavedConversation(value: unknown): value is SavedConversation {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SavedConversation).conversationId === 'string' &&
    typeof (value as SavedConversation).title === 'string' &&
    typeof (value as SavedConversation).updatedAt === 'string'
  )
}

// Read the conversation list this browser saved earlier (the messages themselves live in the backend database).
function loadSavedConversations(): SavedConversation[] {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY) ?? '[]',
    )

    return Array.isArray(parsed)
      ? parsed.filter(isSavedConversation).slice(0, MAX_SAVED_CONVERSATIONS)
      : []
  } catch {
    return []
  }
}

function ChatPage() {
  const { language } = useLanguage()
  const copy = chatPageCopy[language]

  // Message State
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Input State
  const [input, setInput] = useState('')

  // Loading State
  const [isLoading, setIsLoading] = useState(false)

  // Conversation State
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [savedConversations, setSavedConversations] =
    useState<SavedConversation[]>(loadSavedConversations)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Error State
  const [error, setError] = useState<string | null>(null)

  // Failed Message for Retry
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)

  // Scroll Reference
  const bottomRef = useRef<HTMLDivElement>(null)

  // A question asked from the portfolio hero arrives as /chat?q=...
  const [searchParams] = useSearchParams()
  const questionFromUrl = searchParams.get('q')
  const [appliedQuestion, setAppliedQuestion] = useState<string | null>(null)

  // Prefill the composer once per new question (derived state, updated during render).
  if (questionFromUrl && questionFromUrl !== appliedQuestion) {
    setAppliedQuestion(questionFromUrl)
    setInput(questionFromUrl.slice(0, 2000))
  }

  // Keep the conversation list after a page refresh.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHAT_HISTORY_STORAGE_KEY,
        JSON.stringify(savedConversations.slice(0, MAX_SAVED_CONVERSATIONS)),
      )
    } catch {
      // Storage can be full or blocked (private mode); history then lasts for this visit only.
    }
  }, [savedConversations])

  // Automatically scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, isLoading, error])

  // Send message to Express Backend
  const sendToBackend = async (content: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendChatMessage({
        message: content,

        ...(conversationId
          ? { conversationId }
          : {}),
      })

      // Save conversation ID for follow-up messages
      setConversationId(response.conversationId)

      const previousConversation = savedConversations.find(
        (conversation) => conversation.conversationId === response.conversationId,
      )
      const title = previousConversation?.title ?? content.slice(0, 80)
      const updatedConversations: SavedConversation[] = [
        {
          conversationId: response.conversationId,
          title: title || content.slice(0, 80),
          updatedAt: new Date().toISOString(),
        },
        ...savedConversations.filter(
          (conversation) => conversation.conversationId !== response.conversationId,
        ),
      ]
      setSavedConversations(updatedConversations)

      // Add Assistant Response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toISOString(),
      }

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ])

      // Clear failed message after success
      setLastFailedMessage(null)

    } catch (err: unknown) {

      let errorMessage = copy.genericError

      if (err instanceof ChatApiException) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)

      // Keep message for retry
      setLastFailedMessage(content)

    } finally {
      setIsLoading(false)
    }
  }

  // Handle Message Submission
  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const content = input.trim()

    if (!content || isLoading) {
      return
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }

    // Add User Message
    setMessages((previous) => [
      ...previous,
      userMessage,
    ])

    // Clear Input
    setInput('')

    // Send to Backend
    await sendToBackend(content)
  }

  // Retry Failed Request
  const handleRetry = async () => {
    if (!lastFailedMessage || isLoading) {
      return
    }

    await sendToBackend(lastFailedMessage)
  }


// Start a completely new conversation
const handleNewConversation = () => {
  if (isLoading) {
    return
  }

  // Clear existing messages
  setMessages([])

  // Clear input
  setInput('')

  // Reset Backend Conversation ID
  setConversationId(null)

  // Clear previous errors
  setError(null)

  // Clear failed message
  setLastFailedMessage(null)
  setIsHistoryOpen(false)
  setOpenMenuId(null)
}

  const handleOpenConversation = async (savedConversation: SavedConversation) => {
    setIsLoading(true)
    setError(null)

    try {
      const history = await getChatHistory(savedConversation.conversationId)
      setConversationId(history.conversationId)
      setMessages(history.messages.map((message) => ({ ...message })))
      setInput('')
      setLastFailedMessage(null)
      setIsHistoryOpen(false)
      setOpenMenuId(null)
    } catch (err: unknown) {
      // The server no longer has this conversation: drop it from the saved list.
      if (err instanceof ChatApiException && err.status === 404) {
        setSavedConversations((current) => current.filter(
          (conversation) => conversation.conversationId !== savedConversation.conversationId,
        ))
      }
      setError(err instanceof Error ? err.message : copy.genericError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = async (savedConversation: SavedConversation) => {
    setOpenMenuId(null)
    setError(null)

    try {
      try {
        await deleteChatConversation(savedConversation.conversationId)
      } catch (err: unknown) {
        // Already gone on the server (e.g. expired): still remove it here.
        if (!(err instanceof ChatApiException && err.status === 404)) throw err
      }
      const updatedConversations = savedConversations.filter(
        (conversation) => conversation.conversationId !== savedConversation.conversationId,
      )
      setSavedConversations(updatedConversations)

      if (conversationId === savedConversation.conversationId) {
        setMessages([])
        setConversationId(null)
        setInput('')
        setLastFailedMessage(null)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : copy.genericError)
    }
  }

  // Handle Suggested Prompts
  const handleSuggestionClick = (prompt: string) => {
    if (!isLoading) {
      setInput(prompt)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white">

      <Navbar />

      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">

        {/* Chat Header */}

        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">

              <span className="kuai-orb size-11 rounded-full" aria-hidden="true" />

              <h1 className="font-display text-2xl font-semibold text-white">
                {copy.title}
              </h1>

            </div>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              {copy.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsHistoryOpen((isOpen) => !isOpen)
                  setOpenMenuId(null)
                }}
                aria-label={copy.history}
                aria-expanded={isHistoryOpen}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-300"
              >
                <History size={15} />
                {copy.history}
              </button>

              {isHistoryOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border-subtle bg-surface-900 shadow-glow">
                  <p className="border-b border-white/10 px-4 py-3 text-xs font-semibold text-white">
                    {copy.history}
                  </p>

                  {savedConversations.length === 0 ? (
                    <p className="px-4 py-5 text-xs text-slate-400">
                      {copy.emptyHistory}
                    </p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto p-2">
                      {savedConversations.map((savedConversation) => (
                        <li
                          key={savedConversation.conversationId}
                          className="flex items-center gap-1 rounded-lg hover:bg-white/5"
                        >
                          <button
                            type="button"
                            onClick={() => void handleOpenConversation(savedConversation)}
                            disabled={isLoading}
                            className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-xs text-slate-200 disabled:opacity-50"
                          >
                            {savedConversation.title}
                          </button>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId(
                                (currentId) => currentId === savedConversation.conversationId
                                  ? null
                                  : savedConversation.conversationId,
                              )}
                              aria-label={`${copy.moreActions}: ${savedConversation.title}`}
                              aria-expanded={openMenuId === savedConversation.conversationId}
                              className="grid size-9 place-items-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                              <MoreHorizontal size={17} />
                            </button>

                            {openMenuId === savedConversation.conversationId && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteConversation(savedConversation)}
                                aria-label={`${copy.deleteChat}: ${savedConversation.title}`}
                                className="absolute right-0 top-full z-40 inline-flex w-44 items-center gap-2 rounded-lg border border-border-subtle bg-surface-900 px-3 py-2.5 text-left text-xs text-red-300 shadow-glow hover:bg-red-400/10"
                              >
                                <Trash2 size={14} />
                                {copy.deleteChat}
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* New Conversation Button */}

            <button
              type="button"
              onClick={handleNewConversation}
              disabled={
                isLoading ||
                (messages.length === 0 && conversationId === null)
              }
              aria-label={copy.newChatAria}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={15} />
              {copy.newChat}
            </button>

            {/* API Integration Status Label */}

            <div className="flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-400/5 px-3 py-2">

              <span className="size-2 rounded-full bg-brand-400" />

              <span className="text-[10px] font-semibold tracking-wide text-amber-300">
                {copy.aiProvider}
              </span>

            </div>

          </div>

        </header>

        {error && messages.length === 0 && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-xs leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        {/* Chat Container */}

        <section
          aria-label={copy.conversationLabel}
          className="flex min-h-140 flex-1 flex-col overflow-hidden rounded-panel border border-border-subtle bg-surface-900 shadow-glow"
        >

          {/* Message Area */}

          <div
            role="log"
            aria-label={copy.messagesLabel}
            aria-live="polite"
            aria-relevant="additions"
            aria-atomic="false"
            aria-busy={isLoading}
            className="min-h-105 flex-1 overflow-y-auto p-4 sm:p-6"
          >

            {messages.length === 0 ? (

              /* Empty State */

              <div className="flex min-h-97.5 flex-col items-center justify-center py-10 text-center">

                <div className="grid size-16 place-items-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-300 shadow-glow">

                  <MessageCircle size={28} />

                </div>

                <h2 className="mt-6 font-display text-2xl font-semibold text-white">
                  {copy.emptyTitle}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  {copy.emptyDescription}
                </p>

                {/* Suggested Questions */}

                <div className="mt-8 w-full max-w-lg">

                  <div className="mb-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Users size={14} />
                    {copy.tryAsking}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">

                    {copy.suggestedPrompts.map((prompt) => (

                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handleSuggestionClick(prompt)}
                        className="rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-xs text-slate-300 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-300"
                      >
                        {prompt}
                      </button>

                    ))}

                  </div>

                </div>

              </div>

            ) : (

              /* Conversation Messages */

              <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

                {messages.map((message) => (

                  <MessageBubble
                    key={message.id}
                    message={message}
                  />

                ))}

                {/* Error Message */}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/20 bg-red-400/5 p-4"
                  >
                    <div className="flex items-start gap-3">

                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-400"
                      />

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-semibold text-red-300">
                          {copy.errorTitle}
                        </p>

                        <p className="mt-1 wrap-break-word text-xs leading-6 text-slate-400">
                          {error}
                        </p>

                        {lastFailedMessage && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            disabled={isLoading}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
                          >
                            <RefreshCw size={13} />
                            {copy.retry}
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                )}

                {/* Loading Indicator */}

                {isLoading && <TypingIndicator />}

              </div>

            )}

            <div ref={bottomRef} />

          </div>

          {/* Chat Input */}

          <ChatComposer
            value={input}
            isLoading={isLoading}
            onChange={setInput}
            onSubmit={handleSendMessage}
          />

        </section>

        {/* Footer Disclaimer */}

        <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
          {copy.disclaimer}
        </p>

      </main>

    </div>
  )
}

export default ChatPage
