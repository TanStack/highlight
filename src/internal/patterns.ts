import type { HighlightTokenClass, TokenRange } from '../core.js'

export type Pattern =
  | readonly [
      regex: RegExp,
      className: HighlightTokenClass | ((match: RegExpExecArray) => HighlightTokenClass),
      // Captured tokens must end at the end of the full match.
      group?: number,
    ]
  | ((code: string) => ReadonlyArray<TokenRange>)

export function patternTokenizer(patterns: ReadonlyArray<Pattern>) {
  return (code: string) => collectPatternRanges(code, patterns)
}

export function collectPatternRanges(
  code: string,
  patterns: ReadonlyArray<Pattern>,
  initial: ReadonlyArray<TokenRange> = [],
  occupied = new Uint8Array(code.length),
  // Internal lexical passes can supply a fresh owned output array.
  ranges: Array<TokenRange> = [...initial],
) {
  for (const range of initial) occupied.fill(1, range.start, range.end)
  for (const pattern of patterns) {
    if (typeof pattern === 'function') {
      for (const range of pattern(code)) addRange(ranges, occupied, range)
      continue
    }
    const regex = globalRegex(pattern[0])
    const className = pattern[1]
    const group = pattern[2] || 0
    const previousLastIndex = regex.lastIndex
    regex.lastIndex = 0
    try {
      let match: RegExpExecArray | null
      while ((match = regex.exec(code))) {
        const value = match[group]
        if (!value) {
          if (!match[0]) regex.lastIndex += code.codePointAt(regex.lastIndex)! > 0xffff && /[uv]/.test(regex.flags) ? 2 : 1
          continue
        }
        const offset = group ? match[0].length - value.length : 0
        const start = match.index + offset
        addRange(ranges, occupied, {
          start,
          end: start + value.length,
          className: typeof className === 'function' ? className(match) : className,
        })
      }
    } finally {
      regex.lastIndex = previousLastIndex
    }
  }
  return ranges
}

export function offsetRanges(ranges: ReadonlyArray<TokenRange>, offset: number) {
  return ranges.map((range) => ({ ...range, start: range.start + offset, end: range.end + offset }))
}

export function addRange(ranges: Array<TokenRange>, occupied: Uint8Array, range: TokenRange) {
  if (range.start >= range.end || range.start < 0 || range.end > occupied.length || hasOverlap(occupied, range.start, range.end)) return false
  ranges.push(range)
  occupied.fill(1, range.start, range.end)
  return true
}

function globalRegex(regex: RegExp) {
  return regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`)
}

function hasOverlap(occupied: Uint8Array, start: number, end: number) {
  for (let index = start; index < end; index++) if (occupied[index]) return true
  return false
}
