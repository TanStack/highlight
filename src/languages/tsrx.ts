import { defineLanguage } from '../core.js'
import { collectPatternRanges } from '../internal/patterns.js'
import { collectScriptRanges } from '../internal/script.js'

const templateDirectives = new Set([
  '@catch',
  '@case',
  '@default',
  '@else',
  '@empty',
  '@for',
  '@if',
  '@pending',
  '@switch',
  '@try',
])

export const tsrx = defineLanguage({
  name: 'tsrx',
  aliases: ['octane'],
  tokenize(code) {
    const ranges = collectScriptRanges(code, true, true)
    for (const range of ranges) {
      if (
        range.className === 'function' &&
        templateDirectives.has(code.slice(range.start, range.end))
      ) range.className = 'keyword'
    }

    return collectPatternRanges(code, [{ className: 'keyword', regex: /@\{/g }], ranges)
  },
})
