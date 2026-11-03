import { expect, it } from 'vitest'
import type { HighlightDecoration, HighlightToken } from '../src/core'
import { tokensToHast, type HastElement } from '../src/markdown'

it('keeps token, range and line wrappers in HAST with normalized data keys', () => {
  const result = tokensToHast([
    { value: 'a\nb', className: 'keyword' },
    { value: '<&' },
  ], 'ts', {
    lineNumbers: true,
    decorations: [
      { lines: 1, className: 'selected', data: { note: '<&"' } },
      { range: [0, 3], className: 'focus', data: { camelCase: true } },
    ],
  })
  const keyword = (value: string) => ({
    type: 'element', tagName: 'span', properties: { className: ['th-token', 'th-keyword'] },
    children: [{ type: 'text', value }],
  })
  const focused = (value: string) => ({
    type: 'element', tagName: 'span',
    properties: { className: ['th-decoration', 'focus'], 'dataCamel-case': 'true' },
    children: [keyword(value)],
  })
  expect((result.children[0] as HastElement).children).toEqual([
    {
      type: 'element', tagName: 'span',
      properties: { className: ['th-line', 'selected'], dataNote: '<&"', dataLine: '1' },
      children: [focused('a')],
    },
    { type: 'text', value: '\n' },
    {
      type: 'element', tagName: 'span',
      properties: { className: ['th-line'], dataLine: '2' },
      children: [focused('b'), { type: 'text', value: '<&' }],
    },
  ])
})

it('keeps nested HAST rendering independent during decoration data coercion', () => {
  let nested: ReturnType<typeof tokensToHast> | undefined
  const decoration: HighlightDecoration = {
    range: [0, 3],
    className: 'focus',
    get data() {
      nested = tokensToHast([{ value: 'inner', className: 'string' }], 'ts')
      return { note: 'outer' }
    },
  }
  const tokens: Array<HighlightToken> = [{ value: 'abc', className: 'keyword' }]
  const outer = tokensToHast(tokens, 'ts', { decorations: [decoration] })
  expect((nested?.children[0] as HastElement).children).toEqual([{
    type: 'element', tagName: 'span', properties: { className: ['th-token', 'th-string'] },
    children: [{ type: 'text', value: 'inner' }],
  }])
  expect((outer.children[0] as HastElement).children).toEqual([{
    type: 'element', tagName: 'span',
    properties: { className: ['th-decoration', 'focus'], dataNote: 'outer' },
    children: [{
      type: 'element', tagName: 'span', properties: { className: ['th-token', 'th-keyword'] },
      children: [{ type: 'text', value: 'abc' }],
    }],
  }])
  expect(tokens).toEqual([{ value: 'abc', className: 'keyword' }])
})
