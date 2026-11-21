import { useId } from 'react'

interface SpaceShipProps {
  className?: string
  /** Accessible name; omit for decorative copies (flyby, scroll marker). */
  title?: string
}

/**
 * The KUAi spaceship: white glossy hull, dark canopy, navy/purple panels with
 * star sparkles, cyan neon strips, twin engines and the KUAi orbit logo.
 * Nose points left. Gradient ids are unique per instance so several ships can
 * be on the page at once.
 */
function SpaceShip({ className, title }: SpaceShipProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const ref = (name: string) => `url(#${id(name)})`

  return (
    <svg
      className={className}
      viewBox="0 0 720 360"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id('body')} x1="0" y1="110" x2="0" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset=".55" stopColor="#eeecff" /><stop offset="1" stopColor="#b9b3ea" />
        </linearGradient>
        <linearGradient id={id('navy')} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3b2a8f" /><stop offset=".55" stopColor="#241a63" /><stop offset="1" stopColor="#120c3a" />
        </linearGradient>
        <linearGradient id={id('purple')} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#8b5cf6" /><stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id={id('glass')} x1="150" y1="120" x2="320" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2e2775" /><stop offset=".5" stopColor="#14104a" /><stop offset="1" stopColor="#07051f" />
        </linearGradient>
        <linearGradient id={id('flame')} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#ffffff" /><stop offset=".2" stopColor="#a5f3fc" />
          <stop offset=".55" stopColor="#38bdf8" stopOpacity=".8" /><stop offset="1" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('engine')} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4c3fa8" /><stop offset=".5" stopColor="#1e1859" /><stop offset="1" stopColor="#0d0a2e" />
        </linearGradient>
        <filter id={id('neon')} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <path id={id('spark')} d="M0 -9 C 1 -2, 2 -1, 9 0 C 2 1, 1 2, 0 9 C -1 2, -2 1, -9 0 C -2 -1, -1 -2, 0 -9 Z" />
      </defs>

      {/* Engine flames */}
      <g className="kuai-ship-flame">
        <ellipse cx="600" cy="150" rx="70" ry="22" fill="#38bdf8" opacity=".35" filter={ref('soft')} />
        <ellipse cx="610" cy="214" rx="70" ry="24" fill="#38bdf8" opacity=".35" filter={ref('soft')} />
        <path d="M534 134 C 590 136, 670 142, 716 150 C 670 158, 590 164, 534 166 Z" fill={ref('flame')} />
        <path d="M546 196 C 600 198, 676 206, 716 214 C 676 222, 600 230, 546 232 Z" fill={ref('flame')} />
        <path d="M534 143 C 560 145, 580 147, 598 150 C 580 153, 560 155, 534 157 Z" fill="#fff" />
        <path d="M546 206 C 572 208, 592 211, 610 214 C 592 217, 572 220, 546 222 Z" fill="#fff" />
      </g>

      {/* Tail fin */}
      <path d="M392 130 L 470 34 Q 476 28 486 28 L 540 28 Q 552 30 546 42 L 500 136 Z" fill={ref('body')} stroke="#d9d6fb" />
      <path d="M452 126 L 506 52 L 524 52 L 486 130 Z" fill={ref('navy')} />
      <path d="M470 108 L 500 70" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
      <use href={`#${id('spark')}`} transform="translate(506 78) scale(.9)" fill="#fff" />

      {/* Upper engine */}
      <rect x="458" y="124" width="84" height="52" rx="24" fill={ref('engine')} />
      <rect x="500" y="124" width="10" height="52" fill="#e9e7ff" opacity=".85" />
      <rect x="518" y="124" width="6" height="52" fill="#e9e7ff" opacity=".6" />
      <ellipse cx="538" cy="150" rx="7" ry="22" fill="#67e8f9" filter={ref('neon')} />

      {/* Fuselage */}
      <path d="M66 236 C 58 212, 86 186, 146 172 C 190 124, 300 106, 384 118 L 496 140 C 532 148, 540 206, 506 222 L 384 248 C 300 266, 150 270, 100 260 C 80 256, 70 248, 66 236 Z" fill={ref('body')} />
      <path d="M318 118 C 340 114, 360 114, 384 118 L 360 252 C 340 256, 322 258, 304 258 Z" fill={ref('navy')} />
      <path d="M332 120 L 348 119 L 326 256 L 312 257 Z" fill={ref('purple')} opacity=".9" />
      <use href={`#${id('spark')}`} transform="translate(350 150) scale(.8)" fill="#fff" />
      <use href={`#${id('spark')}`} transform="translate(338 200) scale(.45)" fill="#e9d5ff" />
      <path d="M472 138 L 500 142 C 520 148, 528 180, 512 200 L 488 204 C 496 180, 492 156, 472 138 Z" fill={ref('navy')} />
      <path d="M488 150 C 500 162, 504 178, 500 194" stroke="#8b5cf6" strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Canopy */}
      <path d="M140 178 C 176 134, 262 116, 312 124 C 322 126, 324 134, 320 144 L 304 194 C 250 200, 190 202, 146 194 C 134 192, 132 186, 140 178 Z" fill={ref('glass')} stroke="#2a1f6e" strokeWidth="5" />
      <path d="M168 168 C 196 140, 250 128, 290 130" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M196 182 L 268 180" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" filter={ref('neon')} />
      <circle cx="252" cy="146" r="2.5" fill="#fff" />
      <circle cx="214" cy="160" r="1.6" fill="#c4b5fd" />

      {/* Nose light */}
      <path d="M62 226 C 64 214, 76 208, 92 210 C 102 212, 104 230, 94 240 C 82 246, 64 240, 62 226 Z" fill="#141045" />
      <ellipse cx="84" cy="226" rx="12" ry="9" fill="#67e8f9" filter={ref('neon')} />

      {/* Neon strips */}
      <rect x="126" y="214" width="86" height="12" rx="6" fill="#0e0b33" />
      <rect x="132" y="217" width="74" height="6" rx="3" fill="#67e8f9" filter={ref('neon')} />
      <path d="M232 236 L 300 228" stroke="#0e0b33" strokeWidth="12" strokeLinecap="round" />
      <path d="M236 235 L 296 228" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" filter={ref('neon')} />
      <path d="M262 252 C 284 238, 304 232, 330 230" stroke={ref('purple')} strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* KUAi logo with orbit swoosh */}
      <path d="M360 212 C 396 232, 452 216, 468 172" stroke="#2563eb" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M392 154 C 420 140, 452 142, 466 158" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M464 154 l 8 4 l -9 3 Z" fill="#2563eb" />
      <text x="374" y="196" fontFamily="'Bricolage Grotesque', 'Space Grotesk', system-ui, sans-serif" fontWeight="700" fontStyle="italic" fontSize="34" fill="#22186b" letterSpacing="-1">
        KUAi
      </text>
      <use href={`#${id('spark')}`} transform="translate(394 142) scale(.5)" fill="#2563eb" />
      <use href={`#${id('spark')}`} transform="translate(372 222) scale(.45)" fill="#2563eb" />
      <use href={`#${id('spark')}`} transform="translate(462 204) scale(.4)" fill="#2563eb" />

      {/* Lower engine */}
      <rect x="470" y="186" width="84" height="56" rx="26" fill={ref('engine')} />
      <rect x="512" y="186" width="10" height="56" fill="#e9e7ff" opacity=".85" />
      <rect x="530" y="186" width="6" height="56" fill="#e9e7ff" opacity=".6" />
      <ellipse cx="550" cy="214" rx="7" ry="24" fill="#67e8f9" filter={ref('neon')} />

      {/* Front wing with planet emblem */}
      <path d="M372 240 L 548 256 Q 580 262 574 286 L 566 318 Q 562 330 548 328 L 412 306 Q 396 302 396 290 Z" fill={ref('body')} stroke="#d9d6fb" />
      <path d="M428 266 L 540 278 L 532 312 L 430 296 Z" fill={ref('navy')} />
      <use href={`#${id('spark')}`} transform="translate(462 280) scale(.75)" fill="#fff" />
      <g transform="translate(506 296)">
        <circle r="10" fill="#a78bfa" />
        <ellipse rx="20" ry="5" fill="none" stroke="#e9d5ff" strokeWidth="2.5" transform="rotate(-10)" />
      </g>
      <rect x="440" y="314" width="70" height="10" rx="5" fill="#67e8f9" filter={ref('neon')} transform="rotate(8 475 319)" />
      <path d="M548 300 L 572 304 L 566 324 L 546 322 Z" fill="#8b5cf6" />

      {/* Running lights */}
      <circle className="kuai-blink" cx="536" cy="34" r="3.5" fill="#f0abfc" />
      <circle className="kuai-blink kuai-blink--late" cx="568" cy="300" r="3.5" fill="#67e8f9" />
    </svg>
  )
}

export default SpaceShip
