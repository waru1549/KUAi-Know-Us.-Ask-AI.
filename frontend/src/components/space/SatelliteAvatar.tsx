interface SatelliteAvatarProps {
  /** 'sm' for chat bubbles, 'lg' for the chat page header. */
  size?: 'sm' | 'lg'
  /** Show the green "connected" light. */
  online?: boolean
}

/** The AI assistant's avatar: a small satellite dish sending the team's signal. */
function SatelliteAvatar({ size = 'sm', online = false }: SatelliteAvatarProps) {
  const box = size === 'lg' ? 'size-14 rounded-2xl' : 'size-9 rounded-xl'

  return (
    <div className={`kuai-dish-avatar relative grid shrink-0 place-items-center ${box}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" className="w-[72%]">
        <g className="kuai-dish-rotor">
          <path d="M4 14 C 9 28, 31 28, 36 14 C 29 19, 11 19, 4 14 Z" fill="#c4b5fd" />
          <path d="M7 15 C 13 22, 27 22, 33 15" stroke="#fff" strokeOpacity=".55" fill="none" />
          <line x1="20" y1="20" x2="20" y2="6" stroke="#e9d5ff" strokeWidth="2" />
          <circle cx="20" cy="5" r="3" fill="#67e8f9" />
        </g>
        <path d="M14 38 L18 26 H22 L26 38 Z" fill="#7c3aed" />
      </svg>
      {online && (
        <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      )}
    </div>
  )
}

export default SatelliteAvatar
