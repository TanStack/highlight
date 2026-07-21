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
) {
  if (hasClassName(node, 'th-code')) return undefined
  const code = getCodeChild(node)
  if (!code) return undefined
  return codeFenceToHast(
    {
      code: collectText(code).trimEnd(),
      decorations: options.getDecorations?.(node),
      lang: getLanguage(code),
      lineNumbers: options.lineNumbers,
      title: options.getTitle?.(node),
    },
    options.highlighter,
  )
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

function getLanguage(node: HastElement) {
  const className = node.properties?.className
  const classes = Array.isArray(className)
    ? className
    : typeof className === 'string'
      ? className.split(/\s+/)
      : []
  return classes
    .find(
      (value): value is string =>
        typeof value === 'string' && value.startsWith('language-'),
    )
    ?.slice('language-'.length)
}

function hasClassName(node: HastElement, expected: string) {
  const className = node.properties?.className
  return Array.isArray(className)
    ? className.includes(expected)
    : typeof className === 'string'
      ? className.split(/\s+/).includes(expected)
      : false
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
