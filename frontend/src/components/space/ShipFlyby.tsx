import { useEffect, useState } from 'react'

import SpaceShip from './SpaceShip'

const FIRST_FLIGHT_MS = 2500
const EVERY_MS = 14000

/** A small KUAi ship that drifts across the background now and then. */
function ShipFlyby() {
  const [flight, setFlight] = useState(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const first = window.setTimeout(() => setFlight(1), FIRST_FLIGHT_MS)
    const repeat = window.setInterval(() => setFlight((value) => value + 1), EVERY_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(repeat)
    }
  }, [])

  if (flight === 0) return null

  // A new key restarts the CSS flight; the lane changes each pass.
  const top = 18 + ((flight * 37) % 45)

  return (
    <div key={flight} className="kuai-flyby" style={{ top: `${top}%` }} aria-hidden="true">
      <SpaceShip className="kuai-flyby-ship" />
    </div>
  )
}

export default ShipFlyby
