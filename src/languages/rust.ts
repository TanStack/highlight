import { blockCommentEnd } from '../internal/nested-comment.js'
import { defineLanguage, type HighlightTokenClass, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  [/^#!(?!\s*\[).*/g, 'meta'],
  [/#!?\[\s*[A-Za-z_][\w:]*/g, 'attr'],
  [/\bmacro_rules!|\b[A-Za-z_]\w*!(?=\s*[([{])/g, 'function'],
  [/\b(?<!r#)(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|static|struct|super|trait|type|unsafe|use|where|while|yield|union(?=\s+[A-Za-z_]))\b/g, 'keyword'],
  [/\b(?:true|false)\b/g, 'literal'],
  [/\b(?:struct|enum|trait|type|union)\s+([A-Za-z_]\w*)/g, 'type', 1],
  [/\b(?:[iu](?:8|16|32|64|128|size)|f32|f64|bool|char|str|[A-Z][A-Z\d_]*[a-z]\w*)\b/g, 'type'],
  [/\bfn\s+([A-Za-z_]\w*)/g, 'function', 1],
  [/\b[A-Za-z_]\w*(?=\s*\(|::<)/g, 'function'],
  [/\$[A-Za-z_]\w*/g, 'variable'],
  [/(?<!\w|(?<!\.)\.)(?:0x[\da-fA-F_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.(?![.\w])|(?:\.\d[\d_]*)?(?:[eE][+-]?_*\d[\d_]*)?))(?:[iu](?:8|16|32|64|128|size)|f32|f64)?(?!\w)/g, 'number'],
  [/(?<!\.)\.([A-Za-z_]\w*)/g, 'property', 1],
  [/=>|->|::|\.\.[.=]?|<<=?|>>=?|&&|\|\||[+\-*/%&|^!<>=]=?|\?/g, 'operator'],
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
      end = blockCommentEnd(code, start + 2)
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
