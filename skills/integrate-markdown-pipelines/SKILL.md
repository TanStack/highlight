---
name: 'integrate-markdown-pipelines'
description: >
  Integrate @tanstack/highlight with renderCodeFence, codeFenceToHast,
  remarkHighlightCodeBlocks, rehypeHighlightCodeBlocks, and Markdown fence
  metadata. Load for unified, Remark, Rehype, MDX, custom HAST traversal,
  structured output, titles, line numbers, or code annotations.
metadata:
  type: composition
  library: '@tanstack/highlight'
  library_version: '0.0.5'
requires:
  - 'configure-selective-highlighting'
sources:
  - 'TanStack/highlight:docs/guides/markdown-pipelines.md'
  - 'TanStack/highlight:docs/guides/annotations.md'
  - 'TanStack/highlight:src/markdown.ts'
  - 'TanStack/highlight:src/remark.ts'
  - 'TanStack/highlight:src/rehype.ts'
---

This skill builds on `configure-selective-highlighting`. Read it first for registry and bundle behavior.

# Integrate Markdown Pipelines

## Setup

Render a parsed fence directly when the application owns Markdown traversal:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export function renderFence(code: string, lang: string, meta?: string) {
  return renderCodeFence(
    {
      code,
      lang,
      meta,
    },
    highlighter,
  )
}
```

The result includes `copyText`, `htmlMarkup`, `lang`, `title`, `tokens`, `decorations`, and `lineNumbers`.

## Core Patterns

### Transform MDAST before remark-rehype

```ts
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

const processor = unified()
  .use(remarkParse)
  .use(remarkHighlightCodeBlocks, {
    highlighter,
    lineNumbers: true,
  })
  .use(remarkRehype)
  .use(rehypeStringify)

export async function renderMarkdown(markdown: string) {
  return String(await processor.process(markdown))
}
```

The plugin attaches structured HAST data to replacement MDAST nodes; raw HTML is not required.

### Transform existing HAST code blocks

```ts
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { unified } from 'unified'
import { highlighter } from './highlight'

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeHighlightCodeBlocks, {
    highlighter,
    lineNumbers: false,
  })
  .use(rehypeStringify)

export async function highlightHtml(html: string) {
  return String(await processor.process(html))
}
```

The Rehype adapter reads `<pre><code class="language-*">` and skips blocks already marked `th-code`.

### Parse standard fence annotations

```ts
import { parseCodeFenceMeta } from '@tanstack/highlight/markdown'

export const meta = parseCodeFenceMeta(
  'title="App.tsx" {2,4-6} ins={8} error={11} lineNumbers',
)
```

Line annotations are one-based and inclusive; the parsed classes remain application-styled.

## Common Mistakes

### HIGH Confusing Markdown source with adapters

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { markdown } from '@tanstack/highlight/languages/markdown'

export const highlighter = createHighlighter({ languages: [markdown] })
```

Correct:

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export const highlightCode = remarkHighlightCodeBlocks({ highlighter })
```

The Markdown language highlights Markdown source; the adapters transform fenced blocks in a document tree.

Source: `docs/guides/markdown-pipelines.md`

### CRITICAL Running Remark after HAST conversion

Wrong:

```ts
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

export const processor = unified()
  .use(remarkRehype)
  .use(remarkHighlightCodeBlocks, { highlighter })
```

Correct:

```ts
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

export const processor = unified()
  .use(remarkHighlightCodeBlocks, { highlighter })
  .use(remarkRehype)
```

The Remark adapter must see MDAST `code` nodes before `remark-rehype` converts the tree.

Source: `docs/guides/markdown-pipelines.md`

### HIGH Enabling raw HTML without needing it

Wrong:

```ts
import {
  remarkCodeNodeToHtml,
  type RemarkCodeNode,
} from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export function transform(node: RemarkCodeNode) {
  return remarkCodeNodeToHtml(node, { highlighter })
}
```

Correct:

```ts
import {
  remarkCodeNodeToMdast,
  type RemarkCodeNode,
} from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export function transform(node: RemarkCodeNode) {
  return remarkCodeNodeToMdast(node, { highlighter })
}
```

The structured result already carries `hName`, `hProperties`, and `hChildren`.

Source: `src/remark.ts`

### HIGH Passing an undiscoverable Rehype shape

Wrong:

```html
<code data-language="tsx">const node = &lt;Button /&gt;</code>
```

Correct:

```html
<pre><code class="language-tsx">const node = &lt;Button /&gt;</code></pre>
```

The Rehype adapter discovers a `code` child under `pre` and reads its first `language-*` class.

Source: `src/rehype.ts`

### CRITICAL Mixing exact and block-normalized APIs

Wrong:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const serverHtml = highlighter.highlightToHtml('const value = 1\n', {
  lang: 'ts',
})
export const clientHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
```

Correct:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const serverHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
export const clientHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
```

`highlight()` preserves exact input, while fence and block-data helpers trim trailing block whitespace.

Source: `docs/guides/ssr-and-client.md`

### HIGH Tension: structured output versus raw HTML

Prefer structured MDAST/HAST transforms inside Markdown pipelines. Use generated `htmlMarkup` only at an application boundary that deliberately inserts escaped highlighter output.

See also: `integrate-framework-code-blocks/SKILL.md` - direct components own their HTML insertion boundary.

### HIGH Tension: exact source versus block normalization

Use the same block-level helper on server and client. Mixing core `highlight()` with Markdown helpers changes trailing whitespace behavior.

See also: `integrate-framework-code-blocks/SKILL.md` - hydrated output must use matching inputs and options.

## References

- [Direct fences and HAST helpers](references/direct-fences.md)
- [Remark adapter](references/remark.md)
- [Rehype adapter](references/rehype.md)

See also: `theme-and-annotate-code/SKILL.md` - fence metadata maps to titles, line numbers, and decorations.
