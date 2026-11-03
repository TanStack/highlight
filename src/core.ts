import { renderTokenOutput, normalizeDataKey, hasIntegerOffsets, type RenderTarget } from './internal/render.js'

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
