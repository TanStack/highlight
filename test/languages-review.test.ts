import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { css } from '../src/languages/css'
import { env } from '../src/languages/env'
import { html } from '../src/languages/html'
import { js } from '../src/languages/js'
import { python } from '../src/languages/python'
import { scheme } from '../src/languages/scheme'
import { shell } from '../src/languages/shell'

const highlighter = createHighlighter({
  languages: [css, env, html, js, python, scheme, shell],
})

function classified(code: string, lang: string) {
  const result = highlighter.tokenize(code, { lang })
  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  return result.tokens.filter((token) => token.className)
}

describe('captured tokens', () => {
  it('locates names that also occur in the keyword before them', () => {
    expect(classified('def d():\n  pass', 'python')).toContainEqual({
      className: 'function', value: 'd',
    })
    expect(classified('(define (de x) x)', 'scheme')).toContainEqual({
      className: 'function', value: 'de',
    })
    expect(classified('export e=value', 'env')).toContainEqual({
      className: 'property', value: 'e',
    })
  })

  it('keeps assignment separators out of environment values', () => {
    expect(highlighter.tokenize('SYMBOL==', { lang: 'env' }).tokens).toEqual([
      { className: 'property', value: 'SYMBOL' },
      { value: '=' },
      { className: 'string', value: '=' },
    ])
  })

  it('keeps whitespace after function names unclassified', () => {
    expect(classified('run \n (value)', 'js')).toEqual([
      { className: 'function', value: 'run' },
    ])
  })
})

describe('raw markup content', () => {
  it('leaves embedded bodies unclassified when their language is absent', () => {
    const markupOnly = createHighlighter({ languages: [html] })
    const code = '<script>const example = "<Fake value=\'x\'>"</script>'
    expect(markupOnly.tokenize(code, { lang: 'html' }).tokens).toEqual([
      { value: '<' },
      { className: 'tag', value: 'script' },
      { value: '>const example = "<Fake value=\'x\'>"</' },
      { className: 'tag', value: 'script' },
      { value: '>' },
    ])
  })

  it('delegates markup-looking script and style contents only once', () => {
    const tokens = classified(
      '<script>const value = left<Fake && right>0;</script>' +
      '<style>.example::before { content: "<Fake>" }</style>',
      'html',
    )
    expect(tokens.filter((token) => token.className === 'tag')).toEqual([
      { className: 'tag', value: 'script' },
      { className: 'tag', value: 'script' },
      { className: 'tag', value: 'style' },
      { className: 'tag', value: 'style' },
    ])
    expect(tokens).toContainEqual({ className: 'type', value: 'Fake' })
    expect(tokens).toContainEqual({ className: 'string', value: '"<Fake>"' })
  })

  it('finds case-insensitive closing tags without changing Unicode offsets', () => {
    const tokens = classified(
      '<SCRIPT>const value = "İ";</sCrIpT><p>after</p>',
      'html',
    )
    expect(tokens).toContainEqual({ className: 'string', value: '"İ"' })
    expect(tokens.filter((token) => token.className === 'tag')).toEqual([
      { className: 'tag', value: 'SCRIPT' },
      { className: 'tag', value: 'sCrIpT' },
      { className: 'tag', value: 'p' },
      { className: 'tag', value: 'p' },
    ])
  })

  it('requires a complete closing tag name', () => {
    const tokens = classified(
      '<script>const example = "</scripture>"; const ready = true;</script>',
      'html',
    )
    expect(tokens).toContainEqual({ className: 'string', value: '"</scripture>"' })
    expect(tokens).toContainEqual({ className: 'literal', value: 'true' })
  })

  it('highlights an unfinished script block through the end of the snippet', () => {
    expect(classified('<script>const ready = true', 'html')).toContainEqual({
      className: 'literal', value: 'true',
    })
  })
})

describe('script template expressions', () => {
  it.each(['/}/', '/{/', '/[{}]/'])('ignores braces inside %s', (regex) => {
    const tokens = classified(
      'const message = `match ${' + regex + '.test(value) ? true : false} done`',
      'js',
    )
    expect(tokens).toContainEqual({ className: 'literal', value: regex })
    expect(tokens).toContainEqual({ className: 'literal', value: 'true' })
    expect(tokens).toContainEqual({ className: 'literal', value: 'false' })
    expect(tokens).toContainEqual({ className: 'string', value: ' done`' })
  })
})

describe('shell lexical scanning', () => {
  it('preserves heredocs among many quoted arguments', () => {
    const code = 'echo "before"\ncat <<FIRST\n"body"\nFIRST\n' +
      'echo "between"\ncat <<SECOND\n# body\nSECOND\necho "after"'
    expect(classified(code, 'shell').filter((token) => token.className === 'string')).toEqual([
      { className: 'string', value: '"before"' },
      { className: 'string', value: '"body"\n' },
      { className: 'string', value: '"between"' },
      { className: 'string', value: '# body\n' },
      { className: 'string', value: '"after"' },
    ])
  })

  it('keeps a trailing escape inside an unfinished quoted string', () => {
    expect(classified('echo "unfinished\\', 'shell')).toContainEqual({
      className: 'string', value: '"unfinished\\',
    })
  })
})
