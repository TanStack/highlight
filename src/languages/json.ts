import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const json = defineLanguage({
  name: 'json',
  aliases: ['jsonc', 'json5'],
  tokenize: patternTokenizer([
    {
      className: (match) =>
        match[0].startsWith('//') || match[0].startsWith('/*')
          ? 'comment'
          : match[1]
            ? 'property'
            : 'string',
      regex:
        /\/\/[^\n]*|\/\*[\s\S]*?\*\/|("(?:\\.|[^"\\])*")(?=\s*:)|"(?:\\.|[^"\\])*"/g,
    },
    { className: 'literal', regex: /\b(?:false|null|true)\b/g },
    { className: 'number', regex: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi },
  ]),
})
