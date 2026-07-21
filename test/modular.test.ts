import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { html } from '../src/languages/html'
import { js } from '../src/languages/js'
import { tsx } from '../src/languages/tsx'

describe('language registration', () => {
  it('registers only explicitly supplied languages and their aliases', () => {
    const highlighter = createHighlighter({ languages: [tsx] })

    expect(highlighter.listLanguages()).toEqual(['tsx'])
    expect(highlighter.normalizeLanguage('tsx')).toBe('tsx')
    expect(highlighter.normalizeLanguage('javascript')).toBe('plaintext')
    expect(highlighter.highlight('const value = true', { lang: 'js' }).html).not.toContain(
      'th-keyword',
    )
  })

  it('keeps embedded languages optional', () => {
    const markupOnly = createHighlighter({ languages: [html] })
    const withJavaScript = createHighlighter({ languages: [html, js] })
    const code = '<script>const value = true</script>'

    expect(markupOnly.highlight(code, { lang: 'html' }).html).not.toContain('th-keyword')
    expect(withJavaScript.highlight(code, { lang: 'html' }).html).toContain('th-keyword')
  })
})

describe('decorations', () => {
  const highlighter = createHighlighter({ languages: [tsx] })

  it('renders line and character ranges without changing source text', () => {
    const code = 'const first = 1\nconst second = 2'
    const start = code.indexOf('second')
    const result = highlighter.highlight(code, {
      lang: 'tsx',
      lineNumbers: true,
      decorations: [
        { lines: 2, className: 'is-focused', data: { kind: 'focus' } },
        { range: [start, start + 6], className: 'is-error', data: { message: 'Nope' } },
      ],
    })

    expect(result.html).toContain('class="th-line" data-line="1"')
    expect(result.html).toContain('th-line is-focused')
    expect(result.html).toContain('data-kind="focus"')
    expect(result.html).toContain('th-decoration is-error')
    expect(result.html).toContain('data-message="Nope"')
    expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  })

  it('escapes decoration attributes', () => {
    const html = highlighter.highlight('value', {
      lang: 'tsx',
      decorations: [
        {
          range: [0, 5],
          className: 'mark',
          data: { 'bad key': 'value', label: '"><script>' },
        },
      ],
    }).html

    expect(html).toContain('data-label="&quot;&gt;&lt;script&gt;"')
    expect(html).toContain('data-bad-key="value"')
    expect(html).not.toContain('<script>')
  })
})
