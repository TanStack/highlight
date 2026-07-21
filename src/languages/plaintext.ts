import { defineLanguage } from '../core.js'

export const plaintext = defineLanguage({
  name: 'plaintext',
  aliases: ['text', 'txt', '-->'],
  tokenize: () => [],
})
