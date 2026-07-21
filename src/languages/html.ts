import { defineLanguage } from '../core.js'
import { collectMarkupRanges } from '../internal/markup.js'

export const html = defineLanguage({
  name: 'html',
  aliases: ['htm', 'xml', 'angular-html'],
  tokenize: (code, context) => collectMarkupRanges(code, context),
})
