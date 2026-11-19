import type { ReactNode } from 'react'

/**
 * Renders the small subset of Markdown that Gemini uses in answers
 * (paragraphs, bullet and numbered lists, headings, **bold**, *italic*
 * and `code`) as React elements. No HTML is injected, so model output
 * can never run as markup.
 */

type Block =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }

const BULLET = /^\s*[-*•]\s+(.*)$/
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/
const HEADING = /^\s*#{1,6}\s+(.*)$/
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|`[^`\n]+`|\*[^*\s][^*\n]*\*)/g

function parseBlocks(text: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', lines: paragraph })
      paragraph = []
    }
  }

  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const bullet = BULLET.exec(line)
    const numbered = bullet ? null : NUMBERED.exec(line)
    const heading = HEADING.exec(line)

    const listMatch = bullet ?? numbered

    if (listMatch) {
      flushParagraph()
      const ordered = numbered !== null
      const item = listMatch[1]
      const last = blocks[blocks.length - 1]

      if (last?.kind === 'list' && last.ordered === ordered) {
        last.items.push(item)
      } else {
        blocks.push({ kind: 'list', ordered, items: [item] })
      }
    } else if (heading) {
      flushParagraph()
      blocks.push({ kind: 'heading', text: heading[1] })
    } else if (line.trim() === '') {
      flushParagraph()
    } else {
      paragraph.push(line)
    }
  }

  flushParagraph()
  return blocks
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      if (part.length > 4) {
        return (
          <strong key={key} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[13px]">
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }

    return part
  })
}

function RichText({ text }: { text: string }) {
  const blocks = parseBlocks(text)

  return (
    <div className="space-y-2 text-[15px] leading-7 wrap-break-word">
      {blocks.map((block, index) => {
        const key = `block-${index}`

        if (block.kind === 'heading') {
          return (
            <p key={key} className="font-semibold text-white">
              {renderInline(block.text, key)}
            </p>
          )
        }

        if (block.kind === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'
          return (
            <ListTag
              key={key}
              className={`space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-fuchsia-300`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
              ))}
            </ListTag>
          )
        }

        return (
          <p key={key} className="whitespace-pre-wrap">
            {renderInline(block.lines.join('\n'), key)}
          </p>
        )
      })}
    </div>
  )
}

export default RichText
