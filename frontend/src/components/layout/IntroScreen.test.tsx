/**
 * @vitest-environment jsdom
 */

import type { ReactNode } from 'react'

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import '@testing-library/jest-dom/vitest'

import IntroScreen from './IntroScreen'
import { shouldShowIntro } from './introStorage'

import { LanguageContext } from '../../contexts/language-context'

import type { Language } from '../../data/portfolioData'

function renderWithLanguage(component: ReactNode, language: Language = 'en') {
  return render(
    <LanguageContext.Provider value={{ language, setLanguage: () => undefined }}>
      {component}
    </LanguageContext.Provider>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  window.sessionStorage.clear()
  // jsdom has no canvas; the starfield simply stays off.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  // The intro asks the API for live crew details; fail so the built-in copy is used.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => null }))
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('IntroScreen Component', () => {

  it('should show the KUAi ship with GO and Skip buttons', () => {
    renderWithLanguage(<IntroScreen onFinish={() => undefined} />)

    expect(screen.getByRole('img', { name: 'KUAi spaceship' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'GO — launch the ship' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
  })

  it('should show Thai copy when Thai is selected', () => {
    renderWithLanguage(<IntroScreen onFinish={() => undefined} />, 'th')

    expect(screen.getByText('พร้อมออกเดินทาง')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ข้าม' })).toBeInTheDocument()
  })

  it('should warp to three crew holograms after GO', () => {
    renderWithLanguage(<IntroScreen onFinish={() => undefined} />)

    fireEvent.click(screen.getByRole('button', { name: 'GO — launch the ship' }))
    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.getByRole('heading', { name: 'Ice' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Phum' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enter the portfolio/ })).toBeInTheDocument()
  })

  it('should finish and remember the intro when skipped', () => {
    const onFinish = vi.fn()
    renderWithLanguage(<IntroScreen onFinish={onFinish} />)

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(shouldShowIntro()).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('should skip with the Escape key', () => {
    const onFinish = vi.fn()
    renderWithLanguage(<IntroScreen onFinish={onFinish} />)

    fireEvent.keyDown(window, { key: 'Escape' })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

})
