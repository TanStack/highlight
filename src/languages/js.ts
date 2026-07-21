import { defineLanguage } from '../core.js'
import { collectScriptRanges } from '../internal/script.js'

export const js = defineLanguage({
  name: 'js',
  aliases: ['javascript', 'mjs', 'cjs', 'js-vue'],
  tokenize: (code) => collectScriptRanges(code),
})
