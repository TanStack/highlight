import {
  defineLanguage,
  type TokenRange,
  type TokenizerContext,
} from '../core.js'
import { collectPatternRanges, offsetRanges } from '../internal/patterns.js'

export const markdown = defineLanguage({
  name: 'markdown',
  aliases: ['md'],
  tokenize(code, context) {
    return collectPatternRanges(
      code,
      [
        { className: 'heading', regex: /^#{1,6}\s.*$/gm },
        { className: 'heading', regex: /^.+\n(?:=+|-+)\s*$/gm },
        { className: 'code-inline', regex: /`[^`\n]+`/g },
        { className: 'link', regex: /!?\[[^\]]+\]\([^)]+\)/g },
        { className: 'meta', regex: /^\s{0,3}(?:>|[-*+] |\d+\. )/gm },
      ],
      collectFencedCode(code, context),
    )
  },
})

function collectFencedCode(code: string, context: TokenizerContext) {
  const ranges: Array<TokenRange> = []
  const opening = /^( {0,3})(`{3,}|~{3,})\s*([^\n]*)$/gm
  let match: RegExpExecArray | null

  while ((match = opening.exec(code))) {
    const marker = match[2]
    const contentStart = code.indexOf('\n', match.index + match[0].length)
    if (contentStart < 0) break

    const closing = new RegExp(`^ {0,3}${marker[0]}{${marker.length},}\\s*$`, 'gm')
    closing.lastIndex = contentStart + 1
    const close = closing.exec(code)
    const contentEnd = close?.index ?? code.length
    const info = match[3].trim().split(/\s+/)[0]
    const embedded = info && context.hasLanguage(info)
      ? offsetRanges(
          context.tokenize(code.slice(contentStart + 1, contentEnd), info),
          contentStart + 1,
        )
      : []

    ranges.push({ start: match.index, end: contentStart, className: 'meta' })
    ranges.push(...fillCodeRange(contentStart + 1, contentEnd, embedded))
    if (close) ranges.push({ start: close.index, end: close.index + close[0].length, className: 'meta' })

    opening.lastIndex = close ? close.index + close[0].length : code.length
  }

  return ranges
}

function fillCodeRange(
  start: number,
  end: number,
  embedded: ReadonlyArray<TokenRange>,
) {
  const ranges: Array<TokenRange> = []
  let index = start
  for (const range of [...embedded].sort((a, b) => a.start - b.start)) {
    if (range.start > index) ranges.push({ start: index, end: range.start, className: 'code-inline' })
    ranges.push(range)
    index = range.end
  }
  if (index < end) ranges.push({ start: index, end, className: 'code-inline' })
  return ranges
}
