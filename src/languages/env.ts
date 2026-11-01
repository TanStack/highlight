import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const env = defineLanguage({
  name: 'env',
  aliases: ['dotenv'],
  tokenize: patternTokenizer([
    [/^\s*#.*$/gm, 'comment'],
    [/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)(?=\s*=)/gm, 'property', 1],
    [/=\s*(.*)$/gm, 'string', 1],
  ]),
})
