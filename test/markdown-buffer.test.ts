import { expect, it } from 'vitest'
import { createHighlighter, type HighlightTokenClass } from '../src/core'
import { createTanStackMarkdownHighlighter } from '../src/markdown'

it('finishes token class getters before escaping numbered Markdown HTML', () => {
  const highlighter = createHighlighter({ languages: [] })
  const captures: Array<string> = []
  highlighter.tokenize = code => {
    /(seed)/.test('seed')
    return { code, lang: 'plaintext', tokens: [{
      value: '<',
      get className(): HighlightTokenClass {
        captures.push(RegExp.$1)
        return RegExp.$1 === 'seed' ? 'keyword' : 'string'
      },
    }] }
  }
  const html = createTanStackMarkdownHighlighter(highlighter)('<', 'plaintext', { lineNumbers: true })
  expect(html).toBe('<span class="th-line" data-line="1"><span class="th-token th-keyword">&lt;</span></span>')
  expect(captures).toEqual(['seed', 'seed'])
})

it('reads the custom token result before the Markdown line-number option', () => {
  const highlighter = createHighlighter({ languages: [] })
  const reads: Array<string> = []
  highlighter.tokenize = code => ({ code, lang: 'plaintext', get tokens() {
    reads.push('tokens')
    return [{ value: 'a' }]
  } })
  const html = createTanStackMarkdownHighlighter(highlighter)('a', 'plaintext', {
    get lineNumbers() { reads.push('lineNumbers'); return true },
  })
  expect(reads).toEqual(['tokens', 'lineNumbers'])
  expect(html).toBe('<span class="th-line" data-line="1">a</span>')
})
