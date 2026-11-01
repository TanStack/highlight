import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const json = defineLanguage({
  name: 'json',
  aliases: ['jsonc', 'json5'],
  tokenize: patternTokenizer([
    [/\/\/[^\n]*|\/\*[\s\S]*?\*\/|("(?:\\.|[^"\\])*")(?=\s*:)|"(?:\\.|[^"\\])*"/g, (match) => match[0].startsWith('//') || match[0].startsWith('/*')
        ? 'comment'
        : match[1]
            ? 'property'
            : 'string'],
    [/\b(?:false|null|true)\b/g, 'literal'],
    [/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, 'number'],
  ]),
})
