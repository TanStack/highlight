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
    if (decoration.range) rangeDecorations.push(decoration)
    else lineDecorations.push(decoration)
  }
  const wrapLines = Boolean(options.lineNumbers || lineDecorations.length)
  const cursor = { index: 0, offset: 0, boundaries: [0, 0] }

  if (!wrapLines) {
    return renderTokenSlice(tokens, 0, Infinity, rangeDecorations, cursor, renderer)
  }

  const code = tokens.map((token) => token.value).join('')
  const nodes: Array<T> = []
  const lineStarts = getLineStarts(code)

  for (let index = 0; index < lineStarts.length; index++) {
    const line = index + 1
    const start = lineStarts[index]
    const nextStart = lineStarts[index + 1] ?? code.length
    const hasNewline = nextStart > start && code[nextStart - 1] === '\n'
    const end = hasNewline ? nextStart - 1 : nextStart
    const active = lineDecorations.filter((decoration) =>
      includesLine(decoration.lines, line),
    )

    nodes.push(renderer.element([
      'th-line',
      ...active.flatMap((decoration) => splitClassNames(decoration.className)),
    ], { ...mergeData(active), line: String(line) },
      renderTokenSlice(tokens, start, end, rangeDecorations, cursor, renderer),
    ))

    if (hasNewline) nodes.push(renderer.text('\n'))
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

function getLineStarts(code: string) {
  const starts = [0]
  for (let index = code.indexOf('\n'); index >= 0 && index + 1 < code.length; index = code.indexOf('\n', index + 1)) {
    starts.push(index + 1)
  }
  return starts
}

function includesLine(
  lines: number | readonly [start: number, end: number],
  line: number,
) {
  return typeof lines === 'number'
    ? lines === line
    : line >= lines[0] && line <= lines[1]
}

function mergeData(decorations: ReadonlyArray<HighlightLineDecoration>) {
  const data: Record<string, string> = {}
  for (const decoration of decorations) {
    Object.assign(data, stringifyData(decoration.data))
  }
  return data
}

function stringifyData(data?: HighlightDecorationData) {
  if (!data) return undefined
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      normalizeDataKey(key),
      String(value),
    ]),
  )
}

export function normalizeDataKey(value: string) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`).replace(/[^a-z0-9_.:-]/gi, '-')
}

function splitClassNames(className?: string) {
  return className?.trim().split(/\s+/).filter(Boolean) || []
}
