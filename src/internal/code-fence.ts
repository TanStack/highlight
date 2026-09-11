import type { Highlighter, HighlightDecoration } from '../core.js'

export type CodeFenceInput = {
  code: string
  decorations?: ReadonlyArray<HighlightDecoration>
  lang?: string | null
  lineNumbers?: boolean
  meta?: string | null
  title?: string | null
}

export type CodeFenceMeta = {
  decorations: Array<HighlightDecoration>
  lineNumbers: boolean
  title?: string
}

const codeDiffNotation =
  /(?:(?:\/\/|#)[ \t]*\[!code[ \t]+(\+\+|--)\]|\/\*[ \t]*\[!code[ \t]+(\+\+|--)\][ \t]*\*\/|<!--[ \t]*\[!code[ \t]+(\+\+|--)\][ \t]*-->)[ \t]*\r?$/

export function parseCodeDiffNotation(code: string) {
  const decorations: Array<HighlightDecoration> = []
  if (!code.includes('[!code')) return { code, decorations }

  const lines = code.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const match = codeDiffNotation.exec(line)
    if (!match) continue

    const notation = match[1] || match[2] || match[3]
    decorations.push({
      className:
        notation === '++' ? 'th-line--inserted' : 'th-line--deleted',
      lines: index + 1,
    })

    lines[index] =
      line.slice(0, match.index).replace(/[ \t]+$/, '') +
      (line.endsWith('\r') ? '\r' : '')
  }

  return {
    code: lines.join('\n'),
    decorations,
  }
}

const codeFenceMetadata =
  /"[^"]*"|'[^']*'|(?:^|[\s{])(?:(title|filename|file|name)=("[^"]*"|'[^']*'|[^\s}]+)|(del|error|focus|highlight|ins|warning)=\{([^}]*)\}|\{([\d,\s-]+)\}(?=\s|$)|(lineNumbers|showLineNumbers)(?=\s|}|$))/g
const annotationClasses: Record<string, string> = {
  del: 'th-line--deleted',
  error: 'th-line--error',
  focus: 'th-line--focused',
  highlight: 'th-line--highlighted',
  ins: 'th-line--inserted',
  warning: 'th-line--warning',
}

export function parseCodeFenceMeta(meta?: string | null): CodeFenceMeta {
  if (!meta) return { decorations: [], lineNumbers: false }

  const parsed: CodeFenceMeta = {
    decorations: [],
    lineNumbers: false,
    title: undefined,
  }
  let hasTitle = false

  for (const match of meta.matchAll(codeFenceMetadata)) {
    if (match[1] && !hasTitle) {
      parsed.title = unquoteTitle(match[2])
      hasTitle = true
    } else if (match[3]) {
      parseLineList(match[4], annotationClasses[match[3]], parsed.decorations)
    } else if (match[5]) {
      parseLineList(match[5], 'th-line--highlighted', parsed.decorations)
    } else if (match[6]) {
      parsed.lineNumbers = true
    }
  }

  return parsed
}

export function getCodeFenceTitle(meta?: string | null) {
  if (!meta) return undefined
  for (const match of meta.matchAll(codeFenceMetadata)) {
    if (match[1]) return unquoteTitle(match[2])
  }
  return undefined
}

function unquoteTitle(value: string) {
  const quote = value[0]
  const unquoted =
    (quote === '"' || quote === "'") && value.endsWith(quote)
      ? value.slice(1, -1)
      : value
  return unquoted.trim() || undefined
}

export function prepareCodeFence({
  code,
  decorations,
  lang,
  lineNumbers,
  meta,
  title,
}: CodeFenceInput) {
  const annotated = parseCodeDiffNotation(code)
  const parsed = parseCodeFenceMeta(meta)

  return {
    code: annotated.code,
    decorations: [
      ...annotated.decorations,
      ...parsed.decorations,
      ...(decorations || []),
    ],
    lang: lang || undefined,
    lineNumbers: lineNumbers ?? parsed.lineNumbers,
    title: title || parsed.title,
  }
}

export function tokenizeCodeFence(input: CodeFenceInput, highlighter: Highlighter) {
  const prepared = prepareCodeFence(input)
  return {
    ...prepared,
    ...highlighter.tokenize(prepared.code.trimEnd(), { lang: prepared.lang }),
  }
}

function parseLineList(
  value: string,
  className: string,
  decorations: Array<HighlightDecoration>,
) {
  for (const part of value.split(',')) {
    const range = part.trim().match(/^(\d+)(?:-(\d+))?$/)
    if (!range) continue
    const start = Number(range[1])
    const end = Number(range[2] || range[1])
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 1 ||
      end < start
    ) continue
    decorations.push({
      className,
      lines: start === end ? start : [start, end],
    })
  }
}
