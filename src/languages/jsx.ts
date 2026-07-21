import { defineLanguage } from '../core.js'
import { collectScriptRanges } from '../internal/script.js'

export const jsx = defineLanguage({
  name: 'jsx',
  tokenize: (code) => collectScriptRanges(code, true),
})
