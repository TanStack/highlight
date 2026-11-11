import type { HighlightTokenClass, HighlightToken, HighlightOptions, HighlightRangeDecoration, HighlightLineDecoration, HighlightDecorationData } from '../core.js'

export type RenderTarget<T> = {
  text: (value: string) => T
  token: (className: HighlightTokenClass, child: T) => T
  element: (classNames: Array<string>, data: Record<string, string> | undefined, children: Array<T>) => T
}

export function renderTokenOutput<T>(
  tokens: ReadonlyArray<HighlightToken>,
  options: Pick<HighlightOptions, 'decorations' | 'lineNumbers'>,
  renderer: RenderTarget<T>,
): Array<T> {
  const rangeDecorations: Array<HighlightRangeDecoration> = []
  const lineDecorations: Array<HighlightLineDecoration> = []
  for (const decoration of options.decorations || []) {
    if (!decoration.range) {
      lineDecorations.push(decoration)
      continue
    }
    const [start, end] = decoration.range
    if (hasIntegerOffsets(start, end) && start < end) rangeDecorations.push(decoration)
  }
  const cursor = { index: 0, offset: 0, boundaries: [0, 0] }

  if (!options.lineNumbers && !lineDecorations.length) {
    return renderTokenSlice(tokens, 0, Infinity, rangeDecorations, cursor, renderer)
  }

  const code = tokens.map((token) => token.value).join('')
  const nodes: Array<T> = []
  let start = 0

  for (let line = 1; ; line++) {
    const newline = code.indexOf('\n', start)
    const end = newline < 0 ? code.length : newline
    const active = lineDecorations.filter((decoration) =>
      includesLine(decoration.lines, line),
    )

    nodes.push(renderer.element([
      'th-line',
      ...active.flatMap((decoration) => splitClassNames(decoration.className)),
    ], lineData(active, line),
      renderTokenSlice(tokens, start, end, rangeDecorations, cursor, renderer),
    ))

    if (newline < 0) break
    nodes.push(renderer.text('\n'))
    start = end + 1
    if (start === code.length) break
  }

  return nodes
}

function renderTokenSlice<T>(
  tokens: ReadonlyArray<HighlightToken>,
  start: number,
  end: number,
  decorations: ReadonlyArray<HighlightRangeDecoration>,
  cursor: { index: number; offset: number; boundaries: Array<number> },
  renderer: RenderTarget<T>,
) {
  const nodes: Array<T> = []

  for (; cursor.index < tokens.length; cursor.index++) {
    const token = tokens[cursor.index]
    const tokenStart = cursor.offset
    const tokenEnd = tokenStart + token.value.length
    const sliceStart = Math.max(start, tokenStart)
    const sliceEnd = Math.min(end, tokenEnd)

    if (sliceStart < sliceEnd) {
      let sorted = cursor.boundaries
      sorted[0] = sliceStart
      sorted[1] = sliceEnd
      let boundaries: Set<number> | undefined
      for (const decoration of decorations) {
        const [decorationStart, decorationEnd] = decoration.range
        if (decorationEnd <= sliceStart || decorationStart >= sliceEnd) continue
        boundaries ||= new Set(sorted)
        boundaries.add(Math.max(sliceStart, decorationStart)).add(Math.min(sliceEnd, decorationEnd))
      }
      if (boundaries) sorted = [...boundaries].sort((a, b) => a - b)

      for (let index = 0; index < sorted.length - 1; index++) {
        const segmentStart = sorted[index]
        const segmentEnd = sorted[index + 1]
        let node = renderer.text(token.value.slice(
          segmentStart - tokenStart,
          segmentEnd - tokenStart,
        ))

        if (token.className) {
          node = renderer.token(token.className, node)
        }

        for (const decoration of decorations) {
          if (
            decoration.range[0] > segmentStart ||
            decoration.range[1] < segmentEnd
          ) continue
          node = renderer.element(['th-decoration', ...splitClassNames(decoration.className)], stringifyData(decoration.data), [node])
        }

        nodes.push(node)
      }
    }

    // Keep a token that crosses the line boundary for the next slice.
    if (tokenEnd > end) break
    cursor.offset = tokenEnd
  }

  return nodes
}

function includesLine(
  lines: number | readonly [start: number, end: number],
  line: number,
) {
  return typeof lines === 'number'
    ? lines === line
    : line >= lines[0] && line <= lines[1]
}

function lineData(decorations: ReadonlyArray<HighlightLineDecoration>, line: number) {
  const data = Object.fromEntries(decorations.flatMap((decoration) => dataEntries(decoration.data)))
  data.line = String(line)
  return data
}

function stringifyData(data?: HighlightDecorationData) {
  if (data) return Object.fromEntries(dataEntries(data))
}

function dataEntries(data?: HighlightDecorationData) {
  return Object.entries(data || {}).map(([key, value]) => [normalizeDataKey(key), String(value)] as const)
}

export function normalizeDataKey(value: string) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`).replace(/[^a-z0-9_.:-]/gi, '-')
}

function splitClassNames(className?: string) {
  return className?.match(/\S+/g) || []
}

export function hasIntegerOffsets(start: number, end: number) {
  return Number.isInteger(start) && Number.isInteger(end)
}
