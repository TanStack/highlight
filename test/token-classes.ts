import { expect } from 'vitest'
import type { Highlighter } from '../src/core'

// Returns the classes of every token overlapping the first occurrence of `text`.
export function tokenClasses(
  highlighter: Highlighter,
  code: string,
  text: string,
  lang: string,
) {
  const result = highlighter.tokenize(code, { lang })
  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  const start = code.indexOf(text)
  expect(start).toBeGreaterThanOrEqual(0)
  let offset = 0
  return result.tokens.flatMap((token) => {
    const from = offset
    offset += token.value.length
    return from < start + text.length && offset > start ? [token.className] : []
  })
}
