---
title: Rehype API
---

# Rehype API

`@tanstack/highlight/rehype` transforms existing HAST `<pre><code>` pairs. It has no dependency on Rehype itself.

## `RehypeHighlightOptions`

```ts
type RehypeHighlightOptions = {
  highlighter: Highlighter
  lineNumbers?: boolean
  getDecorations?: (node: HastElement) =>
    ReadonlyArray<HighlightDecoration> | undefined
  getTitle?: (node: HastElement) => string | undefined
}
```

Callbacks receive the original `pre` node. Language names are read from a `language-*` class on the child `code` element.

## `rehypeHighlightCodeBlocks`

```ts
function rehypeHighlightCodeBlocks(
  options: RehypeHighlightOptions,
): (tree: unknown) => void
```

Returns a synchronous Rehype transformer. It recursively replaces supported `<pre><code>` nodes and skips any `pre` that already has the `th-code` class.

```ts
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'

const file = await unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeHighlightCodeBlocks, { highlighter })
  .use(rehypeStringify)
  .process(markdown)
```

## `rehypePreCodeToHast`

```ts
function rehypePreCodeToHast(
  node: HastElement,
  options: RehypeHighlightOptions,
): HastElement | undefined
```

Converts one eligible `pre` node. It returns `undefined` when the node is already highlighted or does not contain a direct `code` child. Descendant text is concatenated and trailing whitespace is removed before highlighting.

See [Markdown Pipelines](../guides/markdown-pipelines) for choosing between the Remark and Rehype integrations.
