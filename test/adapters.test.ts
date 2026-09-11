import { describe, expect, it, vi } from 'vitest'
import { toHast } from 'mdast-util-to-hast'
import { defaultHighlighter, tokenize } from '../src/index'
import {
  codeFenceToHast,
  createTanStackMarkdownHighlighter,
  getCodeFenceTitle,
  parseCodeDiffNotation,
  parseCodeFenceMeta,
  renderCodeFence,
  tokensToHast,
} from '../src/markdown'
import { rehypeHighlightCodeBlocks, rehypePreCodeToHast } from '../src/rehype'
import { createHighlightedCodeBlockProps } from '../src/react'
import {
  remarkCodeNodeToHtml,
  remarkCodeNodeToMdast,
  remarkHighlightCodeBlocks,
} from '../src/remark'

describe('token output', () => {
  it('returns serializable tokens for non-html renderers', () => {
    const result = tokenize(`const value = 'x'`, { lang: 'ts' })

    expect(result.lang).toBe('ts')
    expect(result.tokens.some((token) => token.className === 'keyword')).toBe(
      true,
    )
    expect(result.tokens.map((token) => token.value).join('')).toBe(
      `const value = 'x'`,
    )
  })
})

describe('markdown helpers', () => {
  it('turns inline diff notation into clean code and line decorations', () => {
    expect(
      parseCodeDiffNotation(
        [
          `- const oldValue = true // [!code --]`,
          `+ const newValue = true // [!code ++]`,
          `color: red; /* [!code ++] */`,
          `echo old # [!code --]`,
          `<old-tag /> <!-- [!code --] -->`,
        ].join('\n'),
      ),
    ).toEqual({
      code: [
        `- const oldValue = true`,
        `+ const newValue = true`,
        `color: red;`,
        `echo old`,
        `<old-tag />`,
      ].join('\n'),
      decorations: [
        { className: 'th-line--deleted', lines: 1 },
        { className: 'th-line--inserted', lines: 2 },
        { className: 'th-line--inserted', lines: 3 },
        { className: 'th-line--deleted', lines: 4 },
        { className: 'th-line--deleted', lines: 5 },
      ],
    })
  })

  it('keeps unannotated source and Windows line endings intact', () => {
    const plain = 'const value = true  \r\n\t\r\n'
    expect(parseCodeDiffNotation(plain)).toEqual({ code: plain, decorations: [] })
    expect(parseCodeDiffNotation(
      'const oldValue = false // [!code --]\r\nconst value = true /* [!code ++] */\r\n',
    )).toEqual({
      code: 'const oldValue = false\r\nconst value = true\r\n',
      decorations: [
        { className: 'th-line--deleted', lines: 1 },
        { className: 'th-line--inserted', lines: 2 },
      ],
    })
  })

  it('parses common code fence title metadata', () => {
    expect(getCodeFenceTitle('title="app.tsx"')).toBe('app.tsx')
    expect(getCodeFenceTitle("{filename='route.ts'}")).toBe('route.ts')
    expect(getCodeFenceTitle('1,4')).toBeUndefined()
  })

  it('normalizes common fence annotations into line decorations', () => {
    const parsed = parseCodeFenceMeta(
      'title="app.tsx" {1,3-4} ins={6} error={8-9} lineNumbers',
    )

    expect(parsed.title).toBe('app.tsx')
    expect(parsed.lineNumbers).toBe(true)
    expect(parsed.decorations).toEqual([
      { className: 'th-line--highlighted', lines: 1 },
      { className: 'th-line--highlighted', lines: [3, 4] },
      { className: 'th-line--inserted', lines: 6 },
      { className: 'th-line--error', lines: [8, 9] },
    ])
  })

  it('treats quoted metadata as text and only recognizes complete option names', () => {
    const title = 'lineNumbers {1} ins={2} showLineNumbers.ts'
    expect(parseCodeFenceMeta(`title="${title}" caption='error={3}'`)).toEqual({
      decorations: [],
      lineNumbers: false,
      title,
    })
    expect(parseCodeFenceMeta(
      'data-title="ignored.ts" no-lineNumbers lineNumbers=false no-ins={4}',
    )).toEqual({ decorations: [], lineNumbers: false, title: undefined })
    expect(getCodeFenceTitle(`caption="title='ignored.ts'" filename=actual.ts`))
      .toBe('actual.ts')
  })

  it('keeps mixed annotations in source order and ignores invalid line numbers', () => {
    expect(parseCodeFenceMeta(
      `ins={5} {1,2-3} del={4} highlight={0,4-2,9007199254740993,${'9'.repeat(400)}}`,
    ).decorations).toEqual([
      { className: 'th-line--inserted', lines: 5 },
      { className: 'th-line--highlighted', lines: 1 },
      { className: 'th-line--highlighted', lines: [2, 3] },
      { className: 'th-line--deleted', lines: 4 },
    ])
  })

  it.each([
    { code: '<script>"&"</script>  \n', lang: 'unknown', meta: undefined },
    { code: 'const value = true // [!code ++]\n\n', lang: 'typescript', meta: 'title="App.ts" {1} lineNumbers' },
    { code: '  \n', lang: 'ts', meta: 'lineNumbers' },
  ])('creates equivalent HAST directly from tokens for $lang', (input) => {
    const rendered = renderCodeFence(input, defaultHighlighter)
    const highlighter = {
      ...defaultHighlighter,
      tokenize: vi.fn(defaultHighlighter.tokenize),
      renderCodeBlockData: vi.fn(() => {
        throw new Error('HAST rendering must not serialize unused HTML')
      }),
    }
    expect(codeFenceToHast(input, highlighter)).toEqual(
      tokensToHast(rendered.tokens, rendered.lang, rendered),
    )
    expect(highlighter.tokenize).toHaveBeenCalledTimes(1)
    expect(highlighter.renderCodeBlockData).not.toHaveBeenCalled()
  })

  it('renders a code fence into data and hast', () => {
    const rendered = renderCodeFence(
      {
        code: `const value = 'x' // [!code ++]\n`,
        lang: 'typescript',
        meta: 'title="example.ts"',
      },
      defaultHighlighter,
    )
    const hast = codeFenceToHast(
      {
        code: `const value = 'x'\n`,
        lang: 'typescript',
        meta: 'title="example.ts" {1} lineNumbers',
      },
      defaultHighlighter,
    )

    expect(rendered.copyText).toBe(`const value = 'x'`)
    expect(rendered.decorations).toContainEqual({
      className: 'th-line--inserted',
      lines: 1,
    })
    expect(rendered.htmlMarkup).toContain('th-line--inserted')
    expect(rendered.htmlMarkup).not.toContain('!code')
    expect(rendered.lang).toBe('ts')
    expect(hast.properties?.dataTitle).toBe('example.ts')
    expect(hast.tagName).toBe('pre')
    expect(hast.properties?.className).toEqual([
      'th-code',
      'th-code--ts',
      'th-code--line-numbers',
    ])
    expect(rendered.title).toBe('example.ts')
    expect(JSON.stringify(hast)).toContain('th-keyword')
    expect(JSON.stringify(hast)).toContain('th-line--highlighted')
    expect(JSON.stringify(hast)).toContain('dataLine')
  })

  it('adapts tokens to TanStack Markdown inner markup', () => {
    const highlightMarkdownCode =
      createTanStackMarkdownHighlighter(defaultHighlighter)
    const html = highlightMarkdownCode(
      '<img src=x onerror=alert(1)>',
      'html',
      {
        highlightLines: [1],
        lineNumbers: true,
      },
    )

    expect(html).toContain('class="th-line th-line--highlighted"')
    expect(html).toContain('&lt;')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<pre')
    expect(html).not.toContain('<code')

    const diff = highlightMarkdownCode(
      `- const oldValue = true // [!code --]`,
      'ts',
    )
    expect(diff).toContain('class="th-line th-line--deleted"')
    expect(diff).not.toContain('!code')

    const unknown = highlightMarkdownCode('<script>x</script>', 'unknown')
    expect(unknown).toBe('&lt;script&gt;x&lt;/script&gt;')
  })
})

describe('remark adapter', () => {
  it('adds standard hast data without requiring raw html', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'code',
          lang: 'tsx',
          meta: 'title="App.tsx"',
          value: `export function App() { return <div /> }`,
        },
      ],
    }

    remarkHighlightCodeBlocks({ highlighter: defaultHighlighter })(tree)

    expect(tree.children[0]?.type).toBe('highlightedCode')
    expect((tree.children[0] as any)?.data?.hName).toBe('pre')

    const hast = toHast(tree as Parameters<typeof toHast>[0])
    expect(JSON.stringify(hast)).toContain('th-code--tsx')
    expect(JSON.stringify(hast)).toContain('th-keyword')

    const pre = (hast as any)?.children[0]
    expect(pre.tagName).toBe('pre')
    expect(pre.children[0]?.tagName).toBe('code')
    expect(pre.children[0]?.children[0]?.tagName).not.toBe('pre')
  })

  it('shares normalized copy data without generating unused HTML', () => {
    const highlighter = {
      ...defaultHighlighter,
      renderCodeBlockData: vi.fn(() => {
        throw new Error('MDAST rendering must not serialize unused HTML')
      }),
    }
    const node = remarkCodeNodeToMdast({
      type: 'code',
      value: 'const value = true // [!code ++]\n',
      lang: 'typescript',
      meta: 'title="App.ts"',
      data: { custom: 'kept' },
    }, { highlighter })

    expect(node.data.custom).toBe('kept')
    expect(node.data.syntaxHighlight).toEqual({
      copyText: 'const value = true',
      lang: 'ts',
      title: 'App.ts',
    })
    expect(JSON.stringify(node.data.hChildren)).toContain('th-line--inserted')
    expect(highlighter.renderCodeBlockData).not.toHaveBeenCalled()
  })

  it('can explicitly create a raw html node', () => {
    const node = remarkCodeNodeToHtml(
      {
        type: 'code',
        lang: 'ts',
        value: `const value = 'x'`,
      },
      { highlighter: defaultHighlighter },
    )

    expect(node.type).toBe('html')
    expect(node.value).toContain('th-code--ts')
    expect(node.value).not.toContain('style=')
  })
})

describe('rehype adapter', () => {
  it('replaces hast pre/code nodes with highlighted hast elements', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-ts'] },
              children: [{ type: 'text', value: `const value = 'x'\n` }],
            },
          ],
        },
      ],
    }

    rehypeHighlightCodeBlocks({ highlighter: defaultHighlighter })(tree)

    const pre = tree.children[0] as any
    expect(pre.type).toBe('element')
    expect(pre.tagName).toBe('pre')
    expect(pre.properties?.className).toEqual(['th-code', 'th-code--ts'])
    expect(JSON.stringify(pre)).toContain('th-keyword')
  })

  it('reads fence metadata from the standard mdast-to-hast pipeline', () => {
    const tree = toHast({
      type: 'root',
      children: [{
        type: 'code',
        value: 'const value = true',
        lang: 'typescript',
        meta: 'title="App.ts" {1} lineNumbers',
      }],
    })

    rehypeHighlightCodeBlocks({ highlighter: defaultHighlighter })(tree as any)
    const pre = (tree as any).children[0]
    expect(pre.properties.dataTitle).toBe('App.ts')
    expect(pre.properties.className).toContain('th-code--line-numbers')
    expect(JSON.stringify(pre)).toContain('th-line--highlighted')

    const overridden = rehypePreCodeToHast({
      type: 'element', tagName: 'pre', children: [{
        type: 'element', tagName: 'code', children: [{ type: 'text', value: 'x' }],
        data: { meta: 'title="Original.ts" lineNumbers' },
      }],
    }, { highlighter: defaultHighlighter, getTitle: () => 'Override.ts', lineNumbers: false })
    expect(overridden?.properties?.dataTitle).toBe('Override.ts')
    expect(overridden?.properties?.className).not.toContain('th-code--line-numbers')
  })

  it('preserves attributes and plugin data on pre and code elements', () => {
    const highlighted = rehypePreCodeToHast({
      type: 'element', tagName: 'pre',
      properties: { id: 'example', className: 'existing-block', ariaLabel: 'Example' },
      data: { custom: true },
      children: [{
        type: 'element', tagName: 'code',
        properties: { className: ['language-ts', 'existing-code'], tabIndex: 0 },
        data: { customCode: true },
        children: [{ type: 'text', value: 'const value = true' }],
      }],
    }, { highlighter: defaultHighlighter })

    expect(highlighted?.properties).toMatchObject({
      id: 'example', ariaLabel: 'Example',
      className: ['existing-block', 'th-code', 'th-code--ts'],
    })
    expect(highlighted?.data).toEqual({ custom: true })
    expect(highlighted?.children[0]).toMatchObject({
      properties: { className: ['language-ts', 'existing-code'], tabIndex: 0 },
      data: { customCode: true },
    })
  })

  it('does not reprocess already highlighted blocks', () => {
    const tree = {
      type: 'root',
      children: [
        codeFenceToHast(
          {
            code: `const value = 'x'`,
            lang: 'ts',
          },
          defaultHighlighter,
        ),
      ],
    }
    const before = JSON.stringify(tree)

    rehypeHighlightCodeBlocks({ highlighter: defaultHighlighter })(tree)

    expect(JSON.stringify(tree)).toBe(before)
  })
})

describe('react helper', () => {
  it('creates view-ready props without importing react', () => {
    const props = createHighlightedCodeBlockProps({
      className: 'codeblock',
      code: `const value = 'x'\n`,
      highlighter: defaultHighlighter,
      lang: 'ts',
      title: 'example.ts',
    })

    expect(props.className).toBe('codeblock')
    expect(props.copyText).toBe(`const value = 'x'`)
    expect(props.htmlMarkup).toContain('th-code--ts')
    expect(props.title).toBe('example.ts')
  })
})
