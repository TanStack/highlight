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
        return normalizeTokenRanges(
          embeddedCode.length,
          tokenizeRanges(embeddedCode, embeddedLanguage, depth + 1),
        )
      },
    }

    return definition.tokenize(code, context)
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
      tokens: normalizeTokenRanges(code.length, ranges, code),
    }
  }

  function highlight(code: string, options: HighlightOptions = {}): HighlightResult {
    const result = tokenize(code, options)
    // Plain blocks do not need an intermediate render tree. Keep the same
    // token result and escaping contract as the decorated rendering path.
    let innerHtml = ''
    if (!options.lineNumbers && !options.decorations?.length) {
      for (const token of result.tokens) {
        const value = escapeHtml(token.value)
        innerHtml += token.className
          ? `<span class="th-token th-${escapeHtml(token.className)}">${value}</span>`
          : value
      }
    } else {
      innerHtml = concatHtml(renderTokenOutput(result.tokens, options, htmlRenderer))
    }

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

type RenderTarget<T> = {
  text: (value: string) => T
  token: (className: HighlightTokenClass, child: T) => T
  element: (classNames: Array<string>, data: Record<string, string> | undefined, children: Array<T>) => T
}

const nodeRenderer: RenderTarget<HighlightRenderNode> = {
  text: value => ({ type: 'text', value }),
  token: (className, child) => ({
    type: 'element', classNames: ['th-token', `th-${className}`], children: [child],
  }),
  element: (classNames, data, children) => ({ type: 'element', classNames, data, children }),
}

const htmlRenderer: RenderTarget<string> = {
  text: escapeHtml,
  token: (className, child) => `<span class="th-token th-${escapeHtml(className)}">${child}</span>`,
  element(classNames, attributes, children) {
    const className = escapeHtml(classNames.join(' '))
    let data = ''
    // stringifyData and the line wrapper supply normalized attribute names.
    if (attributes) for (const [key, value] of Object.entries(attributes)) {
      data += ` data-${key}="${escapeHtml(value)}"`
    }
    return `<span${className ? ` class="${className}"` : ''}${data}>${concatHtml(children)}</span>`
  },
}

function concatHtml(chunks: ReadonlyArray<string>) {
  let html = chunks[0] || ''
  for (let index = 1; index < chunks.length; index++) html += chunks[index]
  return html
}

export function renderTokens(
  tokens: ReadonlyArray<HighlightToken>,
  options: Pick<HighlightOptions, 'decorations' | 'lineNumbers'> = {},
): Array<HighlightRenderNode> {
  return renderTokenOutput(tokens, options, nodeRenderer)
}

function renderTokenOutput<T>(
  tokens: ReadonlyArray<HighlightToken>,
  options: Pick<HighlightOptions, 'decorations' | 'lineNumbers'>,
  renderer: RenderTarget<T>,
): Array<T> {
  const rangeDecorations: Array<HighlightRangeDecoration> = []
  const lineDecorations: Array<HighlightLineDecoration> = []
  for (const decoration of options.decorations || []) {
    if (decoration.range) {
      const [start, end] = decoration.range
      if (hasIntegerOffsets(start, end) && start < end) {
        rangeDecorations.push(decoration)
      }
    } else lineDecorations.push(decoration)
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
    ], { ...mergeData(active), line: String(line) },
      renderTokenSlice(tokens, start, end, rangeDecorations, cursor, renderer),
    ))

    if (newline < 0) break
    nodes.push(renderer.text('\n'))
    start = end + 1
    if (start === code.length) break
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
  return /[&<>"']/.test(value)
    ? value.replace(/[&<>"']/g, (character) => htmlEscapes[character])
    : value
}

function hasIntegerOffsets(start: number, end: number) {
  return Number.isInteger(start) && Number.isInteger(end)
}

function normalizeName(value: string) {
  return value.trim().toLowerCase()
}

// Embedded tokenizers need independent normalized ranges. At the top level,
// emit tokens directly so valid ranges do not need another object per range.
function normalizeTokenRanges(
  codeLength: number,
  input: ReadonlyArray<TokenRange>,
): Array<TokenRange>
function normalizeTokenRanges(
  codeLength: number,
  input: ReadonlyArray<TokenRange>,
  code: string,
): Array<HighlightToken>
function normalizeTokenRanges(
  codeLength: number,
  input: ReadonlyArray<TokenRange>,
  code?: string,
): Array<TokenRange | HighlightToken> {
  const ranges: Array<TokenRange> = []
  let sorted = true
  let previousStart = 0
  for (const candidate of input) {
    if (!hasIntegerOffsets(candidate.start, candidate.end)) continue
    // Other out-of-bounds offsets cannot survive the empty-range check.
    const start = Math.max(0, candidate.start)
    const end = Math.min(codeLength, candidate.end)
    if (start >= end) continue
    if (start < previousStart) sorted = false
    previousStart = start
    ranges.push({ className: candidate.className, start, end })
  }
  if (!sorted) ranges.sort((a, b) => a.start - b.start)

  const result: Array<TokenRange | HighlightToken> = []
  let end = 0
  for (const candidate of ranges) {
    const start = Math.max(0, candidate.start)
    if (start < end) continue
    if (code !== undefined && start > end) result.push({ value: code.slice(end, start) })
    end = candidate.end
    result.push(code === undefined
      ? { className: candidate.className, start, end }
      : { className: candidate.className, value: code.slice(start, end) })
  }
  if (code !== undefined && (end < codeLength || !result.length)) {
    result.push({ value: code.slice(end) })
  }
  return result
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

function mergeData(decorations: ReadonlyArray<HighlightLineDecoration>) {
  let data: Record<string, string> | undefined
  for (const decoration of decorations) {
    if (decoration.data) {
      data = Object.assign(
        data || Object.create(null),
        stringifyData(decoration.data),
      )
    }
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
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`).replace(/[^a-z0-9_.:-]/gi, '-')
}

function splitClassNames(className?: string) {
  return className?.trim().split(/\s+/).filter(Boolean) || []
}
