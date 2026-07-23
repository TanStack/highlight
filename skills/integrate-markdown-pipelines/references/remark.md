# Remark Adapter

## Plugin

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export const highlightCode = remarkHighlightCodeBlocks({
  highlighter,
  lineNumbers: true,
  getTitle(node) {
    return typeof node.data?.filename === 'string'
      ? node.data.filename
      : undefined
  },
  getDecorations(node) {
    return node.lang === 'diff'
      ? [{ lines: 1, className: 'diff-context' }]
      : undefined
  },
})
```

Run this transformer while the tree still contains MDAST `code` nodes.

## Structured Node Helper

`remarkCodeNodeToMdast()` returns a `highlightedCode` extension node. Its data contains:

- `hName: "pre"`
- `hProperties` from the highlighted HAST node
- `hChildren` from the highlighted HAST node
- `syntaxHighlight.copyText`
- `syntaxHighlight.lang`
- `syntaxHighlight.title`

`remark-rehype` reads the `hName`, `hProperties`, and `hChildren` fields without raw HTML.

## Raw HTML Helper

`remarkCodeNodeToHtml()` returns an MDAST HTML node containing generated `htmlMarkup`. Use it only in a pipeline already configured to consume raw HTML. It does not sanitize unrelated raw HTML in the document.
