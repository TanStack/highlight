import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

export const shell = defineLanguage({
  name: 'shell',
  aliases: ['bash', 'sh', 'zsh', 'cmd', 'console'],
  tokenize(code) {
    return collectPatternRanges(
      code,
      [
        { collect: collectShellLexicalRanges },
        { className: 'variable', regex: /\$[A-Za-z_][A-Za-z0-9_]*|\b[A-Z_][A-Z0-9_]*(?==)/g },
        { className: 'keyword', regex: /\b(?:case|do|done|elif|else|esac|export|fi|for|function|if|in|select|then|time|until|while)\b/g },
        { className: 'command', regex: /(^|[\n;|&])\s*([A-Za-z0-9_./-]+)(?=\s|$)/g, group: 2 },
      ],
    )
  },
})

function collectShellLexicalRanges(code: string) {
  const ranges: Array<TokenRange> = []
  collectHeredocs(code, ranges)
  let index = 0

  while (index < code.length) {
    if (insideRange(index, ranges)) {
      index = ranges.find((range) => range.start <= index && range.end > index)!.end
      continue
    }

    const character = code[index]
    if (character === '"' || character === "'") {
      const quote = character
      let end = index + 1
      while (end < code.length) {
        if (code[end] === '\\' && quote === '"') end += 2
        else if (code[end] === quote) {
          end++
          break
        } else end++
      }
      ranges.push({ start: index, end, className: 'string' })
      index = end
      continue
    }

    if (character === '$' && code[index + 1] === '{') {
      const close = code.indexOf('}', index + 2)
      const end = close < 0 ? code.length : close + 1
      ranges.push({ start: index, end, className: 'variable' })
      index = end
      continue
    }

    if (
      character === '#' &&
      (index === 0 || code[index - 1] === '\n' || /[\s;|&()]/.test(code[index - 1]))
    ) {
      const newline = code.indexOf('\n', index)
      const end = newline < 0 ? code.length : newline
      ranges.push({ start: index, end, className: 'comment' })
      index = end
      continue
    }

    index++
  }
  return ranges
}

function collectHeredocs(code: string, ranges: Array<TokenRange>) {
  const regex = /<<-?\s*(['"]?)([A-Za-z_][A-Za-z0-9_]*)\1/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code))) {
    if (code[match.index - 1] === '<' || isInsideQuote(code, match.index)) continue
    const bodyStartLine = code.indexOf('\n', match.index + match[0].length)
    if (bodyStartLine < 0) continue
    const bodyStart = bodyStartLine + 1
    const close = new RegExp(`^\\t*${escapeRegex(match[2])}\\s*$`, 'm')
    const closingMatch = close.exec(code.slice(bodyStart))
    if (!closingMatch) {
      ranges.push({ start: bodyStart, end: code.length, className: 'string' })
      continue
    }
    const end = bodyStart + closingMatch.index
    if (end > bodyStart) ranges.push({ start: bodyStart, end, className: 'string' })
    const closingStart = bodyStart + closingMatch.index
    ranges.push({
      start: closingStart,
      end: closingStart + closingMatch[0].length,
      className: 'meta',
    })
  }
}

function isInsideQuote(code: string, index: number) {
  const lineStart = code.lastIndexOf('\n', index - 1) + 1
  let quote = ''
  for (let cursor = lineStart; cursor < index; cursor++) {
    if (code[cursor] === '\\' && quote !== "'") cursor++
    else if (quote && code[cursor] === quote) quote = ''
    else if (!quote && (code[cursor] === '"' || code[cursor] === "'")) {
      quote = code[cursor]
    }
  }
  return Boolean(quote)
}

function insideRange(index: number, ranges: ReadonlyArray<TokenRange>) {
  return ranges.some((range) => range.start <= index && range.end > index)
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
