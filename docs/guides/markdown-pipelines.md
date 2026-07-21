---
title: Markdown Pipelines
---

# Markdown Pipelines

TanStack Highlight provides helpers at three different Markdown boundaries. All accept an explicit highlighter so adapters do not import every language.

## Direct fence rendering

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

const rendered = renderCodeFence(
  {
    code: `const answer = 42\n`,
    lang: 'ts',
    meta: 'title="answer.ts" {1} lineNumbers',
  },
  highlighter,
)
```

The result includes:

```ts
rendered.copyText
rendered.htmlMarkup
rendered.lang
rendered.title
rendered.tokens
rendered.decorations
rendered.lineNumbers
```

`copyText` trims trailing whitespace from the block before highlighting.

## Remark

Use the Remark plugin before `remark-rehype`:

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'

const highlightCode = remarkHighlightCodeBlocks({
  highlighter,
  lineNumbers: false,
  getTitle(node) {
    return node.data?.filename as string | undefined
  },
  getDecorations(node) {
    return node.lang === 'diff'
      ? [{ lines: 1, className: 'diff-context' }]
      : undefined
  },
})
```

The plugin replaces mdast `code` nodes with a `highlightedCode` extension node carrying `hName`, `hProperties`, and `hChildren`. `remark-rehype` therefore receives structured HAST without enabling raw HTML.

For pipelines that intentionally consume raw HTML, `remarkCodeNodeToHtml()` returns a raw mdast HTML node. Prefer the structured path by default.

## Rehype

Use the Rehype plugin when the tree already contains `<pre><code class="language-*">`:

```ts
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'

const highlightCode = rehypeHighlightCodeBlocks({
  highlighter,
  lineNumbers: true,
})
```

The plugin:

1. Finds `<pre>` elements with a `<code>` child.
2. Reads the first `language-*` class from the code element.
3. Collects text from its descendants.
4. Replaces the node with highlighted HAST.

Already highlighted `th-code` blocks are skipped, making the transform idempotent.

## HAST helpers

```ts
import {
  codeFenceToHast,
  parseCodeFenceMeta,
  tokensToHast,
} from '@tanstack/highlight/markdown'
```

Use these when a custom parser already owns traversal but wants the same output contract.

## Markdown language versus Markdown adapter

They solve different problems:

- `languages/markdown` highlights Markdown source as a code sample and can delegate its internal fences.
- `remark` and `rehype` transform the code fences of a rendered Markdown document.

Most documentation sites need the adapter. Register the Markdown language only when they display Markdown source inside a code block.
