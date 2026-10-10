import { defineLanguage, type TokenRange } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

const patterns = [
  {
    className: 'attr',
    regex: /(?:^[ \t]*|[(,] *)\[[ \t]*(?:[a-z]+: *)?([A-Z]\w*)(?=[ \t]*[\](,])/gm,
    group: 1,
  },
  {
    className: 'keyword',
    regex: /(?<!@)\b(?:abstract|and|as|ascending|await|base|break|case|catch|checked|class|const|continue|default|delegate|descending|do|else|enum|event|explicit|extern|finally|fixed|for|foreach|global|goto|if|implicit|in|interface|internal|is|lock|managed|nameof|namespace|new|not|notnull|operator|or|orderby|out|override|params|private|protected|public|readonly|ref|return|sealed|sizeof|stackalloc|static|struct|switch|this|throw|try|typeof|unchecked|unmanaged|unsafe|using|var|virtual|volatile|when|where|while|with|yield)\b/g,
  },
  { className: 'keyword', regex: /\b(?:get|set|init|add|remove)\b(?=\s*(?:[;{]|=>))/g },
  // Contextual words are keywords only when another word follows, as in `record Person` or `select u`.
  {
    className: 'keyword',
    regex: /\b(?:async|by|equals|file|from|group|into|join|let|on|partial|record|required|scoped|select)\b(?=\s+(?!(?:in|is|as)\b)[\w@(])/g,
  },
  { className: 'literal', regex: /\b(?:true|false|null)\b/g },
  {
    className: 'type',
    regex: /\b(?:bool|byte|char|decimal|double|dynamic|float|int|long|nint|nuint|object|sbyte|short|string|uint|ulong|ushort|void)\b/g,
  },
  { className: 'type', regex: /\b(?:class|struct|interface|enum|record(?:\s+struct)?|new|using(?:\s+static)?|namespace)\s+([A-Za-z_][\w.]*)/g, group: 1 },
  { className: 'type', regex: /\busing\s+\w+\s*=\s*([A-Za-z_][\w.]*)/g, group: 1 },
  { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\(|<(?:[\w\s,.?[\]]|<[\w\s,.?[\]]{0,40}>){0,40}>\s*\()/g },
  { className: 'property', regex: /(?<!\.)\.[ \t]*([A-Za-z_]\w*)/g, group: 1 },
  {
    className: (match) => match[1] ? 'property' : 'type',
    regex: /\b[A-Z][A-Z\d_]*[a-z]\w*(?=(\s*(?:=[^=>]|\{\s*(?:get|set|init)\b)|(?<=[{,(]\s*\w+)\s*:[^:]|(?<=[\w>?\]] +\w+)\s*=>)?)/g,
  },
  {
    className: 'number',
    regex: /(?:^|\.\.|[^\w.])((?:0[xX][\da-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*(?:\.\d[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)(?:[uUlL]{1,2}|[fFdDmM])?)(?!\w|\.\d)/g,
    group: 1,
  },
  { className: 'operator', regex: /=>|\?\?=?|\?\.|::|\.\.|->|<<=?|>>>?=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g },
] satisfies Parameters<typeof collectPatternRanges>[1]

export const csharp = defineLanguage({
  name: 'csharp',
  aliases: ['c#', 'cs'],
  tokenize: (code) => collectPatternRanges(code, patterns, scanCsharp(code)),
})

function scanCsharp(code: string) {
  const ranges: Array<TokenRange> = []
  const lexical = /\/\/|\/\*|['"]|^[ \t]*#/gm
  let end = 0
  let match: RegExpExecArray | null
  while ((match = lexical.exec(code))) {
    const token = match[0]
    let start = match.index
    let className: 'comment' | 'meta' | 'string' = 'comment'
    if (token === '/*') {
      const close = code.indexOf('*/', start + 2)
      end = close < 0 ? code.length : close + 2
    } else if (token === '//') {
      end = lineEnd(code, start)
    } else if (token === "'") {
      const close = charEnd(code, start)
      if (!close) continue
      end = close
      className = 'string'
    } else if (token === '"') {
      start = prefixStart(code, start, end)
      end = stringEnd(code, start, match.index, 0)
      className = 'string'
    } else {
      start += token.length - 1
      end = lineEnd(code, start)
      className = 'meta'
    }
    ranges.push({ start, end, className })
    lexical.lastIndex = end
  }
  return ranges
}

function lineEnd(code: string, start: number) {
  const index = code.indexOf('\n', start)
  return index < 0 ? code.length : index
}

function prefixStart(code: string, index: number, min: number) {
  while (index > min && (code[index - 1] === '$' || code[index - 1] === '@')) index--
  return index
}

function charEnd(code: string, start: number) {
  for (let index = start + 1; index < code.length && index < start + 12; index++) {
    if (code[index] === '\\') index++
    else if (code[index] === '\n') return 0
    else if (code[index] === "'") return index + 1
  }
  return 0
}

function stringEnd(code: string, start: number, quote: number, level: number): number {
  if (level > 16) return code.length
  const prefix = code.slice(start, quote)
  const verbatim = prefix.includes('@')
  const interpolated = prefix.includes('$')
  let index = quote
  while (code[index] === '"') index++
  const count = index - quote
  if (count === 2) return index
  if (count > 2 && !verbatim) {
    // Raw strings close on the same number of quotes; holes rarely contain that many.
    const close = code.indexOf('"'.repeat(count), index)
    return close < 0 ? code.length : close + count
  }
  index = quote + 1
  let depth = 0
  while (index < code.length) {
    const char = code[index]
    if (char === '\n' && !verbatim) return index
    if (depth) {
      if (char === "'") {
        index = charEnd(code, index) || index + 1
        continue
      }
      if (char === '"') {
        index = stringEnd(code, prefixStart(code, index, 0), index, level + 1)
        continue
      }
      if (char === '{') depth++
      else if (char === '}') depth--
    } else if (char === '\\' && !verbatim) {
      index++
    } else if (char === '"') {
      if (!verbatim || code[index + 1] !== '"') return index + 1
      index++
    } else if (char === '{' && interpolated) {
      if (code[index + 1] === '{') index++
      else depth = 1
    }
    index++
  }
  return code.length
}
