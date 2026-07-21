import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

export const yaml = defineLanguage({
  name: 'yaml',
  aliases: ['yml'],
  tokenize(code) {
    const lexical = [
      ...collectYamlBlockScalars(code),
      ...collectYamlLexicalRanges(code),
    ]
    return collectPatternRanges(
      code,
      [
        { className: 'property', regex: /^[ \t-]*([A-Za-z0-9_.-]+)(?=\s*:)/gm, group: 1 },
        { collect: collectYamlValues },
        { className: 'literal', regex: /\b(?:false|null|true|yes|no|on|off|~)\b/gi },
        { className: 'number', regex: /\b\d+(?:\.\d+)?\b/g },
      ],
      lexical,
    )
  },
})

function collectYamlBlockScalars(code: string) {
  const ranges: Array<TokenRange> = []
  const opening = /^(\s*)[\w.-]+:\s*[>|][+-]?\s*(?:#.*)?$/gm
  let match: RegExpExecArray | null
  while ((match = opening.exec(code))) {
    const start = code.indexOf('\n', match.index + match[0].length)
    if (start < 0) continue
    const indentation = match[1].length
    let end = start + 1
    while (end < code.length) {
      const lineEnd = code.indexOf('\n', end)
      const next = lineEnd < 0 ? code.length : lineEnd
      const line = code.slice(end, next)
      if (line.trim() && (line.match(/^\s*/)?.[0].length || 0) <= indentation) break
      end = lineEnd < 0 ? code.length : lineEnd + 1
    }
    if (end > start + 1) ranges.push({ start: start + 1, end, className: 'string' })
  }
  return ranges
}

function collectYamlLexicalRanges(code: string) {
  const ranges: Array<TokenRange> = []
  let index = 0

  while (index < code.length) {
    const character = code[index]
    if (character === '"' || character === "'") {
      const quote = character
      let end = index + 1
      while (end < code.length && code[end] !== '\n') {
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

    if (
      character === '#' &&
      (index === 0 || code[index - 1] === '\n' || /\s/.test(code[index - 1]))
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

function collectYamlValues(code: string) {
  const ranges: Array<TokenRange> = []
  const regex = /:\s*([^\n]*)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code))) {
    const value = match[1]
    const trimmed = value.trimEnd()
    if (!trimmed) continue
    const start = match.index + match[0].indexOf(value)
    let end = start + trimmed.length
    const comment = /\s+#/.exec(trimmed)
    if (comment) end = start + comment.index
    while (end > start && /\s/.test(code[end - 1])) end--
    if (end > start) ranges.push({ start, end, className: 'string' })
  }
  return ranges
}
