import { expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { php } from '../src/languages/php'

it('tokenizes a large valid PHP range batch without an argument-list limit', () => {
  const highlighter = createHighlighter({ languages: [php] })
  const code = '1 '.repeat(140_000)
  const result = highlighter.tokenize(code, { lang: 'php' })
  expect(result.tokens.map(token => token.value).join('')).toBe(code)
  expect(result.tokens.filter(token => token.className === 'number')).toHaveLength(140_000)
})

it('keeps absolute PHP coordinates and raw ordering across opening and closing tags', () => {
  const highlighter = createHighlighter({ languages: [php] })
  expect(highlighter.tokenize('<?php 1 2?>', { lang: 'php' }).tokens).toEqual([
    { value: '<?php', className: 'meta' },
    { value: ' ' },
    { value: '1', className: 'number' },
    { value: ' ' },
    { value: '2', className: 'number' },
    { value: '?>', className: 'meta' },
  ])
})
