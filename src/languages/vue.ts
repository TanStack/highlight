import { defineLanguage } from '../core.js'
import { collectMarkupRanges } from '../internal/markup.js'

export const vue = defineLanguage({
  name: 'vue',
  tokenize: (code, context) => collectMarkupRanges(code, context, 'vue'),
})
