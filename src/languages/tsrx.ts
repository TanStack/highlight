import { defineLanguage, type TokenRange } from '../core.js'
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
    const ranges: Array<TokenRange> = collectScriptRanges(code, true, true).map(
      (range): TokenRange =>
        range.className === 'function' &&
        templateDirectives.has(code.slice(range.start, range.end))
          ? { ...range, className: 'keyword' }
          : range,
    )
    const shorthand = /@\{/g
    let match: RegExpExecArray | null

    while ((match = shorthand.exec(code))) {
      const range: TokenRange = {
        start: match.index,
        end: match.index + match[0].length,
        className: 'keyword',
      }

      if (!ranges.some((candidate) => overlaps(candidate, range))) {
        ranges.push(range)
      }
    }

    return ranges
  },
})

function overlaps(left: TokenRange, right: TokenRange) {
  return left.start < right.end && right.start < left.end
}
