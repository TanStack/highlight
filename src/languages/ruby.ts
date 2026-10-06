import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'variable', regex: /@@?[A-Za-z_]\w*|\$(?:\w+|[^\s\w])/g },
  { className: 'string', regex: /(?<![\w:]):[A-Za-z_]\w*[?!]?/g },
  { className: 'property', regex: /(?<![\w:.])[A-Za-z_]\w*[?!]?(?=:(?!:))/g },
  { className: 'function', regex: /\bdef\s+(?:self\.)?([A-Za-z_]\w*[?!=]?|[-+*/%<=>!~^&|[\]]+)/g, group: 1 },
  { className: 'keyword', regex: /(?<![.:@$])\b(?:alias|and|begin|break|case|class|def|defined\?|do|else|elsif|end|ensure|for|if|in|module|next|not|or|redo|rescue|retry|return|super|then|undef|unless|until|when|while|yield|attr_(?:accessor|reader|writer)|extend|include|prepend|private|protected|public|raise|require(?:_relative)?)(?![\w?!])/g },
  { className: 'literal', regex: /(?<![.:@$])\b(?:nil|true|false|self|__(?:FILE|LINE)__)(?![\w?!])/g },
  { className: 'type', regex: /\b(?:class|module)\s+([A-Z]\w*)/g, group: 1 },
  { className: 'type', regex: /\b[A-Z][A-Z\d_]*[a-z]\w*/g },
  { className: 'function', regex: /\b[A-Za-z_]\w*[?!]?(?=\()/g },
  { className: 'property', regex: /(?<!\.)\.([A-Za-z_]\w*[?!]?)/g, group: 1 },
  { className: 'number', regex: /(?<![\w@$]|(?<!\.)\.)(?:0[xXbBoO][\da-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)r?i?(?!\w|\.\d)/g },
  { className: 'operator', regex: /<=>|===?|=~|!~|\*\*=?|&\.|\|\|=?|&&=?|->|=>|\.\.\.?|::|<<=?|>>=?|!=|[+\-*/%&^<>=]=?|(?<!\w)[!?~]/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const ruby = defineLanguage({
  name: 'ruby',
  aliases: ['rb'],
  tokenize: (code) => collectPatternRanges(code, patterns, scanRuby(code)),
})

const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' }

function scanRuby(code: string) {
  const ranges: Array<TokenRange> = []
  const lexical = /\$.|^=begin\b|[#'"`/]|%[qQwWiIrsx]?[^\w\s]|<<[~-]?(['"`]?)([A-Za-z_]\w*)\1/gm
  let lineEnd = 0
  let bodyEnd = 0
  let match: RegExpExecArray | null
  while ((match = lexical.exec(code))) {
    const token = match[0]
    const char = token[0]
    let from = match.index
    let end = lexical.lastIndex
    let className: 'comment' | 'meta' | 'string' = 'string'
    if (from > lineEnd && from < bodyEnd) {
      lexical.lastIndex = bodyEnd
      continue
    }
    if (char === '$') continue
    lexical.lastIndex = from + 1
    if (char === '#') {
      end = code.indexOf('\n', from)
      if (end < 0) end = code.length
      className = from || code[1] !== '!' ? 'comment' : 'meta'
    } else if (char === '=') {
      const close = /^=end\b.*/gm
      close.lastIndex = end
      end = close.exec(code) ? close.lastIndex : code.length
      className = 'comment'
    } else if (char === '<') {
      // Bare `<<ID` heredocs need an uppercase label so `arr <<item` stays a shift.
      const newline = code.indexOf('\n', end)
      if (isValue(code, from) || newline < 0 || /\w/.test(token[2]) && !/^[A-Z_]/.test(match[2])) continue
      const start = (bodyEnd > from ? bodyEnd : newline) + 1
      const close = new RegExp(`^[\\t ]*${match[2]}\\r?$`, 'gm')
      close.lastIndex = start
      bodyEnd = close.exec(code) ? close.lastIndex : code.length
      ranges.push({ start, end: bodyEnd, className })
      lineEnd = newline
    } else if (char === '/' || char === '%') {
      if (isValue(code, from)) continue
      const delimiter = token[token.length - 1]
      end = stringEnd(code, end, pairs[delimiter] || delimiter, pairs[delimiter] ? delimiter : '', !/[qwis]/.test(token[1] || ''), char === '/' ? 1 : 0)
      // `total /count * 100 / 2`: a regex that hugs its opener but ends in a space is division.
      if (end < 0 || char === '/' && end < code.length && code[from + 1] !== ' ' && code[end - 2] === ' ') continue
      if (char === '/' || token[1] === 'r') while (/[a-z]/.test(code[end] || '')) end++
    } else {
      end = stringEnd(code, end, char, '', char !== "'", 0)
      if (code[from - 1] === ':' && !/[\w:]/.test(code[from - 2] || '')) from--
    }
    ranges.push({ start: from, end, className })
    lexical.lastIndex = end
  }
  return ranges
}

function isValue(code: string, index: number) {
  let start = index
  while (code[start - 1] === ' ' || code[start - 1] === '\t') start--
  if (!/[\w)\]}"'`]/.test(code[start - 1] || '')) return false
  let word = start
  while (/\w/.test(code[word - 1] || '')) word--
  // `split /,/` and `puts %w[a]` are arguments; `a / b`, `x /= 2` and `w /2` are operators.
  return !(start < index && /^[A-Za-z_]/.test(code.slice(word, start)) && /[^\s=\d]/.test(code[index + 1] || ' '))
}

/**
 * Returns the index just past `close`, or -1 when a single-line regex hits a newline.
 * `open` (paired delimiters only) nests; `interpolate` enables `#{}`; `mode` 1 is a `/regex/`,
 * mode 2 is interpolated code where quotes open nested strings; `nest` caps interpolation depth.
 */
function stringEnd(code: string, index: number, close: string, open: string, interpolate: boolean, mode: number, nest = 0): number {
  let depth = 0
  while (index < code.length) {
    const char = code[index++]
    if (char === '\\') index++
    else if (mode === 1 && char === '\n') return -1
    else if (mode === 2 && /["'`]/.test(char)) index = stringEnd(code, index, char, '', char !== "'", 0, nest + 1)
    else if (mode === 2 && char === '/' && !isValue(code, index - 1)) index = Math.max(index, stringEnd(code, index, '/', '', true, 1, nest + 1))
    else if (interpolate && nest < 9 && char === '#' && code[index] === '{') index = stringEnd(code, index + 1, '}', '{', false, 2, nest)
    else if (char === open) depth++
    else if (char === close && !depth--) return index
  }
  return code.length
}
