import { expect, test } from 'vitest'
import { createHighlighter } from '../src/core'
import { swift } from '../src/languages/swift'

test('keeps Swift string boundaries stable when instrumentation reenters before exec', () => {
  const highlighter = createHighlighter({ languages: [swift] })
  const outerCode = '/* outer */ let message = "text"; print(message);'
  const innerCode = '/* inner */ let nested = "different value"; print(nested);'
  const expectedOuter = highlighter.tokenize(outerCode, { lang: 'swift' })
  const expectedInner = highlighter.tokenize(innerCode, { lang: 'swift' })
  const nested: Array<typeof expectedInner> = []
  const original = RegExp.prototype.exec
  let busy = false
  let calls = 0
  let actual: typeof expectedOuter | undefined
  try {
    RegExp.prototype.exec = function (code: string) {
      if (code === outerCode && !busy) {
        if (++calls > 256) throw new Error('Swift regex cursor did not advance')
        busy = true
        try { nested.push(highlighter.tokenize(innerCode, { lang: 'swift' })) }
        finally { busy = false }
      }
      return original.call(this, code)
    }
    actual = highlighter.tokenize(outerCode, { lang: 'swift' })
  } finally { RegExp.prototype.exec = original }
  expect(nested.length).toBeGreaterThan(0)
  expect(actual).toEqual(expectedOuter)
  for (const result of nested) expect(result).toEqual(expectedInner)
  expect(highlighter.tokenize(outerCode, { lang: 'swift' })).toEqual(expectedOuter)
})
