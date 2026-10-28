import type { Pattern } from './patterns.js'
import type { TokenRange } from '../core.js'

// Scan each statement once, so selector lookahead cannot repeatedly scan a
// long unfinished stylesheet. Comments and strings are shielded first.
export const stylesheetWords: Pattern = {
  collect(code) {
    const ranges: Array<TokenRange> = []
    for (const statement of code.matchAll(/[^{};]+/g)) {
      const start = statement.index
      const value = statement[0]
      if (code[start + value.length] === '{') {
        for (const selector of value.matchAll(/[.#][A-Za-z_][\w-]*/g)) {
          ranges.push({ start: start + selector.index, end: start + selector.index + selector[0].length, className: 'selector' })
        }
      } else {
        const property = /^\s*([\w-]+)\s*:(?!:)/.exec(value)
        if (property) {
          const offset = start + value.indexOf(property[1])
          ranges.push({ start: offset, end: offset + property[1].length, className: 'property' })
        }
      }
    }
    return ranges
  },
}
