import {
  renderTokens,
  type Highlighter,
  type HighlightDecoration,
  type HighlightRenderNode,
  type HighlightToken,
  type RenderedCodeBlockData,
} from './core.js'

export type CodeFenceInput = {
  code: string
  decorations?: ReadonlyArray<HighlightDecoration>
  lang?: string | null
  lineNumbers?: boolean
  meta?: string | null
  title?: string | null
}

export type HighlightedCodeFence = RenderedCodeBlockData & {
  decorations: ReadonlyArray<HighlightDecoration>
  lineNumbers: boolean
}

export type HastText = {
  type: 'text'
  value: string
}

export type HastElement = {
  type: 'element'
  tagName: string
  properties?: Record<string, unknown>
  children: Array<HastElement | HastText>
}

export type CodeFenceMeta = {
  decorations: Array<HighlightDecoration>
  lineNumbers: boolean
  title?: string
}

export function parseCodeFenceMeta(meta?: string | null): CodeFenceMeta {
  if (!meta) return { decorations: [], lineNumbers: false }

  const matches: Array<{
    decorations: Array<HighlightDecoration>
    index: number
  }> = []
  const annotationClasses: Record<string, string> = {
    del: 'th-line--deleted',
    error: 'th-line--error',
    focus: 'th-line--focused',
    highlight: 'th-line--highlighted',
    ins: 'th-line--inserted',
    warning: 'th-line--warning',
  }

  const annotation = /\b(del|error|focus|highlight|ins|warning)=\{([^}]*)\}/g
  let match: RegExpExecArray | null
  while ((match = annotation.exec(meta))) {
    matches.push({
      decorations: parseLineList(match[2], annotationClasses[match[1]]),
      index: match.index,
    })
  }

  const shorthand = /(?:^|\s)\{([\d,\s-]+)\}(?=\s|$)/g
  while ((match = shorthand.exec(meta))) {
    matches.push({
      decorations: parseLineList(match[1], 'th-line--highlighted'),
      index: match.index,
    })
  }

  return {
    decorations: matches
      .sort((a, b) => a.index - b.index)
      .flatMap((entry) => entry.decorations),
    lineNumbers: /\b(?:lineNumbers|showLineNumbers)\b/.test(meta),
    title: getCodeFenceTitle(meta),
  }
}

export function getCodeFenceTitle(meta?: string | null) {
  if (!meta) return undefined
  const match = meta.match(
    /\b(?:title|filename|file|name)=("[^"]*"|'[^']*'|[^\s}]+)/,
  )
  if (!match) return undefined
  const value = match[1]
  const unquoted =
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
      ? value.slice(1, -1)
      : value
  return unquoted.trim() || undefined
}

export function renderCodeFence(
  {
    code,
    decorations,
    lang,
    lineNumbers,
    meta,
    title,
  }: CodeFenceInput,
  highlighter: Highlighter,
): HighlightedCodeFence {
  const parsed = parseCodeFenceMeta(meta)
  const resolvedDecorations = [...parsed.decorations, ...(decorations || [])]
  const resolvedLineNumbers = lineNumbers ?? parsed.lineNumbers
  const rendered = highlighter.renderCodeBlockData({
    code,
    decorations: resolvedDecorations,
    lang: lang || undefined,
    lineNumbers: resolvedLineNumbers,
    title: title || parsed.title,
  })

  return {
    ...rendered,
    decorations: resolvedDecorations,
    lineNumbers: resolvedLineNumbers,
  }
}

export function codeFenceToHast(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HastElement {
  const rendered = renderCodeFence(input, highlighter)
  return tokensToHast(rendered.tokens, rendered.lang, {
    decorations: rendered.decorations,
    lineNumbers: rendered.lineNumbers,
    title: rendered.title,
  })
}

export function tokensToHast(
  tokens: ReadonlyArray<HighlightToken>,
  lang: string,
  options: {
    decorations?: ReadonlyArray<HighlightDecoration>
    lineNumbers?: boolean
    title?: string
  } = {},
): HastElement {
  return {
    type: 'element',
    tagName: 'pre',
    properties: {
      className: ['th-code', `th-code--${lang}`],
      dataLanguage: lang,
      ...(options.title ? { dataTitle: options.title } : {}),
    },
    children: [
      {
        type: 'element',
        tagName: 'code',
        properties: {},
        children: renderTokens(tokens, options).map(renderNodeToHast),
      },
    ],
  }
}

function renderNodeToHast(node: HighlightRenderNode): HastElement | HastText {
  if (node.type === 'text') return node
  return {
    type: 'element',
    tagName: 'span',
    properties: {
      className: node.classNames,
      ...Object.fromEntries(
        Object.entries(node.data || {}).map(([key, value]) => [
          `data${key[0]?.toUpperCase() || ''}${key.slice(1)}`,
          value,
        ]),
      ),
    },
    children: node.children.map(renderNodeToHast),
  }
}

function parseLineList(value: string, className: string) {
  const decorations: Array<HighlightDecoration> = []
  for (const part of value.split(',')) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/)
    if (!range) continue
    const start = Number(range[1])
    const end = Number(range[2] || range[1])
    if (start < 1 || end < start) continue
    decorations.push({
      className,
      lines: start === end ? start : [start, end],
    })
  }
  return decorations
}
