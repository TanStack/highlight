import { expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { patternTokenizer } from '../src/internal/patterns'

const modes = ['gu', 'guy']
try {
  new RegExp('', 'v')
  modes.push('gv')
} catch {
  // Older supported engines do not implement Unicode sets.
}

it.each(modes)('finishes empty Unicode patterns in %s mode and restores their cursor', (flags) => {
  for (const code of ['😀', 'a😀b', '\ud800x', '\udc00', '']) {
    const regex = new RegExp('(?:)', flags)
    const exec = regex.exec.bind(regex)
    let executions = 0
    let classifications = 0
    regex.exec = (source) => {
      if (++executions > code.length + 2) {
        throw new Error('Empty Unicode pattern did not advance')
      }
      return exec(source)
    }
    regex.lastIndex = 7
    const highlighter = createHighlighter({
      languages: [{
        name: 'empty-unicode',
        tokenize: patternTokenizer([[regex, () => {
          classifications++
          return 'string'
        }]]),
      }],
    })

    const result = highlighter.highlight(code, { lang: 'empty-unicode' })
    expect(result.tokens.map((token) => token.value).join('')).toBe(code)
    expect(result.tokens.every((token) => !token.className)).toBe(true)
    expect(classifications).toBe(0)
    expect(regex.lastIndex).toBe(7)
  }
})
