import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { html } from '../src/languages/html'
import { ejs } from '../src/languages/ejs'
import { js } from '../src/languages/js'

const highlighter = createHighlighter({ languages: [html, ejs, js] })

describe('markup recovery at end of input', () => {
  it('preserves and escapes repeated unclosed tag prefixes', () => {
    const code = '<a '.repeat(2_048)
    expect(highlighter.tokenize(code, { lang: 'html' }).tokens).toEqual([{ value: code }])
    expect(highlighter.highlightToHtml(code, { lang: 'html' })).toContain('&lt;a '.repeat(2_048))
  })

  it('keeps an unterminated comment after unclosed tag prefixes', () => {
    const code = '<a '.repeat(128) + '<!-- unfinished'
    const tokens = highlighter.tokenize(code, { lang: 'html' }).tokens
    expect(tokens.map((token) => token.value).join('')).toBe(code)
    expect(tokens.filter((token) => token.className === 'comment')).toEqual([
      { className: 'comment', value: '<!-- unfinished' },
    ])
  })

  it('delegates an unterminated EJS region after unclosed tag prefixes', () => {
    const code = '<a '.repeat(128) + '<% const value = 42'
    const tokens = highlighter.tokenize(code, { lang: 'ejs' }).tokens
    expect(tokens.map((token) => token.value).join('')).toBe(code)
    expect(tokens.some((token) => token.className === 'keyword' && token.value === 'const')).toBe(true)
  })

  it('still discovers inner tags when an outer quote never closes', () => {
    const code = '<outer title="unfinished <b>bold</b>'
    const tokens = highlighter.tokenize(code, { lang: 'html' }).tokens
    expect(tokens.map((token) => token.value).join('')).toBe(code)
    expect(tokens.filter((token) => token.className === 'tag').map((token) => token.value)).toEqual(['b', 'b'])
  })
})
