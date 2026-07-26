---
title: Markdown Pipelines
---

# Markdown Pipelines

TanStack Highlight provides helpers at three different Markdown boundaries. All accept an explicit highlighter so adapters do not import every language.

## TanStack Markdown

TanStack Markdown owns the surrounding `<pre><code>` elements. Use the dedicated adapter to return only Highlight's escaped inner token markup:

```ts
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const highlightMarkdownCode =
  createTanStackMarkdownHighlighter(highlighter)
```

Pass the same callback to the React or HTML renderer:

```tsx
import { Markdown } from '@tanstack/markdown/react'
import { highlightMarkdownCode } from './markdown-highlighter'

export function Article({ source }: { source: string }) {
  return (
    <Markdown highlighter={highlightMarkdownCode} codeLineNumbers>
      {source}
    </Markdown>
  )
}
```

The adapter maps parsed highlighted lines to `th-line--highlighted`, preserves line-number wrappers, escapes source text, and degrades unknown languages to escaped plaintext. It does not import TanStack Markdown or any languages.

Generate theme CSS against Markdown's wrapper classes:

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const markdownHighlightCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: '.markdown-renderer',
  darkSelector: '.dark .markdown-renderer',
  codeBlockSelector: '.markdown-renderer pre.tm-code',
  lineNumbersSelector: '.markdown-renderer .tm-code--line-numbers',
})
```

Wrap the rendered document in `.markdown-renderer`. Add application CSS for `.th-line--highlighted` if highlighted lines need a background.

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

`@octanejs/mdx` users can wrap the Rehype adapter in its expected plugin tuple with [`createOctaneMdxHighlight()`](octane#octane-mdx).
