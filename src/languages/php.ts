import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges, offsetRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'variable', regex: /\$[A-Za-z_\x80-\uffff][\w\x80-\uffff]*/g },
  { className: 'attr', regex: /#\[\s*([\\A-Za-z_][\\\w]*)/g, group: 1 },
  { className: 'function', regex: /(?:\?->|->|::)\s*([A-Za-z_]\w*)(?=\s*\()/g, group: 1 },
  { className: 'property', regex: /(?:\?->|->|::)\s*([A-Za-z_][\w]*)/g, group: 1 },
  { className: 'keyword', regex: /\b(?:abstract|and|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|enum|eval|exit|extends|final|finally|fn|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|match|namespace|new|or|print|private|protected|public|readonly|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield|from)\b/gi },
  { className: 'literal', regex: /\b(?:true|false|null|__CLASS__|__DIR__|__FILE__|__FUNCTION__|__LINE__|__METHOD__|__NAMESPACE__|__TRAIT__)\b/gi },
  { className: 'type', regex: /\b(?:array|bool|float|int|iterable|mixed|never|object|parent|self|string|void)\b/gi },
  { className: 'type', regex: /\b(?:class|enum|interface|trait|new|extends|implements|instanceof)\s+([\\A-Za-z_][\\\w]*)/gi, group: 1 },
  { className: 'function', regex: /\b[A-Za-z_][\w]*(?=\s*\()/g },
  { className: 'number', regex: /(?:^|[^\w.])((?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[bB][01](?:_?[01])*|0[oO][0-7](?:_?[0-7])*|(?:\d(?:_?\d)*(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?))(?![\w.])/g, group: 1 },
  { className: 'operator', regex: /\?->|\?\?=?|<=>|===|!==|=>|->|::|\*\*=?|<<=?|>>=?|&&|\|\||\+\+|--|[+\-*/%.&|^!<>=]=?|[~?:@]/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const php = defineLanguage({
  name: 'php',
  tokenize(code, context) {
    const ranges: Array<TokenRange> = []
    const opening = /<\?(?:php(?=\s|$)|=)/gi
    let tag = opening.exec(code)
    let start = 0
    // Inputs with opening tags are documents; otherwise accept a PHP excerpt.
    while (start < code.length) {
      if (tag) {
        if (tag.index > start && context.hasLanguage('html')) {
          ranges.push(...offsetRanges(context.tokenize(code.slice(start, tag.index), 'html'), start))
        }
        start = tag.index + tag[0].length
        ranges.push({ start: tag.index, end: start, className: 'meta' })
      }
      const scanned = scanPhp(code, start)
      ranges.push(...offsetRanges(collectPatternRanges(
        code.slice(start, scanned.end),
        patterns,
        offsetRanges(scanned.ranges, -start),
      ), start))
      start = scanned.end
      if (start === code.length) break
      ranges.push({ start, end: start + 2, className: 'meta' })
      start += 2
      opening.lastIndex = start
      tag = opening.exec(code)
      if (!tag) {
        if (context.hasLanguage('html')) {
          ranges.push(...offsetRanges(context.tokenize(code.slice(start), 'html'), start))
        }
        break
      }
    }
    return ranges
  },
})

function scanPhp(code: string, start: number) {
  const ranges: Array<TokenRange> = []
  const lexical = /\/\*|\/\/|#(?!\[)|['"`]|<<<|\?>/g
  lexical.lastIndex = start
  let match: RegExpExecArray | null
  while ((match = lexical.exec(code))) {
    const token = match[0]
    const from = match.index
    if (token === '?>') return { end: from, ranges }
    let end: number
    let className: 'comment' | 'string' = 'string'
    if (token === '/*') {
      const close = code.indexOf('*/', lexical.lastIndex)
      end = close < 0 ? code.length : close + 2
      className = 'comment'
    } else if (token === '//' || token === '#') {
      end = lexical.lastIndex
      while (end < code.length && code[end] !== '\n' && !code.startsWith('?>', end)) end++
      className = 'comment'
    } else if (token === '<<<') {
      const header = /<<<[ \t]*(?:'([A-Za-z_\x80-\uffff][\w\x80-\uffff]*)'|"([A-Za-z_\x80-\uffff][\w\x80-\uffff]*)"|([A-Za-z_\x80-\uffff][\w\x80-\uffff]*))[ \t]*\r?\n/y
      header.lastIndex = from
      const heredoc = header.exec(code)
      if (!heredoc) continue
      const label = heredoc[1] || heredoc[2] || heredoc[3]
      const closing = new RegExp(`^[\\t ]*${label}(?![\\w\\x80-\\uffff])`, 'gm')
      closing.lastIndex = header.lastIndex
      const close = closing.exec(code)
      end = close ? close.index + close[0].length : code.length
    } else {
      end = stringEnd(code, from, token)
    }
    ranges.push({ start: from, end, className })
    lexical.lastIndex = end
  }
  return { end: code.length, ranges }
}

function stringEnd(code: string, start: number, quote: string): number {
  let index = start + 1
  let depth = 0
  while (index < code.length) {
    const char = code[index]
    if (char === '\\') {
      index += 2
      continue
    }
    if (quote !== "'" && (char === '{' && (depth > 0 || code[index + 1] === '$') || char === '$' && code[index + 1] === '{')) {
      depth++
      index += char === '$' ? 2 : 1
      continue
    }
    if (depth) {
      if (char === '"' || char === "'") {
        // Quoted keys inside interpolation belong to this string.
        const keyQuote = char
        index++
        while (index < code.length) {
          if (code[index] === '\\') index += 2
          else if (code[index++] === keyQuote) break
        }
        continue
      }
      if (char === '}') depth--
    } else if (char === quote) return index + 1
    index++
  }
  return code.length
}
