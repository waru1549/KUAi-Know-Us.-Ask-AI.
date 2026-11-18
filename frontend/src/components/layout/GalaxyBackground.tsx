import { useEffect, useRef } from 'react'

interface GalaxyBackgroundProps {
  /** Where the spiral galaxy sits. The chat page keeps it out from behind the chat panel. */
  spiralPosition?: 'top-right' | 'bottom-left'
}

/**
 * Fixed, decorative, animated galaxy that sits behind every page.
 * All motion is CSS (see index.css "ANIMATED GALAXY BACKGROUND");
 * this component only adds a gentle mouse parallax to the nearest layer.
 */
function GalaxyBackground({ spiralPosition = 'top-right' }: GalaxyBackgroundProps) {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let frame = 0

    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * -40
        const y = (event.clientY / window.innerHeight - 0.5) * -20
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`
        }
      })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <div className="galaxy" aria-hidden="true" data-testid="galaxy-background">
      <div className="galaxy-nebula galaxy-nebula--1" />
      <div className="galaxy-nebula galaxy-nebula--2" />
      <div className="galaxy-nebula galaxy-nebula--3" />

      <div className="galaxy-stars galaxy-stars--1" />
      <div className="galaxy-stars galaxy-stars--2" />

      <div ref={parallaxRef} className="galaxy-parallax">
        <div
          className={`galaxy-spiral${
            spiralPosition === 'bottom-left' ? ' galaxy-spiral--bottom-left' : ''
          }`}
        >
          <div className="galaxy-arms" />
          <div className="galaxy-dust" />
          <div className="galaxy-core" />
        </div>
        <div className="galaxy-stars galaxy-stars--3" />
      </div>

      <div className="galaxy-shooting-star" />
      <div className="galaxy-shooting-star galaxy-shooting-star--late" />
    </div>
  )
}

export default GalaxyBackground
