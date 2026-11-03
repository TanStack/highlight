import { expect, it } from 'vitest'
import { markdown } from '../src/languages/markdown'

it('appends large fenced code results without an argument limit', () => {
  const length = 140_000
  const code = '```js\n' + 'x'.repeat(length) + '\n```'
  const ranges = markdown.tokenize(code, {
    hasLanguage: (lang) => lang === 'js',
    tokenize: () => Array.from({ length: length - 1 }, (_, index) => {
      const start = index < 70_000 ? index : index + 1
      return { start, end: start + 1, className: 'keyword' as const }
    }),
  })

  expect(ranges).toHaveLength(length + 3)
  expect(ranges[1]).toEqual({ start: 6, end: 7, className: 'keyword' })
  expect(ranges[70_001]).toEqual({
    start: 70_006,
    end: 70_007,
    className: 'code-inline',
  })
  expect(ranges[length]).toEqual({
    start: length + 5,
    end: length + 6,
    className: 'keyword',
  })
  expect(ranges[length + 1]).toEqual({
    start: length + 6,
    end: length + 7,
    className: 'code-inline',
  })
  expect(ranges[length + 2]).toEqual({
    start: length + 7,
    end: code.length,
    className: 'meta',
  })
})
