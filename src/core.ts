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
      html: `<pre class="th-code th-code--${escapeAttribute(result.lang)}${options.lineNumbers ? ' th-code--line-numbers' : ''}" data-language="${escapeAttribute(result.lang)}"><code>${innerHtml}</code></pre>`,
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
  const code = tokens.map((token) => token.value).join('')
  const decorations = options.decorations || []
  const rangeDecorations = decorations.filter(isRangeDecoration)
  const lineDecorations = decorations.filter(isLineDecoration)
  const wrapLines = Boolean(options.lineNumbers || lineDecorations.length)

  if (!wrapLines) {
    return renderTokenSlice(tokens, 0, code.length, rangeDecorations)
  }

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
      children: renderTokenSlice(tokens, start, end, rangeDecorations),
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

    const className = node.classNames.map(escapeAttribute).join(' ')
    const data = Object.entries(node.data || {})
      .map(
        ([key, value]) =>
          ` data-${escapeAttribute(toKebabCase(key))}="${escapeAttribute(value)}"`,
      )
      .join('')
    html += `<span${className ? ` class="${className}"` : ''}${data}>${renderNodesToHtml(node.children)}</span>`
  }

  return html
}

export function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

function normalizeTokenRanges(
  codeLength: number,
  input: ReadonlyArray<TokenRange>,
) {
  const ranges: Array<TokenRange> = []
  const candidates = input
    .map((candidate) => ({
      ...candidate,
      start: Math.max(0, Math.min(codeLength, candidate.start)),
      end: Math.max(0, Math.min(codeLength, candidate.end)),
    }))
    .sort((a, b) => a.start - b.start)

  let end = 0
  for (const candidate of candidates) {
    if (candidate.start >= candidate.end || candidate.start < end) continue
    ranges.push(candidate)
    end = candidate.end
  }
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
) {
  const nodes: Array<HighlightRenderNode> = []
  let tokenStart = 0

  for (const token of tokens) {
    const tokenEnd = tokenStart + token.value.length
    const sliceStart = Math.max(start, tokenStart)
    const sliceEnd = Math.min(end, tokenEnd)

    if (sliceStart < sliceEnd) {
      const boundaries = new Set([sliceStart, sliceEnd])
      for (const decoration of decorations) {
        const [decorationStart, decorationEnd] = decoration.range
        if (decorationEnd <= sliceStart || decorationStart >= sliceEnd) continue
        boundaries.add(Math.max(sliceStart, decorationStart))
        boundaries.add(Math.min(sliceEnd, decorationEnd))
      }

      const sorted = [...boundaries].sort((a, b) => a - b)
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

        const active = decorations.filter(
          (decoration) =>
            decoration.range[0] <= segmentStart &&
            decoration.range[1] >= segmentEnd,
        )
        for (const decoration of active) {
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

    tokenStart = tokenEnd
    if (tokenStart >= end) break
  }

  return nodes
}

function isRangeDecoration(
  decoration: HighlightDecoration,
): decoration is HighlightRangeDecoration {
  return 'range' in decoration
}

function isLineDecoration(
  decoration: HighlightDecoration,
): decoration is HighlightLineDecoration {
  return 'lines' in decoration
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

function escapeAttribute(value: string) {
  return escapeHtml(value)
}
