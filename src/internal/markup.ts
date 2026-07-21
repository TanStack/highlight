import type { TokenRange, TokenizerContext } from '../core.js'
import { offsetRanges } from './patterns.js'

export type MarkupMode = 'ejs' | 'html' | 'svelte' | 'vue'

export function collectMarkupRanges(
  code: string,
  context: TokenizerContext,
  mode: MarkupMode = 'html',
) {
  const ranges: Array<TokenRange> = []
  const regions: Array<{ end: number; lang: string; start: number }> = []
  let index = 0

  while (index < code.length) {
    if (code.startsWith('<!--', index)) {
      const close = code.indexOf('-->', index + 4)
      const end = close < 0 ? code.length : close + 3
      ranges.push({ start: index, end, className: 'comment' })
      index = end
      continue
    }

    if (mode === 'ejs' && code.startsWith('<%', index)) {
      const close = code.indexOf('%>', index + 2)
      const end = close < 0 ? code.length : close
      regions.push({ start: index + 2, end, lang: 'js' })
      index = close < 0 ? code.length : close + 2
      continue
    }

    if (code[index] !== '<') {
      index++
      continue
    }

    const closing = code[index + 1] === '/'
    const nameStart = index + (closing ? 2 : 1)
    const nameMatch = /^[A-Za-z][\w:.-]*/.exec(code.slice(nameStart))
    if (!nameMatch) {
      index++
      continue
    }

    const tagEnd = findTagEnd(code, nameStart + nameMatch[0].length)
    if (tagEnd < 0) {
      index++
      continue
    }

    const tagName = nameMatch[0].toLowerCase()
    ranges.push({
      start: nameStart,
      end: nameStart + nameMatch[0].length,
      className: 'tag',
    })
    if (!closing) collectAttributes(code, nameStart + nameMatch[0].length, tagEnd, ranges)

    if (!closing && (tagName === 'script' || tagName === 'style')) {
      const closingTag = `</${tagName}`
      const contentEnd = code.toLowerCase().indexOf(closingTag, tagEnd + 1)
      if (contentEnd >= 0) {
        const openingTag = code.slice(index, tagEnd + 1)
        const lang = getEmbeddedLanguage(tagName, openingTag)
        regions.push({ start: tagEnd + 1, end: contentEnd, lang })
      }
    }

    index = tagEnd + 1
  }

  if (mode === 'vue') collectDelimitedRegions(code, '{{', '}}', 'js', regions)
  if (mode === 'svelte') collectBraceRegions(code, regions)

  for (const region of regions) {
    if (region.start >= region.end || !context.hasLanguage(region.lang)) continue
    ranges.push(
      ...offsetRanges(
        context.tokenize(code.slice(region.start, region.end), region.lang),
        region.start,
      ),
    )
  }

  return ranges
}

function collectAttributes(
  code: string,
  start: number,
  end: number,
  ranges: Array<TokenRange>,
) {
  const source = code.slice(start, end)
  const attributes = /\s([:@A-Za-z_][\w:.-]*)(?=\s*(?:=|\/?>))/g
  let match: RegExpExecArray | null
  while ((match = attributes.exec(source))) {
    const offset = match[0].indexOf(match[1])
    const attributeStart = start + match.index + offset
    ranges.push({
      start: attributeStart,
      end: attributeStart + match[1].length,
      className: 'attr',
    })
  }

  let index = start
  while (index < end) {
    const quote = code[index]
    if (quote !== '"' && quote !== "'") {
      index++
      continue
    }
    const close = findQuoteEnd(code, index, quote, end)
    ranges.push({ start: index, end: close, className: 'string' })
    index = close
  }
}

function getEmbeddedLanguage(tag: string, openingTag: string) {
  if (tag === 'style') return 'css'
  const lang = /\blang\s*=\s*["']?([\w-]+)/i.exec(openingTag)?.[1]
  return lang === 'ts' || lang === 'typescript' ? 'ts' : 'js'
}

function collectDelimitedRegions(
  code: string,
  open: string,
  close: string,
  lang: string,
  regions: Array<{ end: number; lang: string; start: number }>,
) {
  let index = 0
  while ((index = code.indexOf(open, index)) >= 0) {
    const end = code.indexOf(close, index + open.length)
    if (end < 0) return
    regions.push({ start: index + open.length, end, lang })
    index = end + close.length
  }
}

function collectBraceRegions(
  code: string,
  regions: Array<{ end: number; lang: string; start: number }>,
) {
  let index = 0
  while (index < code.length) {
    if (code[index] !== '{' || code[index + 1] === '#') {
      index++
      continue
    }
    const end = code.indexOf('}', index + 1)
    if (end < 0) return
    regions.push({ start: index + 1, end, lang: 'js' })
    index = end + 1
  }
}

function findTagEnd(code: string, start: number) {
  let index = start
  while (index < code.length) {
    if (code[index] === '"' || code[index] === "'") {
      index = findQuoteEnd(code, index, code[index], code.length)
    } else if (code[index] === '>') return index
    else index++
  }
  return -1
}

function findQuoteEnd(
  code: string,
  start: number,
  quote: string,
  limit: number,
) {
  let index = start + 1
  while (index < limit) {
    if (code[index] === '\\') index += 2
    else if (code[index] === quote) return index + 1
    else index++
  }
  return limit
}
