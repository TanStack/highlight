import { defineLanguage, type HighlightTokenClass, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'meta', regex: /^#!(?!\s*\[).*/g },
  { className: 'attr', regex: /#!?\[\s*[A-Za-z_][\w:]*/g },
  { className: 'function', regex: /\bmacro_rules!|\b[A-Za-z_]\w*!(?=\s*[([{])/g },
  {
    className: 'keyword',
    regex: /\b(?<!r#)(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|static|struct|super|trait|type|unsafe|use|where|while|yield|union(?=\s+[A-Za-z_]))\b/g,
  },
  { className: 'literal', regex: /\b(?:true|false)\b/g },
  { className: 'type', regex: /\b(?:struct|enum|trait|type|union)\s+([A-Za-z_]\w*)/g, group: 1 },
  { className: 'type', regex: /\b(?:[iu](?:8|16|32|64|128|size)|f32|f64|bool|char|str|[A-Z][A-Z\d_]*[a-z]\w*)\b/g },
  { className: 'function', regex: /\bfn\s+([A-Za-z_]\w*)/g, group: 1 },
  { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\(|::<)/g },
  { className: 'variable', regex: /\$[A-Za-z_]\w*/g },
  {
    className: 'number',
    regex: /(?<!\w|(?<!\.)\.)(?:0x[\da-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.(?![.\w])|(?:\.\d[\d_]*)?(?:[eE][+-]?_*\d[\d_]*)?))(?:[iu](?:8|16|32|64|128|size)|f32|f64)?(?!\w)/g,
  },
  { className: 'property', regex: /(?<!\.)\.([A-Za-z_]\w*)/g, group: 1 },
  { className: 'operator', regex: /=>|->|::|\.\.[.=]?|<<=?|>>=?|&&|\|\||[+\-*/%&|^!<>=]=?|\?/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

const charLiteral = /'(?:\\(?:u\{[\da-fA-F_]*\}|x[\da-fA-F]{2}|[^\n])|[^\\'\n\r])'/uy
const lifetime = /'[A-Za-z_]\w*/y

export const rust = defineLanguage({
  name: 'rust',
  aliases: ['rs'],
  tokenize: (code) => collectPatternRanges(code, patterns, scanRust(code)),
})

function scanRust(code: string) {
  const ranges: Array<TokenRange> = []
  const lexical = /\/[/*]|(?<!\w)(?:[bc]?r(#*)"|[bc]?"|b?')|["']/g
  let match: RegExpExecArray | null
  while ((match = lexical.exec(code))) {
    const token = match[0]
    const start = match.index
    let end = code.length
    let className: HighlightTokenClass = 'comment'
    if (token === '//') {
      end = code.indexOf('\n', start)
      if (end < 0) end = code.length
    } else if (token === '/*') {
      // Block comments nest.
      const delimiter = /\/\*|\*\//g
      delimiter.lastIndex = start + 2
      let depth = 1
      let next: RegExpExecArray | null
      while (depth && (next = delimiter.exec(code))) depth += next[0] === '/*' ? 1 : -1
      if (!depth) end = delimiter.lastIndex
    } else if (token.endsWith("'")) {
      className = 'string'
      charLiteral.lastIndex = start + token.length - 1
      lifetime.lastIndex = start
      if (charLiteral.test(code)) end = charLiteral.lastIndex
      else if (token === "'" && lifetime.test(code)) {
        end = lifetime.lastIndex
        className = 'meta'
      } else continue
    } else {
      className = 'string'
      if (match[1] != null) {
        const close = code.indexOf(`"${match[1]}`, start + token.length)
        if (close >= 0) end = close + 1 + match[1].length
      } else {
        for (let index = start + token.length; index < code.length; index++) {
          if (code[index] === '\\') index++
          else if (code[index] === '"') {
            end = index + 1
            break
          }
        }
      }
    }
    ranges.push({ start, end, className })
    lexical.lastIndex = end
  }
  return ranges
}
