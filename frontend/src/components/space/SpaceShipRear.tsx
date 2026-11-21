import { useId } from 'react'

/**
 * The KUAi ship seen from behind: three glowing engines, swept wings with the
 * star and planet emblems, dark canopy and the KUAi orbit logo on its back.
 * Used when the ship dives into the galaxy. Gradient ids are unique per instance.
 */
function SpaceShipRear({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const ref = (name: string) => `url(#${id(name)})`

  return (
    <svg className={className} viewBox="0 0 400 380" aria-hidden="true">
    <defs>
      <linearGradient id={id('RB')} x1="0" y1="40" x2="0" y2="300" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff"/><stop offset=".6" stopColor="#eeecff"/><stop offset="1" stopColor="#b9b3ea"/>
      </linearGradient>
      <linearGradient id={id('RS')} x1="140" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#000" stopOpacity=".18"/><stop offset=".3" stopColor="#000" stopOpacity="0"/><stop offset=".7" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity=".22"/>
      </linearGradient>
      <linearGradient id={id('RN')} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#3b2a8f"/><stop offset=".6" stopColor="#241a63"/><stop offset="1" stopColor="#120c3a"/>
      </linearGradient>
      <linearGradient id={id('RG')} x1="0" y1="60" x2="0" y2="140" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3a3191"/><stop offset=".6" stopColor="#14104a"/><stop offset="1" stopColor="#07051f"/>
      </linearGradient>
      <linearGradient id={id('RE')} x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#1e1859"/><stop offset=".5" stopColor="#4c3fa8"/><stop offset="1" stopColor="#1e1859"/>
      </linearGradient>
      <radialGradient id={id('RF')} cx=".5" cy=".35" r=".65">
        <stop stopColor="#ffffff"/><stop offset=".3" stopColor="#cffafe"/><stop offset=".65" stopColor="#38bdf8" stopOpacity=".7"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/>
      </radialGradient>
      <filter id={id('RNeon')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <path id={id('RSp')} d="M0 -9 C 1 -2, 2 -1, 9 0 C 2 1, 1 2, 0 9 C -1 2, -2 1, -9 0 C -2 -1, -1 -2, 0 -9 Z"/>
    </defs>
  
    {/* engine glow (behind) */}
    <g className="kuai-rear-glow">
      <ellipse cx="200" cy="330" rx="62" ry="54" fill={ref('RF')}/>
      <ellipse cx="128" cy="312" rx="44" ry="40" fill={ref('RF')}/>
      <ellipse cx="272" cy="312" rx="44" ry="40" fill={ref('RF')}/>
    </g>
  
    {/* wings */}
    <path d="M150 196 L 24 248 Q 12 254 18 266 L 30 290 Q 36 298 48 294 L 158 258 Z" fill={ref('RB')} stroke="#d9d6fb"/>
    <path d="M250 196 L 376 248 Q 388 254 382 266 L 370 290 Q 364 298 352 294 L 242 258 Z" fill={ref('RB')} stroke="#d9d6fb"/>
    <path d="M138 216 L 54 252 L 62 272 L 144 246 Z" fill={ref('RN')}/>
    <path d="M262 216 L 346 252 L 338 272 L 256 246 Z" fill={ref('RN')}/>
    <path d="M30 286 L 150 252" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" filter={ref('RNeon')}/>
    <path d="M370 286 L 250 252" stroke="#67e8f9" strokeWidth="5" strokeLinecap="round" filter={ref('RNeon')}/>
    <g transform="translate(92 252)"><circle r="7" fill="#a78bfa"/><ellipse rx="14" ry="3.5" fill="none" stroke="#e9d5ff" strokeWidth="2" transform="rotate(-18)"/></g>
    <use href={`#${id('RSp')}`} transform="translate(312 246) scale(.8)" fill="#fff"/>
    <use href={`#${id('RSp')}`} transform="translate(118 236) scale(.45)" fill="#fff"/>
  
    {/* side engines */}
    <rect x="104" y="232" width="48" height="74" rx="20" fill={ref('RE')}/>
    <rect x="248" y="232" width="48" height="74" rx="20" fill={ref('RE')}/>
    <rect x="104" y="262" width="48" height="8" fill="#e9e7ff" opacity=".85"/>
    <rect x="248" y="262" width="48" height="8" fill="#e9e7ff" opacity=".85"/>
    <ellipse cx="128" cy="304" rx="20" ry="9" fill="#ecfeff" filter={ref('RNeon')}/>
    <ellipse cx="272" cy="304" rx="20" ry="9" fill="#ecfeff" filter={ref('RNeon')}/>
  
    {/* fuselage */}
    <path d="M200 26 C 236 30, 258 96, 262 160 C 266 212, 258 262, 236 290 L 164 290 C 142 262, 134 212, 138 160 C 142 96, 164 30, 200 26 Z" fill={ref('RB')}/>
    <path d="M200 26 C 236 30, 258 96, 262 160 C 266 212, 258 262, 236 290 L 164 290 C 142 262, 134 212, 138 160 C 142 96, 164 30, 200 26 Z" fill={ref('RS')}/>
    {/* navy shoulder panels */}
    <path d="M140 150 C 146 120, 156 110, 164 112 L 160 196 C 150 196, 142 186, 140 170 Z" fill={ref('RN')}/>
    <path d="M260 150 C 254 120, 244 110, 236 112 L 240 196 C 250 196, 258 186, 260 170 Z" fill={ref('RN')}/>
    <path d="M152 128 L 160 128 L 156 186 L 148 182 Z" fill="#8b5cf6" opacity=".9"/>
    <path d="M248 128 L 240 128 L 244 186 L 252 182 Z" fill="#8b5cf6" opacity=".9"/>
    <use href={`#${id('RSp')}`} transform="translate(160 214) scale(.6)" fill="#fff"/>
    <use href={`#${id('RSp')}`} transform="translate(242 150) scale(.45)" fill="#e9d5ff"/>
  
    {/* canopy */}
    <path d="M200 44 C 224 46, 238 80, 238 112 C 226 124, 174 124, 162 112 C 162 80, 176 46, 200 44 Z" fill={ref('RG')} stroke="#2a1f6e" strokeWidth="4"/>
    <path d="M184 66 C 190 56, 204 52, 214 56" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" fill="none"/>
    <path d="M176 116 L 224 116" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" filter={ref('RNeon')}/>
  
    {/* KUAi logo with orbit swoosh */}
    <path d="M152 206 C 170 226, 236 224, 250 182" stroke="#2563eb" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M170 160 C 190 148, 224 150, 240 166" stroke="#2563eb" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M238 162 l 8 4 l -9 3 Z" fill="#2563eb"/>
    <text x="200" y="198" textAnchor="middle" fontFamily="'Bricolage Grotesque', 'Space Grotesk', sans-serif" fontWeight="700" fontStyle="italic" fontSize="34" fill="#22186b" letterSpacing="-1">KUAi</text>
    <use href={`#${id('RSp')}`} transform="translate(166 172) scale(.45)" fill="#2563eb"/>
    <use href={`#${id('RSp')}`} transform="translate(246 206) scale(.4)" fill="#2563eb"/>
  
    {/* centre engine */}
    <rect x="168" y="254" width="64" height="76" rx="24" fill={ref('RE')}/>
    <rect x="168" y="284" width="64" height="9" fill="#e9e7ff" opacity=".9"/>
    <ellipse cx="200" cy="328" rx="27" ry="11" fill="#ffffff" filter={ref('RNeon')}/>
  
    {/* running lights */}
    <circle className="kuai-blink" cx="22" cy="262" r="3.5" fill="#f0abfc"/>
    <circle className="kuai-blink kuai-blink--late" cx="378" cy="262" r="3.5" fill="#67e8f9"/>
  </svg>
  )
}

export default SpaceShipRear
