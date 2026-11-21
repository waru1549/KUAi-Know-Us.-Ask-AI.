
import { ArrowLeft } from 'lucide-react'
import {
  Link,
  Navigate,
  useParams,
} from 'react-router'

import Navbar from '../components/layout/Navbar'

import MemberCard from '../components/portfolio/MemberCard'
import TeamHero from '../components/portfolio/TeamHero'
import TechMarquee from '../components/portfolio/TechMarquee'
import TeamShowcase from '../components/portfolio/TeamShowcase'
import WorkShowcase from '../components/portfolio/WorkShowcase'
import ContactShowcase from '../components/portfolio/ContactShowcase'
import ScrollShip from '../components/space/ScrollShip'
import ShipFlyby from '../components/space/ShipFlyby'
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

      {/* Space touches: a ship drifting past and a ship that marks scroll position */}
      <ShipFlyby />
      <ScrollShip />

      <main>
        {/* Group Hero */}
        <TeamHero />

        {/* Endless technology strip */}
        <TechMarquee />

        {/* 01 / The team */}
        <div className="kuai-reveal">
          <TeamShowcase />
        </div>

        {/* 02 / Selected work */}
        <div className="kuai-reveal">
          <WorkShowcase />
        </div>

        {/* 03 / Get in touch */}
        <div className="kuai-reveal">
          <ContactShowcase />
        </div>
      </main>

      <footer className="overflow-hidden border-t border-white/5 px-5 pb-10 pt-16">
        {/* Giant outlined wordmark drifting across the footer */}
        <div aria-hidden="true" className="-mx-5 overflow-hidden">
          <div className="kuai-marquee kuai-marquee--slow whitespace-nowrap font-display text-7xl font-extrabold leading-none tracking-tighter sm:text-9xl">
            <span className="kuai-outline-text pr-16">KNOW US. ASK AI. ✦ KNOW US. ASK AI. ✦</span>
            <span className="kuai-outline-text pr-16">KNOW US. ASK AI. ✦ KNOW US. ASK AI. ✦</span>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-[13px] text-slate-400 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} KUAi — Know Us. Ask AI.</p>

          <p>
            {isThai
              ? 'พัฒนาด้วย React · Express · PostgreSQL · Gemini'
              : 'Built with React · Express · PostgreSQL · Gemini'}
          </p>
        </div>
      </footer>

    </div>
  )
}

export default PortfolioPage
