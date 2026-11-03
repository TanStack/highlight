import { renderTokenOutput, type RenderTarget } from './internal/render.js'
import {
  escapeHtml,
  renderNodesToHtml,
  renderTokens,
  type Highlighter,
  type HighlightDecoration,
  type HighlightToken,
  type RenderedCodeBlockData,
} from './core.js'
import {
  parseCodeDiffNotation,
  prepareCodeFence,
  tokenizeCodeFence,
  type CodeFenceInput,
} from './internal/code-fence.js'

export {
  getCodeFenceTitle,
  parseCodeDiffNotation,
  parseCodeFenceMeta,
  type CodeFenceInput,
  type CodeFenceMeta,
} from './internal/code-fence.js'

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
  data?: Record<string, unknown>
  children: Array<HastElement | HastText>
}

export type TanStackMarkdownHighlighterOptions = {
  highlightLines?: ReadonlyArray<number>
  lineNumbers?: boolean
}

export type TanStackMarkdownHighlighter = (
  code: string,
  lang?: string,
  options?: TanStackMarkdownHighlighterOptions,
) => string

export function renderCodeFence(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HighlightedCodeFence {
  const prepared = prepareCodeFence(input)
  return {
    ...highlighter.renderCodeBlockData(prepared),
    decorations: prepared.decorations,
    lineNumbers: prepared.lineNumbers,
  }
}

export function codeFenceToHast(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HastElement {
  const rendered = tokenizeCodeFence(input, highlighter)
  return tokensToHast(rendered.tokens, rendered.lang, rendered)
}

export function createTanStackMarkdownHighlighter(
  highlighter: Highlighter,
): TanStackMarkdownHighlighter {
  return (code, lang = 'plaintext', options = {}) => {
    const annotated = parseCodeDiffNotation(code)
    const result = highlighter.tokenize(annotated.code, { lang })

    for (const lines of options.highlightLines || []) {
      annotated.decorations.push({ className: 'th-line--highlighted', lines })
    }

    const tokens = result.tokens
    const lineNumbers = options.lineNumbers
    if (!lineNumbers && !annotated.decorations.length) {
      return renderNodesToHtml(renderTokens(tokens, { lineNumbers, decorations: annotated.decorations }))
    }
    return renderMarkdownLines(tokens, { lineNumbers, decorations: annotated.decorations })
  }
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
      className: [
        'th-code',
        `th-code--${lang}`,
        ...(options.lineNumbers ? ['th-code--line-numbers'] : []),
      ],
      dataLanguage: lang,
      ...(options.title ? { dataTitle: options.title } : {}),
    },
    children: [
      {
        type: 'element',
        tagName: 'code',
        properties: {},
        children: renderTokenOutput(tokens, options, hastRenderer),
      },
    ],
  }
}

const hastRenderer: RenderTarget<HastElement | HastText> = {
  text: value => ({ type: 'text', value }),
  token: (className, child) => ({
    type: 'element', tagName: 'span',
    properties: { className: ['th-token', `th-${className}`] }, children: [child],
  }),
  element(classNames, data, children) {
    const properties: Record<string, unknown> = { className: classNames }
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        properties[`data${key[0]?.toUpperCase() || ''}${key.slice(1)}`] = value
      }
    }
    return { type: 'element', tagName: 'span', properties, children }
  },
}

// This adapter owns its line decorations and never supplies range decorations.
// Keep all token getters and coercions before the HTML escaping phase.
function renderMarkdownLines(
  tokens: ReadonlyArray<HighlightToken>,
  options: { lineNumbers?: boolean; decorations: ReadonlyArray<HighlightDecoration> },
) {
  const parts: Array<string> = []
  const escaped: Array<boolean> = []
  const target: RenderTarget<number> = {
    text(value) {
      const start = parts.length
      parts.push(value)
      escaped.push(true)
      return start
    },
    token(className, child) {
      parts.splice(child, 0, '<span class="', `th-token th-${className}`, '">')
      escaped.splice(child, 0, false, true, false)
      parts.push('</span>')
      escaped.push(false)
      return child
    },
    element(classNames, attributes, children) {
      const start = children[0] ?? parts.length
      parts.splice(start, 0, '<span class="', classNames.join(' '), '" data-line="', attributes!.line, '">')
      escaped.splice(start, 0, false, true, false, true, false)
      parts.push('</span>')
      escaped.push(false)
      return start
    },
  }
  renderTokenOutput(tokens, options, target)
  let html = ''
  for (let index = 0; index < parts.length; index++) {
    html += escaped[index] ? escapeHtml(parts[index]) : parts[index]
  }
  return html
}
