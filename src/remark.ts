import type { Highlighter, HighlightDecoration } from './core.js'
import {
  codeFenceToHast,
  renderCodeFence,
  tokensToHast,
  type CodeFenceInput,
} from './markdown.js'

export type RemarkCodeNode = {
  type: 'code'
  value: string
  lang?: string | null
  meta?: string | null
  data?: Record<string, unknown>
}

export type RemarkHtmlNode = {
  type: 'html'
  value: string
  data?: Record<string, unknown>
}

export type RemarkHighlightOptions = {
  getDecorations?: (
    node: RemarkCodeNode,
  ) => ReadonlyArray<HighlightDecoration> | undefined
  getTitle?: (node: RemarkCodeNode) => string | undefined
  highlighter: Highlighter
  lineNumbers?: boolean
}

export type RemarkHighlightedCodeNode = {
  type: 'highlightedCode'
  data: Record<string, unknown> & {
    hChildren: ReturnType<typeof codeFenceToHast>['children']
    hName: 'pre'
    hProperties: ReturnType<typeof codeFenceToHast>['properties']
  }
}

type UnknownNode = {
  children?: Array<UnknownNode>
  type?: string
  [key: string]: unknown
}

export function remarkCodeNodeToHtml(
  node: RemarkCodeNode,
  options: RemarkHighlightOptions,
): RemarkHtmlNode {
  const rendered = renderCodeFence(createInput(node, options), options.highlighter)
  return {
    type: 'html',
    value: rendered.htmlMarkup,
    data: {
      syntaxHighlight: {
        copyText: rendered.copyText,
        lang: rendered.lang,
        title: rendered.title,
      },
    },
  }
}

export function remarkCodeNodeToMdast(
  node: RemarkCodeNode,
  options: RemarkHighlightOptions,
): RemarkHighlightedCodeNode {
  const rendered = renderCodeFence(createInput(node, options), options.highlighter)
  const hast = tokensToHast(rendered.tokens, rendered.lang, {
    decorations: rendered.decorations,
    lineNumbers: rendered.lineNumbers,
    title: rendered.title,
  })

  return {
    type: 'highlightedCode',
    data: {
      ...node.data,
      hName: 'pre',
      hProperties: hast.properties,
      hChildren: hast.children,
      syntaxHighlight: {
        copyText: rendered.copyText,
        lang: rendered.lang,
        title: rendered.title,
      },
    },
  }
}

export function remarkHighlightCodeBlocks(options: RemarkHighlightOptions) {
  return function transformer(tree: UnknownNode) {
    replaceCodeNodes(tree, options)
  }
}

function replaceCodeNodes(node: UnknownNode, options: RemarkHighlightOptions) {
  const children = node.children
  if (!children) return
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (isRemarkCodeNode(child)) {
      children[index] = remarkCodeNodeToMdast(child, options) as UnknownNode
      continue
    }
    replaceCodeNodes(child, options)
  }
}

function createInput(
  node: RemarkCodeNode,
  options: RemarkHighlightOptions,
): CodeFenceInput {
  return {
    code: node.value,
    decorations: options.getDecorations?.(node),
    lang: node.lang,
    lineNumbers: options.lineNumbers,
    meta: node.meta,
    title: options.getTitle?.(node),
  }
}

function isRemarkCodeNode(node: UnknownNode): node is UnknownNode & RemarkCodeNode {
  return node.type === 'code' && typeof node.value === 'string'
}
