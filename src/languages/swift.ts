import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'meta', regex: /^#!.*|#\w+/gm },
  { className: 'attr', regex: /@\w+/g },
  { className: 'variable', regex: /\$\w+/g },
  // Argument and parameter labels; the lookbehind keeps ternaries and switch cases plain.
  { className: 'property', regex: /\b(?=[a-z]\w*:)(?<=[(,]\s*(?:\w+[ \t]+)?)\w+/g },
  // Contextual words are keywords only before declarations, types, or as accessors.
  {
    className: 'keyword',
    regex: /(?<!`)\b(?:(?<!\.)(?:associatedtype|as|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|distributed|do|else|enum|extension|fallthrough|fileprivate|for|func|guard|if|import|in|indirect|inout|internal|is|let|mutating|nonisolated|nonmutating|operator|override|precedencegroup|private|protocol|public|repeat|rethrows|return|static|struct|subscript|switch|throw|throws|try|typealias|unowned|var|where|while|willSet)|init|self|Self|super)\b|(?<![\w.`])(?:(?:open|package|optional|dynamic|final|lazy|weak|required|prefix|infix|postfix|actor|macro|some|any|each|isolated|consuming|borrowing|sending)(?=[ \t]+(?:[a-z]{3}|[A-Z([]))|[gs]et(?=[ \t]*[{}]|[ \t]+[a-z]|\(\w+\)[ \t]*\{)|(?<=\()set(?=\)))/g,
  },
  { className: 'literal', regex: /(?<![.`])\b(?:true|false|nil)\b/g },
  { className: 'type', regex: /\b(?:class|struct|enum|protocol|extension|actor|typealias|associatedtype)\s+(\w+)/g, group: 1 },
  { className: 'type', regex: /\b[A-Z][A-Z\d_]*[a-z]\w*/g },
  { className: 'function', regex: /\b(?:func|macro)\s+(\w+)/g, group: 1 },
  { className: 'function', regex: /\b[a-z_]\w*(?=\()|(?<=^[ \t]*\.)[a-z_]\w*(?=[ \t]*\{)|(?<=\.)[a-z_]\w*(?=[ \t]*\{[ \t]*(?:!?[$[]|[\w, ]+ in\b))/gm },
  { className: 'number', regex: /(?<!\w|[^.]\.)(?:0[xob][\da-f_]+(?:(?:\.[\da-f_]+)?p[+-]?\d+)?|\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d[\d_]*)?)(?!\w|\.\d)/gi },
  { className: 'property', regex: /(?<!\.)\.([A-Za-z_]\w*)/g, group: 1 },
  { className: 'operator', regex: /\.\.[.<]|[-+*/%&|^~!<>=?]+/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

// `(?<!#)` keeps runs of `#` from being retried at every position.
const quote = /(?<!#)(#*)("(?:"")?)/y

export const swift = defineLanguage({
  name: 'swift',
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    // Comments; string openers (closed by stringEnd); `#/…/#` regexes, multi-line only when `#/` ends
    // the line and running to the line (or input) end when unterminated so retries stay linear;
    // bare `/re/` only where an operand is expected, never across lines.
    const lexical = /(\/\/.*|\/\*)|(?<!#)(?:(#*")|(#+)\/(?:\n[^]*?(?:\/\3|(?![^]))|.*?(?:\/\3|$)))|\/(?<=(?:[=(,:[{]|\b(?:return|case))[ \t]*\/)(?![\s/*])(?:\\.|[^\\\n/])+(?<!\s)\//gm
    let match: RegExpExecArray | null
    while ((match = lexical.exec(code))) {
      const comment = match[1]
      let end = lexical.lastIndex
      if (comment === '/*') {
        for (let depth = 1; depth && end < code.length;) {
          const step = code.startsWith('/*', end) ? 1 : code.startsWith('*/', end) ? -1 : 0
          depth += step
          end += step ? 2 : 1
        }
      } else if (match[2]) end = stringEnd(code, match.index)
      ranges.push({ start: match.index, end, className: comment ? 'comment' : 'string' })
      lexical.lastIndex = end
    }
    return collectPatternRanges(code, patterns, ranges)
  },
})

// Each frame is the text that closes it: an open string's delimiter, or the `)`s that still close
// a `\( )` hole, so quotes and parens inside holes nest.
function stringEnd(code: string, index: number) {
  const stack: Array<string> = []
  let open: RegExpExecArray | null
  do {
    const top = stack.at(-1) ?? ')'
    const hole = top[0] === ')'
    const char = code[index]
    quote.lastIndex = index
    if (hole && (open = quote.exec(code))) {
      stack.push(open[2] + open[1])
      index = quote.lastIndex
    } else if (char === '\n' && !(hole ? stack.at(-2)! : top).startsWith('"""')) {
      // A line break ends every single-line string, and the holes inside it, down to the nearest `"""`.
      while (stack.length && !stack.at(-1)!.startsWith('"""')) stack.pop()
      if (stack.length) index++
    } else if (hole) {
      if (char === '(') stack.push(stack.pop() + ')')
      else if (char === ')' && stack.pop()!.length > 1) stack.push(top.slice(1))
      index++
    } else if (code.startsWith(top, index)) {
      stack.pop()
      index += top.length
    } else {
      const hashes = top.replace(/"+/, '')
      if (char === '\\' && code.startsWith(hashes, index + 1)) {
        index += hashes.length + 1
        if (code[index] === '(') stack.push(')')
        if (code[index] !== '\n') index++
      } else index++
    }
  } while (stack.length && index < code.length)
  return Math.min(index, code.length)
}
