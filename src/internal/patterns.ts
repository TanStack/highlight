import type {
  HighlightTokenClass,
  TokenRange,
} from '../core.js'

export type Pattern =
  | {
      className:
        | HighlightTokenClass
        | ((match: RegExpExecArray) => HighlightTokenClass)
      group?: number
      regex: RegExp
    }
  | {
      collect: (code: string) => ReadonlyArray<TokenRange>
    }

export function patternTokenizer(patterns: ReadonlyArray<Pattern>) {
  return (code: string) => collectPatternRanges(code, patterns)
}

export function collectPatternRanges(
  code: string,
  patterns: ReadonlyArray<Pattern>,
  initial: ReadonlyArray<TokenRange> = [],
) {
  const ranges: Array<TokenRange> = [...initial]
  const occupied = new Uint8Array(code.length)
  for (const range of initial) occupied.fill(1, range.start, range.end)

  for (const pattern of patterns) {
    if ('collect' in pattern) {
      for (const range of pattern.collect(code)) addRange(ranges, occupied, range)
      continue
    }

    const regex = cloneRegex(pattern.regex)
    let match: RegExpExecArray | null
    while ((match = regex.exec(code))) {
      const value = pattern.group ? match[pattern.group] : match[0]
      if (!value) {
        if (!match[0].length) regex.lastIndex++
        continue
      }

      const offset = pattern.group ? match[0].indexOf(value) : 0
      const start = match.index + offset
      addRange(ranges, occupied, {
        start,
        end: start + value.length,
        className:
          typeof pattern.className === 'function'
            ? pattern.className(match)
            : pattern.className,
      })
    }
  }

  return ranges
}

export function offsetRanges(
  ranges: ReadonlyArray<TokenRange>,
  offset: number,
) {
  return ranges.map((range) => ({
    ...range,
    start: range.start + offset,
    end: range.end + offset,
  }))
}

export function addRange(
  ranges: Array<TokenRange>,
  occupied: Uint8Array,
  range: TokenRange,
) {
  if (
    range.start >= range.end ||
    range.start < 0 ||
    range.end > occupied.length ||
    hasOverlap(occupied, range.start, range.end)
  ) {
    return false
  }

  ranges.push(range)
  occupied.fill(1, range.start, range.end)
  return true
}

function cloneRegex(regex: RegExp) {
  return new RegExp(
    regex.source,
    regex.flags.includes('g') ? regex.flags : `${regex.flags}g`,
  )
}

function hasOverlap(occupied: Uint8Array, start: number, end: number) {
  for (let index = start; index < end; index++) {
    if (occupied[index]) return true
  }
  return false
}
