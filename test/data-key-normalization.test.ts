import { expect, it } from 'vitest'
import { renderNodesToHtml, renderTokens, type HighlightRenderNode } from '../src/core'

it('keeps canonical data keys from disturbing later native capture observers', () => {
  const observations: Array<string> = []
  const nodes: Array<HighlightRenderNode> = [
    { type: 'element', classNames: ['th-line'], data: { line: '1' }, children: [{ type: 'text', value: 'x' }] },
    {
      type: 'element',
      get classNames() {
        observations.push(RegExp.$1)
        return [RegExp.$1]
      },
      children: [],
    },
  ]
  /(seed)/.test('seed')
  const html = renderNodesToHtml(nodes)
  expect(observations).toEqual(['seed'])
  expect(html).toBe('<span class="th-line" data-line="1">x</span><span class="seed"></span>')
})

it('keeps mixed case, unsafe and canonical decoration keys distinct', () => {
  const output = renderNodesToHtml(renderTokens([{ value: 'x' }], {
    decorations: [{ range: [0, 1], data: { line: '3', Line: '4', 'unsafe<>': '<&"' } }],
  }))
  expect(output).toBe('<span class="th-decoration" data-line="3" data--line="4" data-unsafe--="&lt;&amp;&quot;">x</span>')
})
