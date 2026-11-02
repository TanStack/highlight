import { expect, test } from 'vitest'
import { createHighlighter } from '../src/core'
import { glsl } from '../src/languages/glsl'

test('keeps the optional lexical cursor moving when regex instrumentation reenters tokenization', () => {
  const highlighter = createHighlighter({ languages: [glsl] })
  const outer = '/* outer */ float value = 1.0; // done'
  const inner = '/* inner */ float nested = 2.0; // done'
  const expected = highlighter.tokenize(outer, { lang: 'glsl' })
  const expectedInner = highlighter.tokenize(inner, { lang: 'glsl' })
  const nested: Array<typeof expectedInner> = []
  const original = RegExp.prototype.exec
  let busy = false
  let calls = 0
  let actual: typeof expected | undefined
  try {
    RegExp.prototype.exec = function (code: string) {
      const match = original.call(this, code)
      if (match && code === outer && !busy) {
        // Bound the negative control so a stuck cached cursor fails without hanging Vitest.
        if (++calls > 256) throw new Error('Optional lexical cursor did not advance')
        busy = true
        try { nested.push(highlighter.tokenize(inner, { lang: 'glsl' })) }
        finally { busy = false }
      }
      return match
    }
    actual = highlighter.tokenize(outer, { lang: 'glsl' })
  } finally { RegExp.prototype.exec = original }
  expect(nested.length).toBeGreaterThan(0)
  expect(actual).toEqual(expected)
  for (const tokens of nested) expect(tokens).toEqual(expectedInner)
  expect(highlighter.tokenize(outer, { lang: 'glsl' })).toEqual(expected)
})
