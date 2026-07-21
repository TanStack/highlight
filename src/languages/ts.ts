import { defineLanguage } from '../core.js'
import { collectScriptRanges } from '../internal/script.js'

export const ts = defineLanguage({
  name: 'ts',
  aliases: ['typescript', 'angular-ts'],
  tokenize: (code) => collectScriptRanges(code),
})
