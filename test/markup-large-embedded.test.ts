import { expect, it } from 'vitest'
import { html } from '../src/languages/html'

it('appends large embedded results without using them as function arguments', () => {
  const length = 140_000
  const code = '<script>' + 'x'.repeat(length) + '</script>'
  const ranges = html.tokenize(code, {
    hasLanguage: (lang) => lang === 'js',
    tokenize: (value) => Array.from(value, (_, index) => ({
      start: index,
      end: index + 1,
      className: 'keyword' as const,
    })),
  })

  expect(ranges).toHaveLength(length + 2)
  expect(ranges[2]).toEqual({ start: 8, end: 9, className: 'keyword' })
  expect(ranges[ranges.length - 1]).toEqual({
    start: length + 7,
    end: length + 8,
    className: 'keyword',
  })
})
