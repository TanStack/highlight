import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const diff = defineLanguage({
  name: 'diff',
  aliases: ['patch'],
  tokenize: patternTokenizer([
    { className: 'meta', regex: /^(?:@@|diff |index |--- |\+\+\+ ).*$/gm },
    { className: 'deleted', regex: /^-.*$/gm },
    { className: 'inserted', regex: /^\+.*$/gm },
  ]),
})
