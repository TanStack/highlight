import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'attr', regex: /@[A-Za-z_$][\w$]*/g },
  // Named-argument and record labels; the lookbehind keeps ternaries plain.
  { className: 'property', regex: /(?<![\w$])(?=[a-z_$])(?<=[(,{]\s*)(?!default:)[\w$]+(?=:)/g },
  { className: 'keyword', regex: /(?<![\w$.])(?:(?:async|sync|yield)\*|abstract|as|assert|async|await|break|case|catch|class|const|continue|default|do|else|enum|export|extends|final|finally|for|if|implements|import|in|is|new|operator|rethrow|return|static|super|switch|this|throw|try|typedef|var|while|with|yield)(?![\w$])/g },
  // Built-in and contextual words are keywords only when another word, string or `(` follows.
  { className: 'keyword', regex: /(?<![\w$.])(?:base|covariant|deferred|extension|external|factory|get|hide|interface|late|library|mixin|on|part|required|sealed|set|show|when)(?=\s+(?!i[ns]\b)[\w$'"(])/g },
  { className: 'literal', regex: /(?<![\w$.])(?:true|false|null)(?![\w$])/g },
  { className: 'type', regex: /\b(?:class|enum|mixin|extension(?:\s+type)?|typedef)\s+([A-Za-z_$][\w$]*)/g, group: 1 },
  { className: 'type', regex: /(?<![\w$])(?:int|double|num|bool|void|dynamic|[_$]*[A-Z][A-Z\d_$]*[a-z][\w$]*)(?![\w$])/g },
  { className: 'function', regex: /(?<![\w$])[A-Za-z_$][\w$]*(?=\s*\()/g },
  { className: 'property', regex: /(?<!\.\.)\.\s*([A-Za-z_$][\w$]*)/g, group: 1 },
  { className: 'number', regex: /(?:^|[^\w$.])(0[xX][\da-fA-F_]*|(?:\d[\d_]*(?:\.\d[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)(?![\w$]|\.\d)/g, group: 1 },
  { className: 'operator', regex: /\?\?=?|\?\.\.?|\.\.\.?\??|=>|~\/=?|<<=?|>>>?=?|&&|\|\||\+\+|--|[+\-*/%&|^!<>=]=?|[~?:]/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const dart = defineLanguage({
  name: 'dart',
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const lexical = /\/\/.*|\/\*|(?:(?<![\w$])r)?['"]/g
    let match: RegExpExecArray | null
    while ((match = lexical.exec(code))) {
      const comment = match[0][0] === '/'
      let end = lexical.lastIndex
      if (match[0] === '/*') {
        for (let depth = 1; depth && end < code.length; end++) {
          const step = code.startsWith('/*', end) ? 1 : code.startsWith('*/', end) ? -1 : 0
          depth += step
          if (step) end++
        }
      } else if (!comment) end = stringEnd(code, end - 1, match[0][0] === 'r')
      ranges.push({ start: match.index, end, className: comment ? 'comment' : 'string' })
      lexical.lastIndex = end
    }
    return collectPatternRanges(code, patterns, ranges)
  },
})

// Open quotes and `${` brace depths live on an explicit stack so deep nesting cannot overflow.
// Raw strings cannot hold holes, so `raw` only ever describes the innermost open string.
function stringEnd(code: string, index: number, raw: boolean): number {
  const stack: Array<string | number> = []
  let open = true
  while (index < code.length) {
    const char = code[index]!
    if (open) {
      const quote = code.startsWith(char.repeat(3), index) ? char.repeat(3) : char
      stack.push(quote)
      index += quote.length
      open = false
      continue
    }
    const top = stack[stack.length - 1]
    if (top === undefined) break
    if (typeof top === 'number') {
      if (char === '"' || char === "'") {
        open = true
        raw = code[index - 1] === 'r'
        continue
      }
      if (char === '}' && !top) stack.pop()
      else if (char === '{' || char === '}') stack[stack.length - 1] = top + (char === '{' ? 1 : -1)
      index++
    } else if (code.startsWith(top, index) || (char === '\n' && top.length < 3)) {
      if (char !== '\n') index += top.length
      stack.pop()
      raw = false
    } else if (raw) index++
    else if (char === '\\') index += 2
    else if (char === '$' && code[index + 1] === '{') {
      stack.push(0)
      index += 2
    } else index++
  }
  return Math.min(index, code.length)
}
