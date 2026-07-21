import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { ts } from '../src/languages/ts'
import {
  createHighlightedCodeBlockProps,
  createOctaneMdxHighlight,
} from '../src/octane'

const highlighter = createHighlighter({ languages: [ts] })

describe('octane adapter', () => {
  it('creates deterministic raw-html props for Octane components', () => {
    const input = {
      className: 'docs-code',
      code: `const value = 'octane'\n`,
      highlighter,
      lang: 'ts',
      lineNumbers: true,
      title: 'example.ts',
    }
    const first = createHighlightedCodeBlockProps(input)
    const second = createHighlightedCodeBlockProps(input)

    expect(first).toEqual(second)
    expect(first.copyText).toBe(`const value = 'octane'`)
    expect(first.className).toBe('docs-code')
    expect(first.title).toBe('example.ts')
    expect(first.dangerouslySetInnerHTML).toEqual({
      __html: first.htmlMarkup,
    })
    expect(first.htmlMarkup).toContain('th-code--line-numbers')
    expect(first.htmlMarkup).toContain('th-keyword')
  })

  it('creates a synchronous @octanejs/mdx rehype plugin tuple', () => {
    const [plugin, options] = createOctaneMdxHighlight({
      highlighter,
      lineNumbers: true,
    })
    const tree: any = {
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
              children: [{ type: 'text', value: `const value = true\n` }],
            },
          ],
        },
      ],
    }

    plugin(options)(tree)

    expect(tree.children[0].properties.className).toEqual([
      'th-code',
      'th-code--ts',
      'th-code--line-numbers',
    ])
    expect(JSON.stringify(tree)).toContain('th-keyword')
  })
})
