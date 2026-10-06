import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  { className: 'attr', regex: /(?<![\w@])@(?:[a-z]+:)?[A-Za-z_][\w.]*/g },
  {
    className: 'keyword',
    regex: /(?<!\.)(?:\bas\?|!(?:in|is)\b|\b(?:abstract|as|break|by|catch|class|companion|const|constructor|continue|crossinline|do|else|external|final|finally|for|fun|if|import|in|infix|init|inline|interface|internal|is|lateinit|noinline|object|operator|override|package|private|protected|public|reified|return|sealed|super|suspend|tailrec|this|throw|try|typealias|val|var|vararg|when|where|while)\b)/g,
  },
  { className: 'keyword', regex: /(?<!\.)\b(?:data|value|enum|annotation|inner|open|expect|actual)(?=[ \t]+(?:[a-z]+[ \t]+){0,3}(?:class|fun|val|var|interface|object|constructor)\b)|(?<![\w.])(?:get(?=\(\)\s*[:={])|set(?=\(\w+\)\s*[:={]))|(?<=\b(?:private|protected|internal)[ \t]+)set\b|\bout(?=\s+[A-Z])/g },
  { className: 'literal', regex: /\b(?:true|false|null)\b/g },
  { className: 'type', regex: /\b(?:class|interface|object|typealias)\s+(\w+)/g, group: 1 },
  { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()|\b[a-z_]\w*(?=(?:<[\w.?*, ]*(?:<[\w.?*, ]*>[\w.?*, ]*)?>)?[ \t]*[({])|(?<=^[ \t]*|[{=][ \t]*)[A-Z][A-Z\d_]*[a-z]\w*(?=[ \t]*\{)/gm },
  { className: 'type', regex: /\b[A-Z][A-Z\d_]*[a-z]\w*/g },
  { className: 'number', regex: /(?<!\w|[^.]\.)(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)(?:[fF]|L|[uU]L?)?(?!\w|\.\d)/g },
  { className: 'property', regex: /\.\s*([A-Za-z_]\w*)/g, group: 1 },
  { className: 'operator', regex: /===|!==|\?[.:]|!!|\.\.<?|->|::|&&|\|\||\+\+|--|[+\-*/%!<>=]=?/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const kotlin = defineLanguage({
  name: 'kotlin',
  aliases: ['kt', 'kts'],
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const occupied = new Uint8Array(code.length)
    const lexical = /\/\/.*|\/\*|"""|"|'(?:\\(?:u[\da-fA-F]{4}|.)|[^'\\\n])'|`[^`\n]+`(\s*\()?/g
    let match: RegExpExecArray | null
    while ((match = lexical.exec(code))) {
      const token = match[0]
      let from = match.index
      let end = lexical.lastIndex
      let className: TokenRange['className'] = token[0] === '/' ? 'comment' : 'string'
      if (token === '/*') {
        const nested = /\/\*|\*\//g
        nested.lastIndex = end
        for (let depth = 1; depth && (match = nested.exec(code));) depth += match[0] === '/*' ? 1 : -1
        end = match ? nested.lastIndex : code.length
      } else if (token[0] === '`') {
        if (!match[1]) {
          occupied.fill(1, from, end)
          continue
        }
        end = from + token.lastIndexOf('`') + 1
        className = 'function'
      } else if (token[0] === '"') {
        while (code[from - 1] === '$') from--
        end = stringEnd(code, end, token.length > 1)
      }
      ranges.push({ start: from, end, className })
      lexical.lastIndex = end
    }
    for (const path of code.matchAll(/^[ \t]*(?:package|import)[ \t]+([\w.*`]+)/gm)) {
      occupied.fill(1, path.index + path[0].length - path[1].length, path.index + path[0].length)
    }
    return collectPatternRanges(code, patterns, ranges, occupied)
  },
})

// Stack of open strings (raw flag) and `${` templates (brace depth), so nested quotes stay inside.
function stringEnd(code: string, index: number, raw: boolean) {
  const stack: Array<boolean | number> = [raw]
  while (index < code.length) {
    const top = stack[stack.length - 1]
    const char = code[index++]
    if (typeof top === 'number') {
      if (char === '"') {
        const nested = code.startsWith('""', index)
        stack.push(nested)
        if (nested) index += 2
      } else if (char === "'") index = code.indexOf("'", index + (code[index] === '\\' ? 2 : 1)) + 1 || code.length
      else if (char === '{') stack[stack.length - 1] = top + 1
      else if (char === '}') {
        if (top) stack[stack.length - 1] = top - 1
        else stack.pop()
      }
    } else if (char === '"' && (!top || code.startsWith('""', index)) || char === '\n' && !top) {
      if (char === '\n') index--
      else if (top) while (code[index] === '"') index++
      stack.pop()
      if (!stack.length) return index
    } else if (char === '\\' && !top) index++
    else if (char === '$' && code[index] === '{') {
      stack.push(0)
      index++
    }
  }
  return code.length
}
