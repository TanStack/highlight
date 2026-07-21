---
title: Remark API
---

# Remark API

`@tanstack/highlight/remark` handles MDAST code nodes without depending on Remark itself.

## Types

### `RemarkCodeNode`

The supported MDAST input shape: a `code` node with `value`, optional `lang`, `meta`, and `data`.

### `RemarkHtmlNode`

An MDAST `html` node with a string `value` and optional `data`.

### `RemarkHighlightOptions`

```ts
type RemarkHighlightOptions = {
  highlighter: Highlighter
  lineNumbers?: boolean
  getDecorations?: (node: RemarkCodeNode) =>
    ReadonlyArray<HighlightDecoration> | undefined
  getTitle?: (node: RemarkCodeNode) => string | undefined
}
```

Callback decorations are added after fence metadata. A callback title takes precedence over metadata when non-empty.

### `RemarkHighlightedCodeNode`

The MDAST-compatible result used by the transformer. It has `type: 'highlightedCode'` and supplies `hName`, `hProperties`, and `hChildren` for `mdast-util-to-hast`. Its `data.syntaxHighlight` contains `copyText`, `lang`, and optional `title`.

## Functions

### `remarkCodeNodeToHtml`

```ts
function remarkCodeNodeToHtml(
  node: RemarkCodeNode,
  options: RemarkHighlightOptions,
): RemarkHtmlNode
```

Converts one code node to raw highlighted HTML. Use only in pipelines that permit trusted raw HTML output.

### `remarkCodeNodeToMdast`

```ts
function remarkCodeNodeToMdast(
  node: RemarkCodeNode,
  options: RemarkHighlightOptions,
): RemarkHighlightedCodeNode
```

Converts one code node to an MDAST node carrying HAST fields. Source text and generated attributes are escaped later by the HAST serializer.

### `remarkHighlightCodeBlocks`

```ts
function remarkHighlightCodeBlocks(
  options: RemarkHighlightOptions,
): (tree: unknown) => void
```

Returns a synchronous Remark transformer. It recursively replaces every MDAST `code` node using `remarkCodeNodeToMdast`.

```ts
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'

const file = await remark()
  .use(remarkHighlightCodeBlocks, { highlighter })
  .use(remarkHtml)
  .process(markdown)
```

See [Markdown Pipelines](../guides/markdown-pipelines) for pipeline ordering.
