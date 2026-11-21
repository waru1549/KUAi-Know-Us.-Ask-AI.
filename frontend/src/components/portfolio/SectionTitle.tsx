interface SectionTitleProps {
  id: string
  /** Small mono label, e.g. "01 / CREW" */
  label: string
  firstLine: string
  secondLine: string
  /** "glow" (soft violet) or "shine" (animated galaxy gradient) for the second line */
  secondLineStyle?: 'glow' | 'shine'
}

/** Two-line display heading used by the home page sections. */
function SectionTitle({
  id,
  label,
  firstLine,
  secondLine,
  secondLineStyle = 'glow',
}: SectionTitleProps) {
  return (
    <div>
      <p className="mb-5 font-mono text-xs tracking-[0.22em] text-accent-magenta">
        <span className="kuai-signal-dot" aria-hidden="true" />
        {label}
      </p>

      <h2
        id={id}
        className="font-display text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.04em] text-[#f4f2ff]"
      >
        {firstLine}
        <br />
        <span className={secondLineStyle === 'shine' ? 'kuai-shine' : 'kuai-glow-text'}>
          {secondLine}
        </span>
      </h2>
    </div>
  )
}

export default SectionTitle
