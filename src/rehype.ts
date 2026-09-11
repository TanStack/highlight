import type { Highlighter, HighlightDecoration } from './core.js'
import {
  codeFenceToHast,
  type HastElement,
  type HastText,
} from './markdown.js'

export type RehypeHighlightOptions = {
  getDecorations?: (
    node: HastElement,
  ) => ReadonlyArray<HighlightDecoration> | undefined
  getTitle?: (node: HastElement) => string | undefined
  highlighter: Highlighter
  lineNumbers?: boolean
}

type HastNode = HastElement | HastText | RawNode | UnknownNode
type RawNode = { type: 'raw'; value: string }
type UnknownNode = {
  children?: Array<HastNode>
  properties?: Record<string, unknown>
  tagName?: string
  type?: string
  value?: unknown
  [key: string]: unknown
}

export function rehypeHighlightCodeBlocks(options: RehypeHighlightOptions) {
  return function transformer(tree: UnknownNode) {
    replacePreCodeNodes(tree, options)
  }
}

export function rehypePreCodeToHast(
  node: HastElement,
  options: RehypeHighlightOptions,
): HastElement | undefined {
  if (hasClassName(node, 'th-code')) return undefined
  const code = getCodeChild(node)
  if (!code) return undefined
  const highlighted = codeFenceToHast(
    {
      code: collectText(code),
      decorations: options.getDecorations?.(node),
      lang: getLanguage(code),
      lineNumbers: options.lineNumbers,
      meta: typeof code.data?.meta === 'string' ? code.data.meta : undefined,
      title: options.getTitle?.(node),
    },
    options.highlighter,
  )
  const highlightedCode = highlighted.children[0] as HastElement

  return {
    ...node,
    ...highlighted,
    properties: {
      ...node.properties,
      ...highlighted.properties,
      className: [...getClassNames(node), ...getClassNames(highlighted)],
    },
    children: [
      {
        ...code,
        ...highlightedCode,
        properties: { ...code.properties, ...highlightedCode.properties },
      },
    ],
  }
}

function replacePreCodeNodes(node: UnknownNode, options: RehypeHighlightOptions) {
  const children = node.children
  if (!children) return
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (isElement(child) && child.tagName === 'pre') {
      const highlighted = rehypePreCodeToHast(child, options)
      if (highlighted) children[index] = highlighted
      continue
    }
    replacePreCodeNodes(child as UnknownNode, options)
  }
}

function getCodeChild(node: HastElement) {
  return node.children.find(
    (child): child is HastElement => isElement(child) && child.tagName === 'code',
  )
}

function getClassNames(node: HastElement): Array<string> {
  const className = node.properties?.className
  return Array.isArray(className)
    ? className.filter((value): value is string => typeof value === 'string')
    : typeof className === 'string'
      ? className.split(/\s+/).filter(Boolean)
      : []
}

function getLanguage(node: HastElement) {
  return getClassNames(node)
    .find((value) => value.startsWith('language-'))
    ?.slice('language-'.length)
}

function hasClassName(node: HastElement, expected: string) {
  return getClassNames(node).includes(expected)
}

function collectText(node: HastNode): string {
  if (node.type === 'text' && typeof node.value === 'string') return node.value
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => collectText(child)).join('')
  }
  return ''
}

function isElement(node: HastNode): node is HastElement {
  return node.type === 'element' && typeof node.tagName === 'string'
}
