import { defineLanguage, type TokenRange } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const swift = defineLanguage({
  name: 'swift',
  tokenize: patternTokenizer([
    { collect: collectSwiftLexicalRanges },
    { className: 'meta', regex: /#(?:if|elseif|else|endif|available|unavailable|selector|keyPath|sourceLocation|warning|error|fileID|filePath|file|line|column|function)\b/g },
    { className: 'attr', regex: /@[A-Za-z_]\w*/g },
    { className: 'variable', regex: /\$(?:\d+|[A-Za-z_]\w*)/g },
    { className: 'literal', regex: /\b(?:true|false|nil)\b/g },
    { className: 'keyword', regex: /\b(?:actor|any|as|associatedtype|async|await|borrowing|break|case|catch|class|consuming|continue|convenience|copy|default|defer|deinit|didSet|distributed|do|dynamic|each|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|if|import|indirect|infix|init|inout|internal|in|is|isolated|lazy|let|mutating|nonisolated|nonmutating|open|operator|optional|override|package|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|var|weak|where|while|willSet)\b/g },
    { className: 'type', regex: /\b(?:actor|class|enum|protocol|struct|typealias)\s+([\p{L}_][\p{L}\p{N}_]*)/gu, group: 1 },
    { className: 'type', regex: /\b(?:Any|AnyObject|Array|Bool|Character|Dictionary|Double|Float|Int(?:8|16|32|64)?|Never|Optional|Result|Self|Set|String|UInt(?:8|16|32|64)?|Void)\b/g },
    { className: 'function', regex: /[\p{L}_][\p{L}\p{N}_]*(?=\s*\()/gu },
    { className: 'number', regex: /(?:(?<![\w.])|(?<=\.\.))(?:0[xX][\da-fA-F_]+(?:\.[\da-fA-F_]+)?[pP][+-]?[\d_]+|0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.(?!\.)[\d_]+)?(?:[eE][+-]?[\d_]+)?)(?!\w)/g },
    { className: 'property', regex: /\.([\p{L}_][\p{L}\p{N}_]*)/gu, group: 1 },
    { className: 'operator', regex: /\.{3}|\.\.<|->|[+\-*/%=!<>?&|^~]+/g },
  ]),
})

function collectSwiftLexicalRanges(code: string) {
  const ranges: Array<TokenRange> = []
  for (let index = 0; index < code.length;) {
    const start = index
    let end = index
    let className: TokenRange['className'] = 'string'
    if (code.startsWith('//', index)) {
      end = index + 2
      while (end < code.length && !/[\r\n]/.test(code[end])) end++
      className = 'comment'
    } else if (code.startsWith('/*', index)) {
      end = commentEnd(code, index)
      className = 'comment'
    } else if (code[index] === '`') {
      const close = code.indexOf('`', index + 1)
      end = close < 0 ? code.length : close + 1
      // Shield raw identifiers from keyword and literal patterns.
      className = 'variable'
    } else {
      end = stringEnd(code, index)
    }
    // A negative end skips a rejected raw delimiter without emitting a token.
    if (end < 0) { index = -end; continue }
    if (end > start) {
      ranges.push({ start, end, className })
      index = end
    } else index++
  }
  return ranges
}

function commentEnd(code: string, start: number) {
  let depth = 1
  let index = start + 2
  while (index < code.length && depth) {
    if (code.startsWith('/*', index)) { depth++; index += 2 }
    else if (code.startsWith('*/', index)) { depth--; index += 2 }
    else index++
  }
  return index
}

function stringEnd(code: string, start: number, depth = 0): number {
  let index = start
  while (code[index] === '#') index++
  const hashes = code.slice(start, index)
  const regex = Boolean(hashes) && code[index] === '/'
  if (code[index] !== '"' && !regex) return hashes ? -index : start
  const quote = regex ? '/' : code.startsWith('"""', index) ? '"""' : '"'
  index += quote.length
  const close = quote + hashes
  const escape = regex ? '\\' : '\\' + hashes
  while (index < code.length) {
    if (code.startsWith(close, index)) return index + close.length
    if (code.startsWith(escape, index)) {
      index += escape.length
      if (!regex && code[index] === '(' && depth < 24) {
        let balance = 1
        index++
        while (index < code.length && balance) {
          const nested = code.startsWith('/*', index) ? commentEnd(code, index) : stringEnd(code, index, depth + 1)
          if (nested < 0) index = -nested
          else if (nested > index) index = nested
          else if (code.startsWith('//', index)) {
            while (index < code.length && !/[\r\n]/.test(code[index])) index++
          } else {
            if (code[index] === '(') balance++
            if (code[index] === ')') balance--
            index++
          }
        }
      } else index++
    } else index++
  }
  return code.length
}
