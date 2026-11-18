import { useLanguage } from '../../contexts/language-context'
import { usePortfolioData } from '../../data/portfolioData'

/** Endless scrolling strip of the team's technologies, taken from portfolio data. */
function TechMarquee() {
  const { language } = useLanguage()
  const { members, teamProjects } = usePortfolioData()

  const technologies = Array.from(
    new Set([
      ...teamProjects.flatMap((project) => project.technologies),
      ...members.flatMap((member) => member.skills.core),
    ]),
  ).slice(0, 16)

  if (technologies.length === 0) {
    return null
  }

  return (
    <div
      role="region"
      aria-label={language === 'th' ? 'เทคโนโลยีที่ทีมใช้' : 'Technologies our team uses'}
      className="kuai-glass overflow-hidden border-y border-white/10 bg-ink-950/40 py-6"
    >
      {/* The list is rendered twice so the loop is seamless; the copy is hidden from screen readers. */}
      <div className="kuai-marquee font-display text-2xl font-semibold tracking-tight text-slate-400 sm:text-3xl">
        {[0, 1].map((copyIndex) => (
          <ul
            key={copyIndex}
            aria-hidden={copyIndex === 1 ? true : undefined}
            className="flex shrink-0 items-center"
          >
            {technologies.map((technology) => (
              <li key={technology} className="flex items-center gap-7 pr-7">
                {technology}
                <span aria-hidden="true" className="text-lg text-accent-magenta">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default TechMarquee
