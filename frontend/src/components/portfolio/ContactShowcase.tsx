import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'

import { useLanguage } from '../../contexts/language-context'
import { usePortfolioData } from '../../data/portfolioData'
import type { Member } from '../../data/portfolioData'

import SectionTitle from './SectionTitle'

function isWebUrl(value?: string): value is string {
  if (!value?.trim()) return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** One link per member: LinkedIn if they have it, otherwise GitHub. */
function memberLink(member: Member) {
  const { linkedin, github } = member.socialLinks
  if (isWebUrl(linkedin)) return { href: linkedin.trim(), kind: 'LinkedIn' as const }
  if (isWebUrl(github)) return { href: github.trim(), kind: 'GitHub' as const }
  return null
}

function ContactShowcase() {
  const { language } = useLanguage()
  const { group, members } = usePortfolioData()
  const isThai = language === 'th'

  const teamEmail = !group.contact.isPlaceholder && group.contact.teamEmail.trim()
    ? group.contact.teamEmail.trim()
    : ''

  const links = members
    .map((member) => ({ member, link: memberLink(member) }))
    .filter((item): item is { member: Member; link: NonNullable<ReturnType<typeof memberLink>> } => item.link !== null)

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:py-36 lg:px-8"
    >
      <div
        className="kuai-ring kuai-glass relative overflow-hidden rounded-[40px] border border-white/10 bg-surface-900 px-7 py-14 sm:px-14 sm:py-20"
        style={{ '--kuai-ring-color': '#38bdf8' } as CSSProperties}
      >
        <div
          aria-hidden="true"
          className="galaxy-nebula pointer-events-none absolute -right-40 -top-40 size-[560px] bg-[radial-gradient(circle,rgb(217_70_239/0.45),rgb(34_211_238/0.22)_45%,transparent_70%)] opacity-90"
          style={{ animation: 'galaxy-nebula 18s ease-in-out infinite reverse' }}
        />

        <div className="relative flex flex-wrap items-end justify-between gap-12">
          <div className="flex-[1_1_520px]">
            <SectionTitle
              id="contact-heading"
              label="03 / GET IN TOUCH"
              firstLine="LET’S BUILD"
              secondLine="SOMETHING."
              secondLineStyle="shine"
            />

            <p className="mt-6 max-w-[480px] text-[17px] leading-7 text-slate-300">
              {isThai
                ? 'อยากรู้จักพวกเรามากขึ้น ถาม AI ได้ทันที หรือทักหาสมาชิกแต่ละคนได้โดยตรง'
                : 'Want to know us better? Ask our AI right away, or reach out to each member directly.'}
            </p>
          </div>

          <div className="flex flex-[1_1_360px] flex-col gap-3">
            <Link
              to="/chat"
              className="kuai-gradient-button flex min-h-16 items-center justify-between rounded-[20px] px-6 text-[17px] font-semibold text-white"
            >
              {isThai ? 'คุยกับ KUAi Assistant' : 'Talk to KUAi Assistant'}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>

            {teamEmail && (
              <a
                href={`mailto:${teamEmail}`}
                className="flex min-h-14 items-center justify-between rounded-[18px] border border-white/10 bg-white/4 px-5 text-slate-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/12"
              >
                {teamEmail}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            )}

            {links.length > 0 && (
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
                {links.map(({ member, link }) => (
                  <li key={member.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${link.kind}: ${member.fullName}`}
                      className="flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/4 text-sm text-slate-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/12"
                    >
                      {link.kind === 'LinkedIn' ? (
                        <FaLinkedin size={15} aria-hidden="true" />
                      ) : (
                        <FaGithub size={15} aria-hidden="true" />
                      )}
                      {member.nickname}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactShowcase
