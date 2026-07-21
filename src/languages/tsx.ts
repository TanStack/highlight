import { defineLanguage } from '../core.js'
import { collectScriptRanges } from '../internal/script.js'

export const tsx = defineLanguage({
  name: 'tsx',
  tokenize: (code) => collectScriptRanges(code, true),
})
