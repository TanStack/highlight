import { expect, it } from 'vitest'
import { createHighlighter, type HighlightTokenClass } from '../src/core'
import { createTanStackMarkdownHighlighter } from '../src/markdown'

it('keeps diff annotation order and duplicate highlights on the same line', () => {
  const highlighter = createTanStackMarkdownHighlighter(createHighlighter({ languages: [] }))
  expect(highlighter('a // [!code ++]\nb', 'plaintext', { highlightLines: [1, 1] })).toBe(
    '<span class="th-line th-line--inserted th-line--highlighted th-line--highlighted" data-line="1">a</span>\n<span class="th-line" data-line="2">b</span>',
  )
})

it('preserves native capture observers while rendering annotated token getters', () => {
  const highlighter = createHighlighter({ languages: [] })
  highlighter.tokenize = code => {
    new RegExp('(seed)').test('seed')
    return {
      code,
      lang: 'plaintext',
      tokens: [{
        value: '<',
        get className(): HighlightTokenClass {
          return RegExp.$1 === 'seed' ? 'keyword' : 'string'
        },
      }],
    }
  }
  expect(createTanStackMarkdownHighlighter(highlighter)('<', 'plaintext', { highlightLines: [1] })).toBe(
    '<span class="th-line th-line--highlighted" data-line="1"><span class="th-token th-keyword">&lt;</span></span>',
  )
})

it('reads result tokens before the line-number option with highlights present', () => {
  const events: Array<string> = []
  const highlighter = createHighlighter({ languages: [] })
  highlighter.tokenize = code => ({
    code,
    lang: 'plaintext',
    get tokens() {
      events.push('tokens')
      return [{ value: code }]
    },
  })
  createTanStackMarkdownHighlighter(highlighter)('x', 'plaintext', {
    highlightLines: [1],
    get lineNumbers() {
      events.push('lineNumbers')
      return false
    },
  })
  expect(events).toEqual(['tokens', 'lineNumbers'])
})

it('keeps all valid dense highlights and omits a phantom trailing line', () => {
  const highlighter = createTanStackMarkdownHighlighter(createHighlighter({ languages: [] }))
  const lines = Array.from({ length: 500 }, (_, index) => index + 1)
  const output = highlighter('x\n'.repeat(lines.length), 'plaintext', { highlightLines: lines })
  expect(output).toBe(lines.map(line => `<span class="th-line th-line--highlighted" data-line="${line}">x</span>\n`).join(''))
})

it('keeps invalid numeric annotations from selecting newline siblings', () => {
  const highlighter = createTanStackMarkdownHighlighter(createHighlighter({ languages: [] }))
  expect(highlighter('a\nb\n', 'plaintext', { highlightLines: [NaN, Infinity, -1, 0, 1.5, 2.5, 4000] })).toBe(
    '<span class="th-line" data-line="1">a</span>\n<span class="th-line" data-line="2">b</span>\n',
  )
})

it('keeps the empty first line annotatable', () => {
  const highlighter = createTanStackMarkdownHighlighter(createHighlighter({ languages: [] }))
  expect(highlighter('', 'plaintext', { highlightLines: [1] })).toBe(
    '<span class="th-line th-line--highlighted" data-line="1"></span>',
  )
})
