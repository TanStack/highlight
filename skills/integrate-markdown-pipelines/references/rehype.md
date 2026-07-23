# Rehype Adapter

## Plugin

```ts
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { highlighter } from './highlight'

export const highlightCode = rehypeHighlightCodeBlocks({
  highlighter,
  lineNumbers: true,
  getTitle(node) {
    const title = node.properties?.dataTitle
    return typeof title === 'string' ? title : undefined
  },
  getDecorations(node) {
    return node.properties?.dataFocus === true
      ? [{ lines: 1, className: 'th-line--focused' }]
      : undefined
  },
})
```

## Discovery Contract

The adapter:

1. Finds an element named `pre`.
2. Finds an element named `code` among its children.
3. Reads the first `language-*` string from the code element's `className`.
4. Recursively collects text descendants.
5. Trims trailing whitespace.
6. Replaces the `pre` node with structured highlighted HAST.

A `pre` carrying the `th-code` class is skipped, making repeated transforms idempotent.

## Direct Helper

`rehypePreCodeToHast(node, options)` applies the same conversion to one HAST `pre` element. It returns `undefined` for already-highlighted nodes or nodes without a `code` child.
