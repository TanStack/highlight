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
      const highlighter = createHighlighter({ languages: [{
        name: 'lines',
        tokenize: () => [{ start: 0, end: code.length, className: 'string' }],
      }] })
      expect(highlighter.highlight(code, { lang: 'lines', lineNumbers: true }).html).toBe(
        `<pre class="th-code th-code--lines th-code--line-numbers" data-language="lines"><code>${renderNodesToHtml(nodes)}</code></pre>`,
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

  it('keeps absent and explicitly undefined node data distinct', () => {
    const nodes = renderTokens([{ value: 'x', className: 'string' }], {
      decorations: [{ range: [0, 1] }],
    })
    const decoration = nodes[0]
    if (decoration.type !== 'element') throw new Error('Expected a decoration')
    expect(Object.keys(decoration)).toEqual(['type', 'classNames', 'data', 'children'])
    expect(decoration.data).toBeUndefined()
    expect(Object.keys(decoration.children[0])).toEqual(['type', 'classNames', 'children'])
  })

  it('escapes decorated HTML text, token classes and attributes', () => {
    const code = `<&"'`
    const highlighter = createHighlighter({ languages: [{
      name: 'unsafe',
      tokenize: () => [{ start: 0, end: code.length, className: '"><img>' as TokenRange['className'] }],
    }] })
    expect(highlighter.highlight(code, {
      lang: 'unsafe',
      lineNumbers: true,
      decorations: [{ range: [0, code.length], className: 'focus "><svg>', data: {
        'label onclick': '"<unsafe>', camelCase: '&',
      } }],
    }).html).toBe(
      '<pre class="th-code th-code--unsafe th-code--line-numbers" data-language="unsafe"><code>' +
      '<span class="th-line" data-line="1">' +
      '<span class="th-decoration focus &quot;&gt;&lt;svg&gt;" data-label-onclick="&quot;&lt;unsafe&gt;" data-camel-case="&amp;">' +
      '<span class="th-token th-&quot;&gt;&lt;img&gt;">&lt;&amp;&quot;&#39;</span>' +
      '</span></span></code></pre>',
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

  it('keeps the first range when different starts clamp to the same offset', () => {
    const ranges = Object.freeze([
      Object.freeze({ start: -1, end: 2, className: 'string' as const }),
      Object.freeze({ start: -5, end: 3, className: 'keyword' as const }),
      Object.freeze({ start: 4, end: 20, className: 'number' as const }),
      Object.freeze({ start: 2, end: 4, className: 'comment' as const }),
      Object.freeze({ start: 2, end: 3, className: 'keyword' as const }),
    ])
    const highlighter = createHighlighter({
      languages: [{ name: 'custom', tokenize: () => ranges }],
    })
    expect(highlighter.tokenize('abcdef', { lang: 'custom' }).tokens).toEqual([
      { className: 'string', value: 'ab' },
      { className: 'comment', value: 'cd' },
      { className: 'number', value: 'ef' },
    ])
    expect(ranges.map((range) => range.start)).toEqual([-1, -5, 4, 2, 2])
  })

  it.each(['', 'abc'])('keeps a plain token when every range is invalid for %j', (code) => {
    const highlighter = createHighlighter({
      languages: [{
        name: 'custom',
        tokenize: () => [
          { start: 0, end: 0, className: 'string' },
          { start: -5, end: -1, className: 'comment' },
          { start: 1, end: NaN, className: 'number' },
          { start: 20, end: 30, className: 'keyword' },
        ],
      }],
    })
    expect(highlighter.tokenize(code, { lang: 'custom' }).tokens).toEqual([{ value: code }])
  })

  it('gives embedded tokenizers independent sorted and clamped ranges', () => {
    const ranges = Object.freeze([
      Object.freeze({ start: 4, end: 20, className: 'string' as const }),
      Object.freeze({ start: -2, end: 2, className: 'keyword' as const }),
      Object.freeze({ start: 1, end: 3, className: 'number' as const }),
    ])
    const highlighter = createHighlighter({
      languages: [
        { name: 'inner', tokenize: () => ranges },
        {
          name: 'outer',
          tokenize(code, context) {
            const first = context.tokenize(code, 'inner')
            expect(first).toEqual([
              { start: 0, end: 2, className: 'keyword' },
              { start: 4, end: 6, className: 'string' },
            ])
            first[0].className = 'comment'
            first[0].end = 1
            const second = context.tokenize(code, 'inner')
            expect(second[0]).toEqual({ start: 0, end: 2, className: 'keyword' })
            return first
          },
        },
      ],
    })
    expect(highlighter.tokenize('abcdef', { lang: 'outer' }).tokens).toEqual([
      { className: 'comment', value: 'a' },
      { value: 'bcd' },
      { className: 'string', value: 'ef' },
    ])
    expect(highlighter.tokenize('abcdef', { lang: 'inner' }).tokens[0]).toEqual({
      className: 'keyword', value: 'ab',
    })
  })

  it('normalizes negative zero before returning embedded ranges', () => {
    const highlighter = createHighlighter({
      languages: [
        { name: 'inner', tokenize: () => [{ start: -0, end: 1, className: 'string' }] },
        {
          name: 'outer',
          tokenize(code, context) {
            const ranges = context.tokenize(code, 'inner')
            expect(Object.is(ranges[0].start, -0)).toBe(false)
            return ranges
          },
        },
      ],
    })
    expect(highlighter.tokenize('ab', { lang: 'outer' }).tokens).toEqual([
      { className: 'string', value: 'a' }, { value: 'b' },
    ])
  })

})

it('keeps live decoration reads in segmentation order', () => {
  let armed = false
  let reads = 0
  const decoration = {
    get range() { return !armed ? [0, 2] as const : ++reads === 1 ? [0, 1] as const : [1, 2] as const },
    className: 'live',
  }
  const nodes = renderTokens([{ get value() { armed = true; return 'a' } }, { value: 'b' }], { decorations: [decoration] })
  expect(renderNodesToHtml(nodes)).toBe('a<span class="th-decoration live">b</span>')
  expect(reads).toBe(5)
})

it('keeps boundary edges private when a range getter renders recursively', () => {
  let inner = ''
  const decoration = {
    get range() {
      inner = renderNodesToHtml(renderTokens([{ value: 'x', className: 'keyword' }]))
      return [1, 5] as const
    },
    className: 'focus',
  }
  const nodes = renderTokens([{ value: 'abcdef', className: 'string' }], { decorations: [decoration] })
  expect(inner).toBe('<span class="th-token th-keyword">x</span>')
  expect(renderNodesToHtml(nodes)).toBe('<span class="th-token th-string">a</span><span class="th-decoration focus"><span class="th-token th-string">bcde</span></span><span class="th-token th-string">f</span>')
})

it('normalizes decoration keys before direct HTML emission', () => {
  const data = Object.fromEntries([['camelCase', '<&'], ['A\0B', '"'], ['Kſİ😀', "'"], ['__proto__', 'own']])
  const options = { lineNumbers: true, decorations: [{ range: [0, 1] as const, className: 'focus', data }, { lines: 1, data: { lineCamelCase: '<&' } }] }
  const expected = renderNodesToHtml(renderTokens([{ value: 'x' }], options))
  const highlighter = createHighlighter({ languages: [] })
  expect(highlighter.highlight('x', options).html).toBe(`<pre class="th-code th-code--plaintext th-code--line-numbers" data-language="plaintext"><code>${expected}</code></pre>`)
  expect(expected).toContain('data-camel-case="&lt;&amp;"')
  expect(expected).toContain('data-line-camel-case="&lt;&amp;"')
  expect(expected).toContain('data--a--b="&quot;"')
  expect(expected).toContain('data------="&#39;"')
  expect(expected).toContain('data-__proto__="own"')
})


it('snapshots range classes before inspecting later ranges', () => {
  const later = { start: 3, end: 6, className: 'string' as const }
  const highlighter = createHighlighter({ languages: [{ name: 'live-ranges', tokenize: () => [
    { start: 0, end: 1, get className() { later.end = 2; return 'keyword' as const } }, later,
  ] }] })
  const result = highlighter.highlight('abcdef', { lang: 'live-ranges' })
  expect(result.tokens).toEqual([{ className: 'keyword', value: 'a' }, { value: 'bcdef' }])
  expect(result.tokens.map(token => token.value).join('')).toBe('abcdef')
})

it('reads each range class once before a later getter mutates the original range', () => {
  let reads = 0
  const first = { start: 0, end: 1, get className() { reads++; return 'keyword' as const } }
  const highlighter = createHighlighter({ languages: [{ name: 'live-ranges', tokenize: () => [first,
    { start: 3, end: 6, get className() { first.end = 0; return 'string' as const } },
  ] }] })
  expect(highlighter.tokenize('abcdef', { lang: 'live-ranges' }).tokens).toEqual([
    { className: 'keyword', value: 'a' }, { value: 'bc' }, { className: 'string', value: 'def' },
  ])
  expect(reads).toBe(1)
})
