import { defineLanguage } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'
import type { Pattern } from '../internal/patterns.js'

const lexical: Array<Pattern> = [
  {
    className: (match) => match[0].startsWith('/') ? 'comment' : 'string',
    regex: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"""(?:\\[\s\S]|[^\\])*?(?:"""|\\?$)|"(?:\\.|[^"\\\n])*\\?"?|'(?:\\.[^'\n]{0,5}|[^'\\\n])'/g,
  },
]

const patterns: Array<Pattern> = [
  {
    className: (match) => match[0] === '@interface' ? 'keyword' : 'attr',
    regex: /@[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/g,
  },
  {
    className: 'keyword',
    regex: /\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|non-sealed|package|permits|private|protected|public|return|sealed|static|strictfp|super|switch|synchronized|this|throws?|transient|try|volatile|while)\b|\b(?:record|var|yield)\b(?=[ \t]+[\w"'(!-])|^[ \t]*(?:(?:open[ \t]+)?module|requires(?:[ \t]+transitive)?|exports|opens|uses|provides)\b(?=[ \t]+[A-Za-z_])/gm,
  },
  { className: 'literal', regex: /\b(?:true|false|null)\b/g },
  { className: 'type', regex: /\b(?:boolean|byte|char|double|float|int|long|short|void)\b/g },
  { className: 'type', regex: /(?<!\.)\b(?:class|interface|enum|record)\s+([A-Za-z_]\w*)/g, group: 1 },
  { className: 'type', regex: /\b[A-Z][A-Z\d_]*[a-z]\w*/g },
  {
    className: 'number',
    regex: /(?:^|[^\w.])((?:0[xX][\da-fA-F_]*(?:\.[\da-fA-F_]*)?(?:[pP][+-]?\d[\d_]*)?|0[bB][01_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)[lLfFdD]?)(?![\w.])/g,
    group: 1,
  },
  { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g },
  { className: 'function', regex: /::\s*([A-Za-z_]\w*)/g, group: 1 },
  { className: 'property', regex: /(?<!\.)\.\s*([A-Za-z_]\w*)/g, group: 1 },
  { className: 'operator', regex: />>>=?|->|::|<<=?|>>=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g },
]

export const java = defineLanguage({
  name: 'java',
  tokenize(code) {
    const occupied = new Uint8Array(code.length)
    const ranges = collectPatternRanges(code, lexical, [], occupied)
    // Leave package/import paths plain instead of colouring each segment as a property.
    for (const match of code.matchAll(/^([ \t]*(?:package|import)[ \t]+(?:static[ \t]+)?)[\w.*]+/gm)) {
      const start = match.index + match[1].length
      if (!occupied[match.index]) occupied.fill(1, start, match.index + match[0].length)
    }
    return collectPatternRanges(code, patterns, ranges, occupied)
  },
})
