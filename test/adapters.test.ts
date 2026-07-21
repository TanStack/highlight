import { describe, expect, it } from 'vitest'
import { toHast } from 'mdast-util-to-hast'
import { defaultHighlighter, tokenize } from '../src/index'
import {
  codeFenceToHast,
  getCodeFenceTitle,
  parseCodeFenceMeta,
  renderCodeFence,
} from '../src/markdown'
import { rehypeHighlightCodeBlocks } from '../src/rehype'
import { createHighlightedCodeBlockProps } from '../src/react'
import {
  remarkCodeNodeToHtml,
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

  it('renders a code fence into data and hast', () => {
    const rendered = renderCodeFence(
      {
        code: `const value = 'x'\n`,
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
