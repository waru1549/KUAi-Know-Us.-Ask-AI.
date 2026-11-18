
/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'

import { MemoryRouter } from 'react-router'

import { LanguageProvider } from '../contexts/LanguageProvider'
import { portfolioData } from '../../../backend/src/portfolioData'
import { PortfolioDataContext } from '../data/portfolioData'
import PortfolioPage from './PortfolioPage'

type TestLanguage = 'en' | 'th'

function renderPortfolioPage(language: TestLanguage) {
  window.localStorage.setItem(
    'team-portfolio-ai-language',
    language,
  )

  return render(
    <LanguageProvider>
      <MemoryRouter>
        <PortfolioDataContext.Provider value={portfolioData}>
          <PortfolioPage />
        </PortfolioDataContext.Provider>
      </MemoryRouter>
    </LanguageProvider>,
  )
}

describe('PortfolioPage Footer', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should display the English footer content', () => {
    renderPortfolioPage('en')

    expect(
      screen.getByText(/© \d{4} KUAi — Know Us\. Ask AI\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Built with React · Express · PostgreSQL · Gemini',
      ),
    ).toBeInTheDocument()
  })

  it('should display the Thai footer content', () => {
    renderPortfolioPage('th')

    expect(
      screen.getByText(/© \d{4} KUAi — Know Us\. Ask AI\./),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'พัฒนาด้วย React · Express · PostgreSQL · Gemini',
      ),
    ).toBeInTheDocument()
  })
})
