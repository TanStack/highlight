import { expect, it } from 'vitest'
import { js } from '../src/languages/js'
import { jsx } from '../src/languages/jsx'
import { ts } from '../src/languages/ts'
import { tsx } from '../src/languages/tsx'

it.each([js, ts, jsx, tsx])('handles a large $name template interpolation without an argument limit', (language) => {
  const length = 140_000
  const prefix = '`value ${'
  const expression = Array.from({ length }, (_, index) => index).join('+')
  const code = prefix + expression + '}`'
  const ranges = language.tokenize(code, {
    hasLanguage: () => false,
    tokenize: () => [],
  })

  expect(ranges).toHaveLength(length + 4)
  expect(ranges[2]).toEqual({
    start: prefix.length,
    end: prefix.length + 1,
    className: 'number',
  })
  expect(ranges[length + 1]).toEqual({
    start: prefix.length + expression.length - String(length - 1).length,
    end: prefix.length + expression.length,
    className: 'number',
  })
  expect(ranges[length + 2]).toEqual({
    start: code.length - 2,
    end: code.length - 1,
    className: 'operator',
  })
  expect(ranges[length + 3]).toEqual({
    start: code.length - 1,
    end: code.length,
    className: 'string',
  })
})
