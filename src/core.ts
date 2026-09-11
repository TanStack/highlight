export type HighlightTokenClass =
  | 'attr'
  | 'code-inline'
  | 'command'
  | 'comment'
  | 'deleted'
  | 'function'
  | 'heading'
  | 'inserted'
  | 'keyword'
  | 'link'
  | 'literal'
  | 'meta'
  | 'number'
  | 'operator'
  | 'property'
  | 'selector'
  | 'string'
  | 'tag'
  | 'type'
  | 'variable'

export type HighlightToken = {
  className?: HighlightTokenClass
  value: string
}

export type TokenRange = {
  className: HighlightTokenClass
  end: number
  start: number
}

export type TokenizerContext = {
  hasLanguage: (lang: string) => boolean
  tokenize: (code: string, lang: string) => Array<TokenRange>
}

export type LanguageDefinition<Name extends string = string> = {
  aliases?: ReadonlyArray<string>
  name: Name
  tokenize: (
    code: string,
    context: TokenizerContext,
  ) => ReadonlyArray<TokenRange>
}

export type HighlightDecorationData = Record<
  string,
  boolean | number | string
>

type DecorationBase = {
  className?: string
  data?: HighlightDecorationData
}

export type HighlightRangeDecoration = DecorationBase & {
  lines?: never
  range: readonly [start: number, end: number]
}

export type HighlightLineDecoration = DecorationBase & {
  lines: number | readonly [start: number, end: number]
  range?: never
}

export type HighlightDecoration =
  | HighlightLineDecoration
  | HighlightRangeDecoration

export type HighlightOptions = {
  decorations?: ReadonlyArray<HighlightDecoration>
  lang?: string
  lineNumbers?: boolean
}

export type HighlightTokenResult = {
  code: string
  lang: string
  tokens: Array<HighlightToken>
}

export type HighlightResult = HighlightTokenResult & {
  html: string
}

export type RenderCodeBlockOptions = HighlightOptions & {
  title?: string
}

export type RenderedCodeBlockData = {
  copyText: string
  htmlMarkup: string
  lang: string
  title?: string
  tokens: Array<HighlightToken>
}

export type HighlightTextNode = {
  type: 'text'
  value: string
}

export type HighlightElementNode = {
  children: Array<HighlightRenderNode>
  classNames: Array<string>
  data?: Record<string, string>
  type: 'element'
}

export type HighlightRenderNode = HighlightElementNode | HighlightTextNode

export type Highlighter = {
  highlight: (code: string, options?: HighlightOptions) => HighlightResult
  highlightToHtml: (code: string, options?: HighlightOptions) => string
  listLanguages: () => Array<string>
  normalizeLanguage: (lang?: string) => string
  renderCodeBlockData: (options: {
    code: string
    decorations?: ReadonlyArray<HighlightDecoration>
    lang?: string
    lineNumbers?: boolean
    title?: string
  }) => RenderedCodeBlockData
  tokenize: (code: string, options?: HighlightOptions) => HighlightTokenResult
}

export function defineLanguage<const Name extends string>(
  definition: LanguageDefinition<Name>,
) {
  return definition
}

export function createHighlighter({
  fallbackLanguage = 'plaintext',
  languages,
}: {
  fallbackLanguage?: string
  languages: ReadonlyArray<LanguageDefinition>
}): Highlighter {
  const definitions = new Map<string, LanguageDefinition>()
  const aliases = new Map<string, string>()

  for (const definition of languages) {
    const name = normalizeName(definition.name)
    definitions.set(name, definition)
    aliases.set(name, name)

    for (const alias of definition.aliases || []) {
      aliases.set(normalizeName(alias), name)
    }
  }

  const fallback = normalizeName(fallbackLanguage)

  function normalizeLanguage(lang?: string) {
    return aliases.get(normalizeName(lang || fallback)) || fallback
  }

  function tokenizeRanges(code: string, lang: string, depth = 0) {
    const definition = definitions.get(normalizeLanguage(lang))
    if (!definition || depth > 24) return []

    const context: TokenizerContext = {
      hasLanguage(candidate) {
        const resolved = aliases.get(normalizeName(candidate))
        return Boolean(resolved && definitions.has(resolved))
      },
      tokenize(embeddedCode, embeddedLanguage) {
        return tokenizeRanges(embeddedCode, embeddedLanguage, depth + 1)
      },
    }

    return normalizeTokenRanges(code.length, definition.tokenize(code, context))
  }

  function tokenize(
    code: string,
    options: HighlightOptions = {},
  ): HighlightTokenResult {
    const lang = normalizeLanguage(options.lang)
    const ranges = tokenizeRanges(code, lang)

    return {
      code,
      lang,
      tokens: ranges.length ? rangesToTokens(code, ranges) : [{ value: code }],
    }
  }

  function highlight(code: string, options: HighlightOptions = {}): HighlightResult {
    const result = tokenize(code, options)
    const children = renderTokens(result.tokens, options)
    const innerHtml = renderNodesToHtml(children)

    return {
      ...result,
      html: `<pre class="th-code th-code--${escapeHtml(result.lang)}${options.lineNumbers ? ' th-code--line-numbers' : ''}" data-language="${escapeHtml(result.lang)}"><code>${innerHtml}</code></pre>`,
    }
  }

  function renderCodeBlockData({
    code,
    decorations,
    lang,
    lineNumbers,
    title,
  }: {
    code: string
    decorations?: ReadonlyArray<HighlightDecoration>
    lang?: string
    lineNumbers?: boolean
    title?: string
  }): RenderedCodeBlockData {
    const copyText = code.trimEnd()
    const result = highlight(copyText, { decorations, lang, lineNumbers })

    return {
      copyText,
      htmlMarkup: result.html,
      lang: result.lang,
      title,
      tokens: result.tokens,
    }
  }

  return {
    highlight,
    highlightToHtml(code, options = {}) {
      return highlight(code, options).html
    },
    listLanguages() {
      return [...definitions.keys()]
    },
    normalizeLanguage,
    renderCodeBlockData,
    tokenize,
  }
}

export function renderTokens(
  tokens: ReadonlyArray<HighlightToken>,
  options: Pick<HighlightOptions, 'decorations' | 'lineNumbers'> = {},
): Array<HighlightRenderNode> {
  const rangeDecorations: Array<HighlightRangeDecoration> = []
  const lineDecorations: Array<HighlightLineDecoration> = []
  for (const decoration of options.decorations || []) {
    if (decoration.range) rangeDecorations.push(decoration)
    else lineDecorations.push(decoration)
  }
  const wrapLines = Boolean(options.lineNumbers || lineDecorations.length)
  const cursor = { index: 0, offset: 0 }

  if (!wrapLines) {
    return renderTokenSlice(tokens, 0, Infinity, rangeDecorations, cursor)
  }

  const code = tokens.map((token) => token.value).join('')
  const nodes: Array<HighlightRenderNode> = []
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

    nodes.push({
      type: 'element',
      classNames: [
        'th-line',
        ...active.flatMap((decoration) => splitClassNames(decoration.className)),
      ],
      data: {
        ...mergeData(active),
        line: String(line),
      },
      children: renderTokenSlice(tokens, start, end, rangeDecorations, cursor),
    })

    if (hasNewline) nodes.push({ type: 'text', value: '\n' })
  }

  return nodes
}

export function renderNodesToHtml(nodes: ReadonlyArray<HighlightRenderNode>) {
  let html = ''

  for (const node of nodes) {
    if (node.type === 'text') {
      html += escapeHtml(node.value)
      continue
    }

    const className = escapeHtml(node.classNames.join(' '))
    let data = ''
    if (node.data) {
      for (const [key, value] of Object.entries(node.data)) {
        data += ` data-${normalizeDataKey(key)}="${escapeHtml(value)}"`
      }
    }
    html += `<span${className ? ` class="${className}"` : ''}${data}>${renderNodesToHtml(node.children)}</span>`
  }

  return html
}

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => htmlEscapes[character])
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function normalizeTokenRanges(
  codeLength: number,
  input: ReadonlyArray<TokenRange>,
) {
  const ranges: Array<TokenRange> = []
  let sorted = true
  let previousStart = 0
  for (const candidate of input) {
    if (!Number.isInteger(candidate.start) || !Number.isInteger(candidate.end)) continue
    const start = Math.max(0, Math.min(codeLength, candidate.start))
    const end = Math.max(0, Math.min(codeLength, candidate.end))
    if (start >= end) continue
    if (start < previousStart) sorted = false
    previousStart = start
    ranges.push({ className: candidate.className, start, end })
  }
  if (!sorted) ranges.sort((a, b) => a.start - b.start)

  let end = 0
  let count = 0
  for (const candidate of ranges) {
    if (candidate.start < end) continue
    ranges[count++] = candidate
    end = candidate.end
  }
  ranges.length = count
  return ranges
}

function rangesToTokens(code: string, ranges: ReadonlyArray<TokenRange>) {
  const tokens: Array<HighlightToken> = []
  let index = 0

  for (const range of ranges) {
    if (range.start > index) tokens.push({ value: code.slice(index, range.start) })
    tokens.push({
      className: range.className,
      value: code.slice(range.start, range.end),
    })
    index = range.end
  }

  if (index < code.length) tokens.push({ value: code.slice(index) })
  return tokens
}

function renderTokenSlice(
  tokens: ReadonlyArray<HighlightToken>,
  start: number,
  end: number,
  decorations: ReadonlyArray<HighlightRangeDecoration>,
  cursor: { index: number; offset: number },
) {
  const nodes: Array<HighlightRenderNode> = []

  for (; cursor.index < tokens.length; cursor.index++) {
    const token = tokens[cursor.index]
    const tokenStart = cursor.offset
    const tokenEnd = tokenStart + token.value.length
    const sliceStart = Math.max(start, tokenStart)
    const sliceEnd = Math.min(end, tokenEnd)

    if (sliceStart < sliceEnd) {
      let sorted = [sliceStart, sliceEnd]
      if (decorations.length) {
        const boundaries = new Set(sorted)
        for (const decoration of decorations) {
          const [decorationStart, decorationEnd] = decoration.range
          if (decorationEnd <= sliceStart || decorationStart >= sliceEnd) continue
          boundaries.add(Math.max(sliceStart, decorationStart))
          boundaries.add(Math.min(sliceEnd, decorationEnd))
        }
        sorted = [...boundaries].sort((a, b) => a - b)
      }

      for (let index = 0; index < sorted.length - 1; index++) {
        const segmentStart = sorted[index]
        const segmentEnd = sorted[index + 1]
        let node: HighlightRenderNode = {
          type: 'text',
          value: token.value.slice(
            segmentStart - tokenStart,
            segmentEnd - tokenStart,
          ),
        }

        if (token.className) {
          node = {
            type: 'element',
            classNames: ['th-token', `th-${token.className}`],
            children: [node],
          }
        }

        for (const decoration of decorations) {
          if (
            decoration.range[0] > segmentStart ||
            decoration.range[1] < segmentEnd
          ) continue
          node = {
            type: 'element',
            classNames: [
              'th-decoration',
              ...splitClassNames(decoration.className),
            ],
            data: stringifyData(decoration.data),
            children: [node],
          }
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
  for (let index = 0; index < code.length; index++) {
    if (code[index] === '\n' && index + 1 < code.length) starts.push(index + 1)
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

function normalizeDataKey(value: string) {
  return toKebabCase(value).replace(/[^a-z0-9_.:-]/gi, '-')
}

function splitClassNames(className?: string) {
  return className?.trim().split(/\s+/).filter(Boolean) || []
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
}
