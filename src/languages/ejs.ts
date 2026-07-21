import { defineLanguage } from '../core.js'
import { collectMarkupRanges } from '../internal/markup.js'

export const ejs = defineLanguage({
  name: 'ejs',
  tokenize: (code, context) => collectMarkupRanges(code, context, 'ejs'),
})
