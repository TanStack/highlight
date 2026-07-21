import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { css } from '../src/languages/css'
import { dockerfile } from '../src/languages/dockerfile'
import { html } from '../src/languages/html'
import { http } from '../src/languages/http'
import { js } from '../src/languages/js'
import { markdown } from '../src/languages/markdown'
import { python } from '../src/languages/python'
import { shell } from '../src/languages/shell'
import { ts } from '../src/languages/ts'
import { tsx } from '../src/languages/tsx'
import { vue } from '../src/languages/vue'
import { yaml } from '../src/languages/yaml'

const highlighter = createHighlighter({
  languages: [
    css,
    dockerfile,
    html,
    http,
    js,
    markdown,
    python,
    shell,
    ts,
    tsx,
    vue,
    yaml,
  ],
})

describe('script context', () => {
  it('distinguishes TSX generics from JSX elements', () => {
    const generic = highlighter.tokenize(
      'const id = <T extends object>(value: T) => value',
      { lang: 'tsx' },
    )
    const element = highlighter.tokenize(
      'const node = <Component value={value} />',
      { lang: 'tsx' },
    )
    const multiple = highlighter.tokenize(
      'const pair = <Key, Value>(key: Key, value: Value) => [key, value]',
      { lang: 'tsx' },
    )

    expect(classesFor(generic, 'T')).toContain('type')
    expect(classesFor(generic, 'T')).not.toContain('tag')
    expect(classesFor(element, 'Component')).toContain('tag')
    expect(classesFor(multiple, 'Key')).not.toContain('tag')
    expect(reconstruct(generic)).toBe(generic.code)
    expect(reconstruct(element)).toBe(element.code)
  })

  it('protects regular expression bodies from comment parsing', () => {
    const result = highlighter.tokenize(
      'const url = /https?:\\/\\/[^/]+/gi',
      { lang: 'ts' },
    )

    expect(classesFor(result, '/https?:\\/\\/[^/]+/gi')).toContain('literal')
    expect(result.tokens.some((token) => token.className === 'comment')).toBe(false)
  })

  it('does not confuse JSX closing tags with regular expressions', () => {
    const result = highlighter.tokenize(
      'return <div>Hello <span>{left < right ? <b>yes</b> : null}</span></div>',
      { lang: 'tsx' },
    )

    expect(classesFor(result, 'span')).toEqual(['tag', 'tag'])
    expect(
      result.tokens
        .filter((token) => token.value === 'b')
        .map((token) => token.className),
    ).toEqual(['tag', 'tag'])
    expect(classesFor(result, 'right')).not.toContain('tag')
    expect(
      result.tokens.some(
        (token) => token.className === 'literal' && token.value.includes('/span'),
      ),
    ).toBe(false)
  })

  it('tokenizes template interpolations recursively', () => {
    const result = highlighter.tokenize(
      'const text = `hello ${user.name.toUpperCase()} ${`nested ${count}`}`',
      { lang: 'ts' },
    )

    expect(classesFor(result, 'name')).toContain('property')
    expect(classesFor(result, 'toUpperCase')).toContain('property')
    expect(classesFor(result, 'count')).not.toContain('string')
    expect(result.tokens.filter((token) => token.className === 'operator')).toHaveLength(6)
    expect(reconstruct(result)).toBe(result.code)
  })
})

describe('docs language regressions', () => {
  it('keeps Python triple strings together and highlights literals and numbers', () => {
    const result = highlighter.tokenize(
      'text = """hello\nworld"""\nempty = None\nenabled = True\ncount = 42',
      { lang: 'python' },
    )

    expect(result.tokens.filter((token) => token.className === 'string')).toEqual([
      { className: 'string', value: '"""hello\nworld"""' },
    ])
    expect(classesFor(result, 'None')).toContain('literal')
    expect(classesFor(result, 'True')).toContain('literal')
    expect(classesFor(result, '42')).toContain('number')
  })

  it('understands shell parameter operators and heredoc bodies', () => {
    const result = highlighter.tokenize(
      'trimmed=${path#*/}\ncat <<EOF\n# content\n$HOME\nEOF',
      { lang: 'shell' },
    )

    expect(classesFor(result, '${path#*/}')).toContain('variable')
    expect(classesFor(result, '${path#*/}')).not.toContain('comment')
    expect(classesFor(result, '# content\n$HOME\n')).toContain('string')
    expect(classesFor(result, 'EOF')).toContain('meta')
  })

  it('does not start heredocs inside shell strings or here-strings', () => {
    const result = highlighter.tokenize(
      'echo "<<EOF"\ncat <<<value\necho done;# comment',
      { lang: 'shell' },
    )

    expect(classesFor(result, '"<<EOF"')).toContain('string')
    expect(classesFor(result, 'value')).not.toContain('string')
    expect(classesFor(result, '# comment')).toContain('comment')
  })

  it('only starts unquoted YAML comments at whitespace boundaries', () => {
    const result = highlighter.tokenize(
      'url: https://example.com/page#section\nname: docs # visible comment',
      { lang: 'yaml' },
    )

    expect(classesFor(result, 'https://example.com/page#section')).toContain('string')
    expect(classesFor(result, '#section')).not.toContain('comment')
    expect(classesFor(result, '# visible comment')).toContain('comment')
  })

  it('protects YAML block scalar contents', () => {
    const result = highlighter.tokenize(
      'run: |\n  echo "# content"\n  pnpm test\nnext: value',
      { lang: 'yaml' },
    )

    expect(classesFor(result, 'echo "# content"\n  pnpm test\n')).toContain('string')
    expect(classesFor(result, '# content')).not.toContain('comment')
  })

  it('delegates script and style bodies to registered languages', () => {
    const htmlResult = highlighter.tokenize(
      '<script>const ready = true</script><style>.button { color: red }</style>',
      { lang: 'html' },
    )
    const vueResult = highlighter.tokenize(
      '<script setup lang="ts">const value: string = "x"</script>',
      { lang: 'vue' },
    )

    expect(classesFor(htmlResult, 'const')).toContain('keyword')
    expect(classesFor(htmlResult, 'color')).toContain('property')
    expect(classesFor(vueResult, 'string')).toContain('type')
  })

  it('covers common HTTP and Docker directives', () => {
    expect(
      classesFor(highlighter.tokenize('HEAD /health HTTP/1.1', { lang: 'http' }), 'HEAD'),
    ).toContain('keyword')
    expect(
      classesFor(
        highlighter.tokenize('HEALTHCHECK CMD node health.js', {
          lang: 'dockerfile',
        }),
        'HEALTHCHECK',
      ),
    ).toContain('keyword')
  })

  it('delegates fenced Markdown only when its language is registered', () => {
    const result = highlighter.tokenize(
      '# Example\n\n```tsx\nconst node = <Button />\n```',
      { lang: 'markdown' },
    )

    expect(classesFor(result, 'Button')).toContain('tag')
    expect(classesFor(result, '```tsx')).toContain('meta')
  })
})

function classesFor(
  result: ReturnType<typeof highlighter.tokenize>,
  value: string,
) {
  return result.tokens
    .filter((token) => token.value.includes(value))
    .map((token) => token.className)
}

function reconstruct(result: ReturnType<typeof highlighter.tokenize>) {
  return result.tokens.map((token) => token.value).join('')
}
