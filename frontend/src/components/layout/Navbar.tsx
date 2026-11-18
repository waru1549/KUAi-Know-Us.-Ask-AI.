import { useEffect, useState } from 'react'
import { Link, useMatch } from 'react-router'

import { ArrowLeft, ArrowUpRight, Menu, X } from 'lucide-react'

import { useLanguage } from '../../contexts/language-context'
import KuaiLogo from './KuaiLogo'
import type { Language } from '../../data/portfolioData'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/+$/, '')

type ApiStatus = 'checking' | 'online' | 'offline'

/** Asks the backend once whether the API and database are reachable. */
function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    // Test environments may not provide fetch.
    if (typeof fetch !== 'function') return

    const controller = new AbortController()

    fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setStatus(response.ok ? 'online' : 'offline')
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('offline')
      })

    return () => controller.abort()
  }, [])

  return status
}

interface LanguageSwitcherProps {
  language: Language
  onChange: (language: Language) => void
}

const languageOptions: readonly {
  value: Language
  label: string
}[] = [
  { value: 'en', label: 'EN' },
  { value: 'th', label: 'TH' },
]

function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label={language === 'th' ? 'เลือกภาษา' : 'Select language'}
      className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-1"
    >
      {languageOptions.map((option) => {
        const isActive = language === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            aria-label={
              option.value === 'en'
                ? 'Switch language to English'
                : 'เปลี่ยนภาษาเป็นภาษาไทย'
            }
            onClick={() => onChange(option.value)}
            className={`min-h-8 min-w-9 rounded-full px-2.5 text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-magenta ${
              isActive
                ? 'bg-linear-to-r from-fuchsia-500 to-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function StatusBadge({ status, label }: { status: ApiStatus; label: string }) {
  const dotClass =
    status === 'online'
      ? 'kuai-pulse-dot bg-accent-cyan'
      : status === 'offline'
        ? 'bg-slate-500'
        : 'bg-slate-500 animate-pulse'

  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] ${
        status === 'online' ? 'text-sky-300' : 'text-slate-400'
      }`}
    >
      <span className={`size-[7px] rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  )
}

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()
  const isChatPage = useMatch('/chat') !== null
  const apiStatus = useApiStatus()

  const isThai = language === 'th'

  const copy = isThai
    ? {
        team: 'ทีมของเรา',
        work: 'ผลงาน',
        contact: 'ติดต่อ',
        chat: 'คุยกับ AI',
        back: 'กลับหน้า Portfolio',
        mainNavigation: 'เมนูหลัก',
        mobileNavigation: 'เมนูสำหรับมือถือ',
        openMenu: 'เปิดเมนูนำทาง',
        closeMenu: 'ปิดเมนูนำทาง',
        language: 'เลือกภาษา',
      }
    : {
        team: 'Team',
        work: 'Work',
        contact: 'Contact',
        chat: 'Talk to AI',
        back: 'Back to portfolio',
        mainNavigation: 'Main navigation',
        mobileNavigation: 'Mobile navigation',
        openMenu: 'Open navigation menu',
        closeMenu: 'Close navigation menu',
        language: 'Language',
      }

  const statusWord =
    apiStatus === 'online' ? 'ONLINE' : apiStatus === 'offline' ? 'OFFLINE' : '…'
  const statusLabel = isChatPage ? `GEMINI · ${statusWord}` : `AI ${statusWord}`

  // Section links point at the home page so they also work from a member profile.
  const sectionLinks = [
    { href: '/#members', label: copy.team },
    { href: '/#projects', label: copy.work },
    { href: '/#contact', label: copy.contact },
  ]

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink-950/20 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          aria-label="KUAi home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta"
        >
          <KuaiLogo className="h-10 w-auto sm:h-11" showTagline={false} />
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label={copy.mainNavigation}
          className="hidden items-center gap-7 text-sm md:flex"
        >
          {isChatPage ? (
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-2 text-slate-300 transition hover:text-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {copy.back}
            </Link>
          ) : (
            sectionLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-300 transition hover:text-white"
              >
                {link.label}
              </a>
            ))
          )}

          <StatusBadge status={apiStatus} label={statusLabel} />

          <LanguageSwitcher language={language} onChange={setLanguage} />

          {!isChatPage && (
            <Link
              to="/chat"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f4f2ff] px-5 font-semibold text-[#0b0620] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-10px_rgb(217_70_239/0.8)]"
            >
              {copy.chat}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-label={isMobileMenuOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
          className="grid size-11 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta md:hidden"
        >
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label={copy.mobileNavigation}
          className="border-t border-white/10 px-5 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {isChatPage ? (
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm text-slate-200 hover:bg-white/5"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                {copy.back}
              </Link>
            ) : (
              <>
                {sectionLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm text-slate-200 hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}

                <Link
                  to="/chat"
                  onClick={closeMobileMenu}
                  className="kuai-gradient-button mt-2 flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-semibold text-white"
                >
                  {copy.chat}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-4">
              <StatusBadge status={apiStatus} label={statusLabel} />

              <LanguageSwitcher
                language={language}
                onChange={(nextLanguage) => {
                  setLanguage(nextLanguage)
                  closeMobileMenu()
                }}
              />
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Navbar
