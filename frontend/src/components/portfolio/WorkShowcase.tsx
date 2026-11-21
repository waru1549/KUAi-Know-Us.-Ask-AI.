import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { MonitorPlay } from 'lucide-react'

import { useLanguage } from '../../contexts/language-context'
import {
  getLocalizedText,
  usePortfolioData,
} from '../../data/portfolioData'
import type {
  IndividualProject,
  Language,
  Member,
  ProjectStatus,
} from '../../data/portfolioData'

import SectionTitle from './SectionTitle'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planned: 'PLANNED',
  'in-progress': 'IN PROGRESS',
  completed: 'LIVE',
}

/** Image with a graceful fallback when the file is missing. */
function CoverImage({ src, alt, position = 'center' }: { src?: string; alt: string; position?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className="grid size-full place-items-center bg-[radial-gradient(circle_at_70%_30%,rgb(34_211_238/0.3),transparent_55%)]"
      >
        <MonitorPlay size={96} strokeWidth={1} className="text-accent-cyan transition duration-1000 group-hover:scale-105" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
      style={{ objectPosition: position }}
    />
  )
}

interface HighlightedProject {
  project: IndividualProject
  member: Member
}

/**
 * Pick up to two individual projects for the home page:
 * projects marked isHighlighted first, then ones with a cover image, at most one per member.
 */
function pickHighlightedProjects(members: readonly Member[]): HighlightedProject[] {
  const candidates = members.flatMap((member) =>
    member.projects
      .filter((project) => !project.isPlaceholder && (project.title.en.trim() || project.title.th.trim()))
      .map((project) => ({ project, member })),
  )

  const score = ({ project }: HighlightedProject) =>
    (project.isHighlighted ? 2 : 0) + (project.coverImage ? 1 : 0)

  const picked: HighlightedProject[] = []
  for (const candidate of [...candidates].sort((a, b) => score(b) - score(a))) {
    if (picked.some((item) => item.member.id === candidate.member.id)) continue
    picked.push(candidate)
    if (picked.length === 2) break
  }

  return picked
}

function projectTag(project: IndividualProject, language: Language): string {
  const type = project.projectType ? getLocalizedText(project.projectType, language) : ''
  return (type || project.technologies.slice(0, 2).join(' + ')).toUpperCase()
}

function WorkShowcase() {
  const { language } = useLanguage()
  const { members, teamProjects } = usePortfolioData()
  const isThai = language === 'th'

  const featured = teamProjects.find((project) => project.isFeatured) ?? teamProjects[0]
  const highlighted = pickHighlightedProjects(members)

  if (!featured && highlighted.length === 0) {
    return null
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="scroll-mt-24 border-t border-white/5 bg-ink-950/30"
    >
      <div className="mx-auto max-w-7xl px-5 py-28 sm:py-36 lg:px-8">
        <SectionTitle
          id="projects-heading"
          label="02 / MISSIONS"
          firstLine="IDEAS THAT"
          secondLine="SHIPPED."
        />

        {/* Featured team project */}
        {featured && (
          <Link
            to="/chat"
            aria-labelledby={`work-${featured.id}`}
            className="kuai-ring kuai-glass group mt-[72px] flex flex-wrap overflow-hidden rounded-[32px] border border-white/10 bg-surface-900 text-left"
            style={{ '--kuai-ring-color': '#8b5cf6' } as CSSProperties}
          >
            <div className="h-72 min-w-0 flex-[999_1_560px] overflow-hidden bg-ink-950/50 sm:h-[460px]">
              <CoverImage
                src={featured.coverImage}
                alt={`${getLocalizedText(featured.title, language)} screenshot`}
              />
            </div>

            <div className="flex flex-[1_1_380px] flex-col gap-[18px] p-8 sm:p-11">
              <div className="flex flex-wrap gap-2 font-mono text-[11px] tracking-[0.14em]">
                <span className="rounded-full bg-violet-500/15 px-2.5 py-1.5 text-violet-200">
                  TEAM PROJECT
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400/12 px-2.5 py-1.5 text-sky-300">
                  <span className="kuai-pulse-dot size-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />
                  {STATUS_LABEL[featured.status]}
                </span>
              </div>

              <h3
                id={`work-${featured.id}`}
                className="font-display text-4xl font-extrabold leading-none tracking-[-0.03em] text-white sm:text-[40px]"
              >
                KUAi — {getLocalizedText(featured.title, language)}
              </h3>

              <p className="text-base leading-7 text-slate-300">
                {getLocalizedText(featured.description, language)}
              </p>

              <ul className="flex flex-wrap gap-2 text-[13px] text-slate-200">
                {featured.technologies.slice(0, 6).map((technology) => (
                  <li key={technology} className="rounded-full border border-white/10 px-3 py-1.5">
                    {technology}
                  </li>
                ))}
              </ul>

              <span className="mt-auto pt-2 font-semibold text-[#f4f2ff]">
                {isThai ? 'ลองคุยกับ AI ของเรา →' : 'Try talking to our AI →'}
              </span>
            </div>
          </Link>
        )}

        {/* Individual highlights */}
        {highlighted.length > 0 && (
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-6">
            {highlighted.map(({ project, member }) => (
              <article
                key={project.id}
                aria-labelledby={`work-${project.id}`}
                className="kuai-ring kuai-lift kuai-glass group overflow-hidden rounded-[28px] border border-white/10 bg-surface-900"
                style={{ '--kuai-ring-color': member.themeColor.primary } as CSSProperties}
              >
                <div className="h-[280px] overflow-hidden bg-ink-950/40">
                  <CoverImage
                    src={project.coverImage}
                    alt={`${getLocalizedText(project.title, language)} screenshot`}
                    position="top"
                  />
                </div>

                <div className="p-7">
                  <p
                    className="font-mono text-[11px] tracking-[0.14em]"
                    style={{ color: member.themeColor.primary }}
                  >
                    BY {member.nickname.toUpperCase()} · {projectTag(project, language)}
                  </p>

                  <h3
                    id={`work-${project.id}`}
                    className="mt-2.5 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-white"
                  >
                    {getLocalizedText(project.title, language)}
                  </h3>

                  <p className="mt-2.5 line-clamp-3 text-[15px] leading-7 text-slate-300">
                    {getLocalizedText(project.description, language)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default WorkShowcase
