import { defineLanguage } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'

export const python = defineLanguage({
  name: 'python',
  aliases: ['py'],
  tokenize(code) {
    return collectPatternRanges(code, [
      {
        className: (match) =>
          match[0].startsWith('#') ? 'comment' : 'string',
        regex:
          /#[^\n]*|(?:br|rb|fr|rf|[rubf])?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/gi,
      },
      {
        className: 'keyword',
        regex:
          /\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g,
      },
      { className: 'literal', regex: /\b(?:False|None|True|NotImplemented|Ellipsis)\b/g },
      { className: 'function', regex: /@[A-Za-z_][\w.]*/g },
      { className: 'function', regex: /\bdef\s+([A-Za-z_]\w*)/g, group: 1 },
      { className: 'type', regex: /\b(?:bool|bytes|dict|float|frozenset|int|list|object|set|str|tuple|type)\b/g },
      { className: 'number', regex: /\b(?:0x[\da-f_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d[\d_]*)?j?)\b/gi },
    ])
  },
})
