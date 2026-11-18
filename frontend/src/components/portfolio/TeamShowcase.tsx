import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'

import { useLanguage } from '../../contexts/language-context'
import {
  getLocalizedText,
  usePortfolioData,
} from '../../data/portfolioData'
import type { Language, Member } from '../../data/portfolioData'

import SectionTitle from './SectionTitle'

const ROLE_BADGE: Record<Member['roleKey'], string> = {
  frontend: 'FRONTEND',
  backend: 'BACKEND',
  devops: 'DEVOPS & QA',
}

function firstWord(value?: string): string {
  return value?.trim().split(/\s+/)[0] ?? ''
}

function getHighlightSkills(member: Member): readonly string[] {
  if (member.highlightSkills?.length) return member.highlightSkills.slice(0, 5)
  return member.skills.core.slice(0, 5)
}

interface MemberShowcaseCardProps {
  member: Member
  index: number
  language: Language
}

function MemberShowcaseCard({ member, index, language }: MemberShowcaseCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const isThai = language === 'th'

  const color = member.themeColor.primary
  const nickname = member.nicknameI18n
    ? getLocalizedText(member.nicknameI18n, language)
    : member.nickname
  const thaiName = member.fullNameI18n?.th.trim() || member.fullName
  const role = getLocalizedText(member.roleNameI18n, 'en') || member.roleName
  const contribution = member.mainContribution
    ? getLocalizedText(member.mainContribution, language)
    : ''
  const showImage = Boolean(member.avatar) && !imageFailed

  const question = isThai
    ? `${nickname}ทำอะไรในทีม และมีทักษะอะไรบ้าง?`
    : `What does ${member.nickname} do in the team, and what are their skills?`

  return (
    <article
      aria-labelledby={`showcase-${member.id}-name`}
      className="kuai-ring kuai-lift kuai-glass group flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-surface-900"
      style={{ '--kuai-ring-color': color } as CSSProperties}
    >
      {/* Photo */}
      <div
        className="kuai-photo relative h-[340px] overflow-hidden"
        style={
          showImage
            ? undefined
            : { background: `radial-gradient(circle at 30% 30%, ${color}55, transparent 60%), linear-gradient(160deg, #160b33, #070514)` }
        }
      >
        {showImage ? (
          <>
            <img
              src={member.avatar}
              alt={`${member.fullName} (${member.nickname})`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="size-full object-cover object-[center_22%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-[#0c0820] via-transparent to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="grid size-full place-items-center font-display text-[140px] font-extrabold tracking-[-0.06em] text-white/90"
          >
            {member.nickname}
          </div>
        )}

        <span
          className="absolute left-4 top-4 rounded-full bg-ink-950/75 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.16em]"
          style={{ color }}
        >
          {String(index + 1).padStart(2, '0')} · {ROLE_BADGE[member.roleKey]}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-[26px] pb-[30px]">
        <h3
          id={`showcase-${member.id}-name`}
          className="font-display text-[28px] font-bold tracking-[-0.02em] text-white"
        >
          <Link
            to={`/members/${member.id}`}
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-magenta"
          >
            {firstWord(member.fullNameI18n?.en || member.fullName)}{' '}
            <span style={{ color }}>“{member.nickname}”</span>
          </Link>
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-slate-300">
          {isThai ? thaiName : member.fullName} · {role}
        </p>

        {contribution && (
          <div
            className="mt-5 rounded-2xl border px-4 py-3.5"
            style={{ background: `${color}14`, borderColor: `${color}33` }}
          >
            <p className="font-mono text-[11px] tracking-[0.16em]" style={{ color }}>
              MAIN CONTRIBUTION
            </p>
            <p className="mt-1.5 text-[15px] text-white">{contribution}</p>
          </div>
        )}

        <ul className="mt-[18px] flex flex-wrap gap-2 text-[13px]">
          {getHighlightSkills(member).map((skill) => (
            <li
              key={skill}
              className="rounded-full border border-white/10 px-3 py-1.5 text-slate-200 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/12 hover:text-white"
            >
              {skill}
            </li>
          ))}
        </ul>

        <Link
          to={`/chat?q=${encodeURIComponent(question)}`}
          className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold"
          style={{ color }}
        >
          {isThai ? `ถาม AI เกี่ยวกับ${nickname} →` : `Ask AI about ${member.nickname} →`}
        </Link>
      </div>
    </article>
  )
}

function TeamShowcase() {
  const { language } = useLanguage()
  const { members, teamProjects } = usePortfolioData()
  const isThai = language === 'th'

  const stats = [
    { value: String(members.length).padStart(2, '0'), label: isThai ? 'สมาชิก' : 'Members' },
    { value: String(teamProjects.length).padStart(2, '0'), label: isThai ? 'โปรเจกต์ทีม' : 'Team project' },
    { value: 'TH/EN', label: isThai ? 'สองภาษา' : 'Two languages' },
  ]

  return (
    <section
      id="members"
      aria-labelledby="members-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:py-36 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionTitle
          id="members-heading"
          label="01 / THE TEAM"
          firstLine="THREE MINDS."
          secondLine="ONE CONVERSATION."
        />

        <ul className="flex flex-wrap gap-3">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="kuai-glass rounded-[20px] border border-white/10 bg-white/4 px-6 py-[18px]"
            >
              <p className="font-display text-[44px] font-extrabold leading-none text-white">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[13px] text-slate-300">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[72px] grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-6">
        {members.map((member, index) => (
          <MemberShowcaseCard
            key={member.id}
            member={member}
            index={index}
            language={language}
          />
        ))}
      </div>
    </section>
  )
}

export default TeamShowcase
