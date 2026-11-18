
import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useMatch,
} from 'react-router'

import PortfolioPage, { MemberProfilePage } from './pages/PortfolioPage'
import ChatPage from './pages/ChatPage'
import GalaxyBackground from './components/layout/GalaxyBackground'
import { useLanguage } from './contexts/language-context'
import { PortfolioDataContext } from './data/portfolioData'
import type { PortfolioData } from './data/portfolioData'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/+$/, '')

function PortfolioLoader({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPortfolio() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/portfolio`, { signal: controller.signal })
        if (!response.ok) throw new Error(`Portfolio request failed: ${response.status}`)
        const result: unknown = await response.json()
        if (
          typeof result !== 'object' || result === null ||
          !('group' in result) || typeof result.group !== 'object' || result.group === null ||
          !('members' in result) || !Array.isArray(result.members) || result.members.length !== 3 ||
          !('teamProjects' in result) || !Array.isArray(result.teamProjects)
        ) throw new Error('Invalid portfolio response.')
        setData(result as PortfolioData)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
          setFailed(true)
        }
      }
    }

    void loadPortfolio()
    return () => controller.abort()
  }, [attempt])

  if (data) {
    return <PortfolioDataContext.Provider value={data}>{children}</PortfolioDataContext.Provider>
  }

  return (
    <main className="min-h-screen bg-transparent px-5 py-20 text-center text-white">
      {failed ? (
        <div role="alert">
          <p>{language === 'th' ? 'ไม่สามารถโหลดข้อมูล Portfolio ได้' : 'Unable to load portfolio data.'}</p>
          <button type="button" className="mt-4 underline" onClick={() => { setFailed(false); setAttempt((value) => value + 1) }}>
            {language === 'th' ? 'ลองอีกครั้ง' : 'Try again'}
          </button>
        </div>
      ) : (
        <p role="status">{language === 'th' ? 'กำลังโหลดข้อมูล' : 'Loading portfolio...'}</p>
      )}
    </main>
  )
}

function App() {
  const isChatRoute = useMatch('/chat') !== null

  return (
    <>
    <GalaxyBackground spiralPosition={isChatRoute ? 'bottom-left' : 'top-right'} />
    <Routes>

      {/* Main Portfolio Page */}
      <Route
        path="/"
        element={<PortfolioLoader><PortfolioPage /></PortfolioLoader>}
      />

      <Route
        path="/members/:memberId"
        element={<PortfolioLoader><MemberProfilePage /></PortfolioLoader>}
      />

      {/* AI Chat Page */}
      <Route
        path="/chat"
        element={null}
      />

      {/* Redirect unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
    <div hidden={!isChatRoute}>
      <ChatPage />
    </div>
    </>
  )
}

export default App
