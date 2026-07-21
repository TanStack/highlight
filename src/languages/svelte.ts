import { defineLanguage } from '../core.js'
import { collectMarkupRanges } from '../internal/markup.js'

export const svelte = defineLanguage({
  name: 'svelte',
  tokenize: (code, context) => collectMarkupRanges(code, context, 'svelte'),
})
