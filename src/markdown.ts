import {
  renderNodesToHtml,
  renderTokens,
  type Highlighter,
  type HighlightDecoration,
  type HighlightRenderNode,
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

    return renderNodesToHtml(
      renderTokens(result.tokens, {
        lineNumbers: options.lineNumbers,
        decorations: annotated.decorations,
      }),
    )
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
        children: renderTokens(tokens, options).map(renderNodeToHast),
      },
    ],
  }
}

function renderNodeToHast(node: HighlightRenderNode): HastElement | HastText {
  if (node.type === 'text') return node

  const properties: Record<string, unknown> = { className: node.classNames }
  if (node.data) {
    for (const [key, value] of Object.entries(node.data)) {
      properties[`data${key[0]?.toUpperCase() || ''}${key.slice(1)}`] = value
    }
  }

  return {
    type: 'element',
    tagName: 'span',
    properties,
    children: node.children.map(renderNodeToHast),
  }
}
