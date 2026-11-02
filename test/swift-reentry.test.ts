import { expect, test } from 'vitest'
import { createHighlighter } from '../src/core'
import { swift } from '../src/languages/swift'

test('keeps Swift string boundaries stable when regex instrumentation reenters tokenization', () => {
  const highlighter = createHighlighter({ languages: [swift] })
  const outerCode = '/* outer */ let message = "text"; print(message);'
  const innerCode = '/* inner */ let nested = "different value"; print(nested);'
  const expectedOuter = highlighter.tokenize(outerCode, { lang: 'swift' })
  const expectedInner = highlighter.tokenize(innerCode, { lang: 'swift' })
  const nested: Array<typeof expectedInner> = []
  const original = RegExp.prototype.exec
  let busy = false
  let actual: typeof expectedOuter | undefined
  try {
    RegExp.prototype.exec = function (code: string) {
      const match = original.call(this, code)
      if (match && code === outerCode && !busy) {
        busy = true
        try { nested.push(highlighter.tokenize(innerCode, { lang: 'swift' })) }
        finally { busy = false }
      }
      return match
    }
    actual = highlighter.tokenize(outerCode, { lang: 'swift' })
  } finally { RegExp.prototype.exec = original }
  expect(nested.length).toBeGreaterThan(0)
  expect(actual).toEqual(expectedOuter)
  for (const result of nested) expect(result).toEqual(expectedInner)
  expect(highlighter.tokenize(outerCode, { lang: 'swift' })).toEqual(expectedOuter)
})
