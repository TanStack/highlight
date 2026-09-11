import { describe, expect, it } from 'vitest'
import {
  createHighlighter,
  escapeHtml,
  renderNodesToHtml,
  renderTokens,
  type HighlightRenderNode,
  type HighlightToken,
  type TokenRange,
} from '../src/core'

function textContent(nodes: ReadonlyArray<HighlightRenderNode>): string {
  return nodes.map((node) => node.type === 'text'
    ? node.value
    : textContent(node.children)).join('')
}

describe('rendering', () => {
  it.each(['', '\n', '\n\n', 'a\n', 'a\r\nb\r\n', 'a\n\nb', '😀\ntext'])(
    'preserves line boundaries and source text for %j',
    (code) => {
      // Include empty tokens and a token spanning the entire block.
      const nodes = renderTokens([
        { value: '' },
        { value: code, className: 'string' },
        { value: '' },
      ], { lineNumbers: true })
      expect(textContent(nodes)).toBe(code)
      const lines = nodes.filter((node) => node.type === 'element')
      const expected = code.split('\n')
      if (code.endsWith('\n')) expected.pop()
      expect(lines.map((line) => textContent(line.children))).toEqual(expected)
      expect(lines.map((line) => line.data?.line)).toEqual(
        expected.map((_, index) => String(index + 1)),
      )
    },
  )

  it('keeps decoration offsets and nesting across tokens and lines', () => {
    const tokens: Array<HighlightToken> = [
      { value: 'ab\ncd', className: 'string' },
      { value: '\n' },
      { value: 'ef', className: 'keyword' },
    ]
    const nodes = renderTokens(tokens, {
      lineNumbers: true,
      decorations: [
        { range: [1, 7], className: 'outer' },
        { range: [4, 8], className: 'inner' },
        { lines: [2, 3], className: 'focus' },
      ],
    })
    expect(textContent(nodes)).toBe('ab\ncd\nef')
    expect(renderNodesToHtml(nodes)).toBe(
      '<span class="th-line" data-line="1"><span class="th-token th-string">a</span><span class="th-decoration outer"><span class="th-token th-string">b</span></span></span>\n' +
      '<span class="th-line focus" data-line="2"><span class="th-decoration outer"><span class="th-token th-string">c</span></span><span class="th-decoration inner"><span class="th-decoration outer"><span class="th-token th-string">d</span></span></span></span>\n' +
      '<span class="th-line focus" data-line="3"><span class="th-decoration inner"><span class="th-decoration outer"><span class="th-token th-keyword">e</span></span></span><span class="th-decoration inner"><span class="th-token th-keyword">f</span></span></span>',
    )
  })

  it('visits tokens in order instead of rescanning them for every line', () => {
    let reads = 0
    const code = 'one\ntwo\n'.repeat(200)
    const tokens = Array.from(code, (value) => ({
      get value() { reads++; return value },
    }))
    expect(textContent(renderTokens(tokens, { lineNumbers: true }))).toBe(code)
    expect(reads).toBeLessThan(code.length * 8)
  })

  it('escapes source text and public render node attributes', () => {
    expect(escapeHtml(`&<>"' &amp; 😀`)).toBe('&amp;&lt;&gt;&quot;&#39; &amp;amp; 😀')
    expect(renderNodesToHtml([{
      type: 'element',
      classNames: ['one', '"><img>'],
      data: { 'label onclick': '"<unsafe>', camelCase: '&' },
      children: [{ type: 'text', value: '<script>' }],
    }])).toBe('<span class="one &quot;&gt;&lt;img&gt;" data-label-onclick="&quot;&lt;unsafe&gt;" data-camel-case="&amp;">&lt;script&gt;</span>')
  })
})

describe('custom token ranges', () => {
  it('sorts, clamps and removes overlapping ranges without mutating them', () => {
    const ranges = Object.freeze([
      Object.freeze({ start: 4, end: 20, className: 'string' as const }),
      Object.freeze({ start: -2, end: 2, className: 'keyword' as const }),
      Object.freeze({ start: 1, end: 3, className: 'number' as const }),
    ])
    const highlighter = createHighlighter({
      languages: [{ name: 'custom', tokenize: () => ranges }],
    })
    expect(highlighter.tokenize('abcdef', { lang: 'custom' }).tokens).toEqual([
      { className: 'keyword', value: 'ab' },
      { value: 'cd' },
      { className: 'string', value: 'ef' },
    ])
  })

  it('ignores invalid offsets so custom languages cannot duplicate source text', () => {
    const ranges: Array<TokenRange> = [
      { start: 0, end: NaN, className: 'string' },
      { start: 0.5, end: 2.5, className: 'number' },
      { start: Infinity, end: Infinity, className: 'comment' },
      { start: 2, end: 4, className: 'keyword' },
    ]
    const highlighter = createHighlighter({
      languages: [{ name: 'custom', tokenize: () => ranges }],
    })
    const result = highlighter.tokenize('abcdef', { lang: 'custom' })
    expect(result.tokens).toEqual([
      { value: 'ab' },
      { className: 'keyword', value: 'cd' },
      { value: 'ef' },
    ])
  })
})
