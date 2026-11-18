
import { ArrowLeft } from 'lucide-react'
import {
  Link,
  Navigate,
  useParams,
} from 'react-router'

import Navbar from '../components/layout/Navbar'

import MemberCard from '../components/portfolio/MemberCard'
import TeamHero from '../components/portfolio/TeamHero'
import TeamIntroduction from '../components/portfolio/TeamIntroduction'
import MemberSection from '../components/portfolio/MemberSection'
import TeamContact from '../components/portfolio/TeamContact'
import TeamProjectSection from '../components/portfolio/TeamProjectSection'
import TechMarquee from '../components/portfolio/TechMarquee'
import { useLanguage } from '../contexts/language-context'
import { usePortfolioData } from '../data/portfolioData'

export function MemberProfilePage() {
  const { memberId } = useParams()
  const { language } = useLanguage()
  const portfolioData = usePortfolioData()
  const member = portfolioData.members.find(
    (currentMember) => currentMember.id === memberId,
  )

  if (!member) {
    return <Navigate to="/" replace />
  }

  const memberIndex = portfolioData.members.indexOf(member)

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navbar />

      <main className="px-5 py-10 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-300 transition hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {language === 'th' ? 'กลับหน้าหลัก' : 'Back to portfolio'}
          </Link>

          <div className="mx-auto mt-8 max-w-3xl">
            <MemberCard
              member={member}
              index={memberIndex}
              isProfilePage
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function PortfolioPage() {
  const { language } = useLanguage()
  const isThai = language === 'th'
  return (
    <div className="min-h-screen bg-transparent text-white">

      <Navbar />

      <main>
        {/* Group Hero */}
        <TeamHero />

        {/* Endless technology strip */}
        <TechMarquee />

        {/* Team Introduction */}
        <div className="kuai-reveal">
          <TeamIntroduction />
        </div>

        {/* Individual Members */}
        <div className="kuai-reveal">
          <MemberSection />
        </div>

        {/* Team Project Showcase */}
        <div className="kuai-reveal">
          <TeamProjectSection />
        </div>

        {/* Team Contact */}
        <div className="kuai-reveal">
          <TeamContact />
        </div>
      </main>

      <footer className="overflow-hidden border-t border-white/10 px-5 pb-8 pt-12">
        {/* Giant outlined wordmark drifting across the footer */}
        <div aria-hidden="true" className="-mx-5 overflow-hidden">
          <div className="kuai-marquee kuai-marquee--slow whitespace-nowrap font-display text-7xl font-extrabold leading-none tracking-[-0.05em] sm:text-9xl">
            <span className="kuai-outline-text pr-16">KNOW US. ASK AI. ✦ KNOW US. ASK AI. ✦</span>
            <span className="kuai-outline-text pr-16">KNOW US. ASK AI. ✦ KNOW US. ASK AI. ✦</span>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} KUAi — Know Us. Ask AI.
            {' '}
            {isThai ? 'สงวนลิขสิทธิ์' : 'All rights reserved.'}
          </p>

          <p className="text-xs text-slate-400">
            {isThai
                ? 'พัฒนาด้วย React, TypeScript และ Tailwind CSS'
                : 'Built with React, TypeScript & Tailwind CSS.'}
          </p>

        </div>
      </footer>

    </div>
  )
}

export default PortfolioPage
