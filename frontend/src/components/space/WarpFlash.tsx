import { useEffect } from 'react'

const WARP_MS = 700

interface WarpFlashProps {
  onDone: () => void
}

/** A short light-speed burst played when travelling from the portfolio to the chat. */
function WarpFlash({ onDone }: WarpFlashProps) {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(onDone, reduce ? 0 : WARP_MS)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <div className="kuai-warp" aria-hidden="true">
      <div className="kuai-warp-streaks" />
      <div className="kuai-warp-flash" />
    </div>
  )
}

export default WarpFlash
