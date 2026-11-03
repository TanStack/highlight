import { expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { scss } from '../src/languages/scss'
import { less } from '../src/languages/less'

it.each([scss, less].flatMap(language => [
  { language, matcher: '[^{};]+' },
  { language, matcher: '[.#][A-Za-z_][\\w-]*' },
]))('keeps $language.name cursors isolated during nested $matcher matching', ({ language, matcher }) => {
  const highlighter = createHighlighter({ languages: [language] })
  const code = '.outer #id { color: red; }'
  const expected = highlighter.highlight(code, { lang: language.name })
  expect(expected.tokens.filter(token => token.className).map(token => [token.value, token.className])).toEqual([
    ['.outer', 'selector'], ['#id', 'selector'], ['color', 'property'],
  ])
  const original = RegExp.prototype.exec
  let nested = false
  let inside = false
  RegExp.prototype.exec = function (input: string) {
    const match = Reflect.apply(original, this, [input])
    if (!inside && !nested && this.source === matcher && match?.index === 0) {
      inside = true
      try {
        const result = highlighter.highlight('.inner { width: 2px; }', { lang: language.name })
        expect(result.tokens.map(token => token.value).join('')).toBe('.inner { width: 2px; }')
        nested = true
      } finally {
        inside = false
      }
    }
    return match
  }
  try {
    expect(highlighter.highlight(code, { lang: language.name })).toEqual(expected)
    expect(nested).toBe(true)
  } finally {
    RegExp.prototype.exec = original
  }
})
