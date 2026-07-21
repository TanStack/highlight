import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const env = defineLanguage({
  name: 'env',
  aliases: ['dotenv'],
  tokenize: patternTokenizer([
    { className: 'comment', regex: /^\s*#.*$/gm },
    { className: 'property', regex: /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)(?=\s*=)/gm, group: 1 },
    { className: 'string', regex: /=\s*(.*)$/gm, group: 1 },
  ]),
})
