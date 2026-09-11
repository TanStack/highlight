import { defineLanguage, type TokenRange } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const cmake = defineLanguage({
  name: 'cmake',
  tokenize: patternTokenizer([
    { collect: collectLexicalRanges },
    { className: 'keyword', regex: /\b(?:if|elseif|else|endif|foreach|endforeach|while|endwhile|function|endfunction|macro|endmacro|block|endblock|return|break|continue)(?=\s*\()/gi },
    { className: 'command', regex: /\b[A-Za-z_]\w*(?=\s*\()/g },
    { className: 'literal', regex: /\b(?:ON|OFF|TRUE|FALSE|YES|NO|Y|N|IGNORE|NOTFOUND)\b/g },
    { className: 'number', regex: /\b\d+(?:\.\d+)*\b/g },
  ]),
})

function collectLexicalRanges(code: string) {
  const ranges: Array<TokenRange> = []
  const open = /#?\[(=*)\[|#|"|\$(?:(?:ENV|CACHE)?\{|<)|\\[\s\S]/g
  let match: RegExpExecArray | null
  while ((match = open.exec(code))) {
    const start = match.index
    if (match[0].startsWith('\\')) continue
    let end: number
    if (match[0][0] === '$') {
      const brace = match[0].endsWith('{')
      let depth = 1
      end = open.lastIndex
      while (end < code.length && depth) {
        if (brace ? code[end] === '{' : code[end] === '<' && code[end - 1] === '$') depth++
        else if (code[end] === (brace ? '}' : '>')) depth--
        end++
      }
    } else if (match[1] !== undefined) {
      const delimiter = `]${match[1]}]`
      const close = code.indexOf(delimiter, open.lastIndex)
      end = close < 0 ? code.length : close + delimiter.length
    } else if (match[0] === '#') {
      const newline = code.indexOf('\n', start)
      end = newline < 0 ? code.length : newline
    } else {
      end = start + 1
      while (end < code.length) {
        if (code[end] === '\\') end += 2
        else if (code[end++] === '"') break
      }
      end = Math.min(end, code.length)
    }
    ranges.push({ start, end, className: match[0][0] === '#' ? 'comment' : match[0][0] === '$' ? 'variable' : 'string' })
    open.lastIndex = end
  }
  return ranges
}
