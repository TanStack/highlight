import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const diff = defineLanguage({
  name: 'diff',
  aliases: ['patch'],
  tokenize: patternTokenizer([
    [/^(?:@@|diff |index |--- |\+\+\+ ).*$/gm, 'meta'],
    [/^-.*$/gm, 'deleted'],
    [/^\+.*$/gm, 'inserted'],
  ]),
})
