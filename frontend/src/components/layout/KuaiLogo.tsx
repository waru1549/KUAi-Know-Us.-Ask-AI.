import { useId } from 'react'

interface KuaiLogoProps {
  /** "full" = mark + KUAi wordmark + tagline, "mark" = the K symbol only */
  variant?: 'full' | 'mark'
  /** Hide the "KNOW US. ASK AI." line (useful at small sizes) */
  showTagline?: boolean
  className?: string
}

/**
 * KUAi brand logo: a galaxy-gradient K wrapped by a tilted orbit
 * (the back half passes behind the letter, the front half in front of it),
 * a small glowing planet and a twinkling sparkle.
 * Decorative by default: give the surrounding link or button the accessible name.
 */
function KuaiLogo({ variant = 'full', showTagline = true, className }: KuaiLogoProps) {
  // Unique, URL-safe ids so several logos on one page never share gradients.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `kuai-${uid}-${name}`

  const isFull = variant === 'full'

  return (
    <svg
      viewBox={isFull ? '0 0 520 150' : '0 0 150 150'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        {/* Letter: violet → indigo → sky, like the galaxy background */}
        <linearGradient id={id('k')} x1="30" y1="26" x2="118" y2="124" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D5FF" />
          <stop offset="0.28" stopColor="#C084FC" />
          <stop offset="0.62" stopColor="#6366F1" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>

        {/* Glossy highlight across the top-left of the letter */}
        <linearGradient id={id('gloss')} x1="35" y1="30" x2="80" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={id('orbit')} x1="8" y1="75" x2="142" y2="75" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0ABFC" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#A78BFA" />
          <stop offset="0.75" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#67E8F9" stopOpacity="0.7" />
        </linearGradient>

        <radialGradient id={id('planet')} cx="0.35" cy="0.35" r="0.75">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.45" stopColor="#A5F3FC" />
          <stop offset="1" stopColor="#0EA5E9" />
        </radialGradient>

        <linearGradient id={id('word')} x1="0" y1="40" x2="0" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DDD6FE" />
        </linearGradient>

        <linearGradient id={id('ai')} x1="395" y1="30" x2="485" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0ABFC" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#38BDF8" />
        </linearGradient>

        {/* Soft coloured glow behind the letter */}
        <filter id={id('glow')} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            values="0 0 0 0 0.66  0 0 0 0 0.45  0 0 0 0 1  0 0 0 0.55 0"
          />
        </filter>

        <filter id={id('spark')} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Front half of the orbit (in the orbit's own rotated frame) */}
        <clipPath id={id('front')}>
          <rect x="0" y="75" width="150" height="40" />
        </clipPath>

        <path
          id={id('kShape')}
          d="M36 30 H55 V65.5 L87.5 30 H112 L68.5 74 L116 120 H90.5 L55 84.5 V120 H36 Z"
        />
      </defs>

      {/* ---------- Mark ---------- */}
      <g>
        {/* Orbit, back half (behind the letter) */}
        <g transform="rotate(-28 75 75)">
          <ellipse cx="75" cy="75" rx="68" ry="25" stroke={`url(#${id('orbit')})`} strokeWidth="1.4" opacity="0.35" />
        </g>

        {/* Glow + letter + gloss */}
        <use href={`#${id('kShape')}`} fill="#A855F7" filter={`url(#${id('glow')})`} />
        <use href={`#${id('kShape')}`} fill={`url(#${id('k')})`} />
        <use href={`#${id('kShape')}`} fill={`url(#${id('gloss')})`} />
        <use href={`#${id('kShape')}`} stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1" />

        {/* Orbit, front half (crosses over the letter) */}
        <g transform="rotate(-28 75 75)">
          <ellipse
            cx="75"
            cy="75"
            rx="68"
            ry="25"
            stroke={`url(#${id('orbit')})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            clipPath={`url(#${id('front')})`}
          />
          {/* Planet riding the front of the orbit */}
          <circle cx="127" cy="91" r="4.6" fill={`url(#${id('planet')})`} filter={`url(#${id('spark')})`} />
        </g>

        {/* Sparkles */}
        <g className="kuai-logo-sparkle" filter={`url(#${id('spark')})`}>
          <path
            d="M118 15 Q119.6 28.4 133 30 Q119.6 31.6 118 45 Q116.4 31.6 103 30 Q116.4 28.4 118 15 Z"
            fill="#F5D0FE"
          />
        </g>
        <path
          d="M138 46 Q138.6 50.4 143 51 Q138.6 51.6 138 56 Q137.4 51.6 133 51 Q137.4 50.4 138 46 Z"
          fill="#A5F3FC"
          opacity="0.85"
        />
      </g>

      {/* ---------- Wordmark ---------- */}
      {isFull && (
        <g>
          <text
            x="160"
            y={showTagline ? 86 : 96}
            fontFamily="'Bricolage Grotesque', 'Inter', Arial, sans-serif"
            fontSize="66"
            fontWeight="800"
            letterSpacing="-1"
          >
            <tspan fill={`url(#${id('word')})`}>KU</tspan>
            <tspan fill={`url(#${id('ai')})`}>Ai</tspan>
          </text>

          {showTagline && (
            <>
              <line x1="163" y1="101" x2="183" y2="101" stroke="#A78BFA" strokeOpacity="0.7" strokeWidth="1.2" />
              <text
                x="191"
                y="105"
                fill="#C7D2FE"
                fillOpacity="0.85"
                fontFamily="'JetBrains Mono', 'Inter', Arial, monospace"
                fontSize="12.5"
                fontWeight="500"
                letterSpacing="4.6"
              >
                KNOW US. ASK AI.
              </text>
            </>
          )}
        </g>
      )}
    </svg>
  )
}

export default KuaiLogo
