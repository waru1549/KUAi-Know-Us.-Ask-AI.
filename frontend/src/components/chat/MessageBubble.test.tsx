
/**
 * @vitest-environment jsdom
 */

import type { ReactNode } from 'react'

import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  cleanup,
  render,
  screen,
} from '@testing-library/react'

import '@testing-library/jest-dom/vitest'

import MessageBubble from './MessageBubble'

import { LanguageContext } from '../../contexts/language-context'

import type { Language } from '../../data/portfolioData'
import type { ChatMessage } from '../../types/chat'

// Clean up rendered components after every test
afterEach(() => {
  cleanup()
})

// Render with an explicit language context
function renderWithLanguage(
  component: ReactNode,
  language: Language = 'en',
) {
  return render(
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: () => undefined,
      }}
    >
      {component}
    </LanguageContext.Provider>,
  )
}

// Test Data
const userMessage: ChatMessage = {
  id: 'user-message-001',
  role: 'user',
  content: 'Who are the team members?',
  createdAt: '2026-11-09T12:30:00.000Z',
}

const assistantMessage: ChatMessage = {
  id: 'assistant-message-001',
  role: 'assistant',
  content: 'Our team consists of three members.',
  createdAt: '2026-11-09T12:31:00.000Z',
}

// =========================================
// MESSAGE BUBBLE TESTS
// =========================================

describe('MessageBubble Component', () => {

  // TEST 1: USER MESSAGE

  it('should display a user message correctly', () => {

    renderWithLanguage(
      <MessageBubble message={userMessage} />,
    )

    expect(
      screen.getByText('You'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Who are the team members?'),
    ).toBeInTheDocument()

  })

  // TEST 2: ASSISTANT MESSAGE

  it('should display an assistant message correctly', () => {

    renderWithLanguage(
      <MessageBubble message={assistantMessage} />,
    )

    expect(
      screen.getByText('Team AI'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Our team consists of three members.'),
    ).toBeInTheDocument()

  })

    // TEST 3: USER MESSAGE IN THAI

  it('should display a Thai user label when language is Thai', () => {
    renderWithLanguage(
      <MessageBubble message={userMessage} />,
      'th',
    )

    expect(
      screen.getByText('คุณ'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Who are the team members?'),
    ).toBeInTheDocument()
  })

  // TEST 4: ASSISTANT MESSAGE IN THAI

  it('should display a Thai assistant label when language is Thai', () => {
    renderWithLanguage(
      <MessageBubble message={assistantMessage} />,
      'th',
    )

    expect(
      screen.getByText('ผู้ช่วย AI'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Our team consists of three members.'),
    ).toBeInTheDocument()
  })
  // TEST 3: MESSAGE TIMESTAMP

  it('should display the correct message timestamp', () => {

    renderWithLanguage(
      <MessageBubble message={userMessage} />,
    )

    const timestamp = document.querySelector('time')

    expect(timestamp).toBeInTheDocument()

    expect(timestamp).toHaveAttribute(
      'datetime',
      userMessage.createdAt,
    )

  })


  // TEST: MARKDOWN IN AI ANSWERS

  it('should render Markdown bullets and bold text in assistant answers without raw asterisks', () => {
    renderWithLanguage(
      <MessageBubble
        message={{
          ...assistantMessage,
          content:
            'The team consists of 3 members:\n\n* **Ice** – Frontend\n* **Phum** – Backend\n* **View** – DevOps',
        }}
      />,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(screen.getByText('Ice').tagName).toBe('STRONG')
    expect(document.body.textContent).not.toContain('**')
    expect(screen.getByText('The team consists of 3 members:')).toBeInTheDocument()
  })

  it('should keep user messages as plain text', () => {
    renderWithLanguage(
      <MessageBubble message={{ ...userMessage, content: '**not bold**' }} />,
    )

    expect(screen.getByText('**not bold**')).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

})
