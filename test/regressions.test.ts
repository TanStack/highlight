import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { css } from '../src/languages/css'
import { dockerfile } from '../src/languages/dockerfile'
import { html } from '../src/languages/html'
import { http } from '../src/languages/http'
import { js } from '../src/languages/js'
import { jsx } from '../src/languages/jsx'
import { markdown } from '../src/languages/markdown'
import { python } from '../src/languages/python'
import { shell } from '../src/languages/shell'
import { ts } from '../src/languages/ts'
import { tsrx } from '../src/languages/tsrx'
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
    jsx,
    markdown,
    python,
    shell,
    ts,
    tsrx,
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
    const multiline = highlighter.tokenize(
      'const pair = <Key,\n  Value>(key: Key, value: Value) => [key, value]',
      { lang: 'tsx' },
    )

    expect(classesFor(generic, 'T')).toContain('type')
    expect(classesFor(generic, 'T')).not.toContain('tag')
    expect(classesFor(element, 'Component')).toContain('tag')
    expect(classesFor(multiple, 'Key')).not.toContain('tag')
    expect(classesFor(multiline, 'Key')).not.toContain('tag')
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

  it('keeps apostrophes in JSX text from swallowing closing tags', () => {
    const cases = [
      {
        code: `<Description>We'll never share your email.</Description>`,
        textEnd: '</Description>',
      },
      {
        code: `<Description>Don't {say('hi')}</Description>`,
        textEnd: '{',
      },
    ]

    for (const lang of ['jsx', 'tsx']) {
      for (const { code, textEnd } of cases) {
        const result = highlighter.tokenize(code, { lang })
        const textStart = code.indexOf('>') + 1

        expect(
          classesInRange(result, textStart, code.indexOf(textEnd)),
          lang,
        ).toEqual([])
        expect(exactClassesFor(result, 'Description'), lang).toEqual([
          'tag',
          'tag',
        ])
        if (code.includes("'hi'")) {
          expect(exactClassesFor(result, "'hi'"), lang).toEqual(['string'])
        }
        expect(reconstruct(result), lang).toBe(code)
      }
    }
  })

  it('classifies multiline JSX tags and attributes', () => {
    const code = `<AriaLink
  href={props.href}
  aria-label="Docs
  reference"
  render={({ ref }) => null}
/>`

    for (const lang of ['jsx', 'tsx']) {
      const result = highlighter.tokenize(code, { lang })

      expect(exactClassesFor(result, 'AriaLink'), lang).toEqual(['tag'])
      expect(exactClassesFor(result, 'href'), lang).toContain('attr')
      expect(exactClassesFor(result, 'aria-label'), lang).toEqual(['attr'])
      expect(exactClassesFor(result, '"Docs\n  reference"'), lang).toEqual([
        'string',
      ])
      expect(exactClassesFor(result, 'render'), lang).toEqual(['attr'])
      expect(classesFor(result, 'props'), lang).not.toContain('attr')
      expect(classesFor(result, 'null'), lang).toContain('literal')
      expect(reconstruct(result), lang).toBe(code)
    }
  })

  it('classifies JSX nested in attribute expressions', () => {
    const code = `<Wrapper child={<Label>can't</Label>} />`

    for (const lang of ['jsx', 'tsx']) {
      const result = highlighter.tokenize(code, { lang })
      const textStart = code.indexOf("can't")

      expect(exactClassesFor(result, 'Wrapper'), lang).toEqual(['tag'])
      expect(exactClassesFor(result, 'child'), lang).toEqual(['attr'])
      expect(exactClassesFor(result, 'Label'), lang).toEqual(['tag', 'tag'])
      expect(classesInRange(result, textStart, textStart + 5), lang).toEqual([])
      expect(reconstruct(result), lang).toBe(code)
    }
  })

  it('leaves JSX text prose unclassified', () => {
    const cases = [
      '<Trigger>How do I get started?</Trigger>',
      '<Item>Option 1</Item>',
    ]

    for (const lang of ['jsx', 'tsx']) {
      for (const code of cases) {
        const result = highlighter.tokenize(code, { lang })
        const textStart = code.indexOf('>') + 1
        const textEnd = code.lastIndexOf('<')

        expect(classesInRange(result, textStart, textEnd), `${lang}: ${code}`).toEqual(
          [],
        )
        expect(reconstruct(result), lang).toBe(code)
      }
    }
  })

  it('separates nested JSX text from its surrounding expression', () => {
    const code =
      'return <div>{ready ? <strong>Get 1 item</strong> : null}</div>'
    const result = highlighter.tokenize(code, { lang: 'tsx' })
    const textStart = code.indexOf('Get')
    const textEnd = textStart + 'Get 1 item'.length

    expect(classesInRange(result, textStart, textEnd)).toEqual([])
    expect(exactClassesFor(result, 'strong')).toEqual(['tag', 'tag'])
    expect(classesFor(result, 'null')).toContain('literal')
    expect(reconstruct(result)).toBe(code)
  })

  it('tracks fragments and lexical syntax around JSX boundaries', () => {
    const fragment =
      'return <><span>Text 2</span>{ready ? "}" : /* > */ null}</>'
    const expression = highlighter.tokenize(fragment, { lang: 'tsx' })
    const textStart = fragment.indexOf('Text')
    const textEnd = textStart + 'Text 2'.length
    const script = highlighter.tokenize(
      'const pattern = /(?:<Component>)/\nconst ready = true',
      { lang: 'tsx' },
    )

    expect(classesInRange(expression, textStart, textEnd)).toEqual([])
    expect(exactClassesFor(expression, 'span')).toEqual(['tag', 'tag'])
    expect(classesFor(expression, 'null')).toContain('literal')
    expect(classesFor(script, '/(?:<Component>)/')).toContain('literal')
    expect(classesFor(script, 'true')).toContain('literal')
    expect(exactClassesFor(script, 'Component')).not.toContain('tag')
    expect(reconstruct(expression)).toBe(fragment)
    expect(reconstruct(script)).toBe(script.code)
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

describe('TSRX context', () => {
  it('highlights Octane component shorthand and template directives', () => {
    const result = highlighter.tokenize(
      `@Component()
export function View(props) @{
  @if (props.loading) {
    <p>Loading</p>
  } @else {
    @for (const item of props.items; key item.id) {
      <span>{item.label as string}</span>
    } @empty {
      <p>Empty</p>
    }
  }

  @switch (props.state) {
    @case ('ready') { <p>Ready</p> }
    @default { <p>Unknown</p> }
  }

  @try {
    <Content />
  } @pending {
    <Spinner />
  } @catch (error) {
    <ErrorMessage error={error} />
  }
}`,
      { lang: 'tsrx' },
    )

    expect(
      result.tokens
        .filter((token) => token.value.startsWith('@'))
        .map((token) => [token.value, token.className]),
    ).toEqual([
      ['@Component', 'function'],
      ['@{', 'keyword'],
      ['@if', 'keyword'],
      ['@else', 'keyword'],
      ['@for', 'keyword'],
      ['@empty', 'keyword'],
      ['@switch', 'keyword'],
      ['@case', 'keyword'],
      ['@default', 'keyword'],
      ['@try', 'keyword'],
      ['@pending', 'keyword'],
      ['@catch', 'keyword'],
    ])
    expect(classesFor(result, 'Content')).toContain('tag')
    expect(reconstruct(result)).toBe(result.code)
  })

  it('does not highlight TSRX syntax inside strings or comments', () => {
    const result = highlighter.tokenize(
      `const example = '@if (ready) { <Ready /> }'
// @for and @{
export function View() @{ <p>Ready</p> }`,
      { lang: 'octane' },
    )

    expect(classesFor(result, "'@if (ready) { <Ready /> }'")).toContain('string')
    expect(classesFor(result, '// @for and @{')).toContain('comment')
    expect(
      result.tokens
        .filter((token) => token.value.startsWith('@'))
        .map((token) => token.value),
    ).toEqual(['@{'])
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

function exactClassesFor(
  result: ReturnType<typeof highlighter.tokenize>,
  value: string,
) {
  return result.tokens
    .filter((token) => token.value === value)
    .map((token) => token.className)
}

function classesInRange(
  result: ReturnType<typeof highlighter.tokenize>,
  start: number,
  end: number,
) {
  const classes: Array<string> = []
  let offset = 0

  for (const token of result.tokens) {
    const tokenEnd = offset + token.value.length
    if (token.className && tokenEnd > start && offset < end) {
      classes.push(token.className)
    }
    offset = tokenEnd
  }

  return classes
}

function reconstruct(result: ReturnType<typeof highlighter.tokenize>) {
  return result.tokens.map((token) => token.value).join('')
}
