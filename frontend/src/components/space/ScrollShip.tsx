import { useEffect, useState } from 'react'

import SpaceShip from './SpaceShip'

/** A thin track on the right edge with a tiny ship that travels down as the page scrolls. */
function ScrollShip() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    frame = window.requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="kuai-scroll-track" aria-hidden="true">
      <div className="kuai-scroll-fill" style={{ height: `${progress * 100}%` }} />
      <div className="kuai-scroll-ship" style={{ top: `${progress * 100}%` }}>
        <SpaceShip />
      </div>
    </div>
  )
}

export default ScrollShip
