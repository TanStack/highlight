# tanstack.com Integration Notes

Previous site renderer:

- `tanstack.com/src/components/markdown/renderCodeBlock.server.tsx`
- Creates a Shiki highlighter.
- Lazily loads languages.
- Calls `codeToHtml` once per theme and joins the markup.

Small isomorphic replacement shape:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { jsx } from '@tanstack/highlight/languages/jsx'
import { markdown } from '@tanstack/highlight/languages/markdown'
import { shell } from '@tanstack/highlight/languages/shell'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, js, json, jsx, markdown, shell, ts, tsx],
})
```

Install the published package in `tanstack.com` with:

```sh
pnpm add @tanstack/highlight
```

It removes direct `shiki` and `@shikijs/transformers` dependencies from the site.

Hydrated client path:

- Server-rendered docs call `highlighter.renderCodeBlockData()` before streaming.
- Hydrated/client-rendered markdown imports the same highlighter module.
- The old client server-function round trip for code block highlighting is not needed.
- Mermaid stays separate because it has diagram rendering behavior, not just syntax highlighting.

The helper returns:

```ts
type RenderedCodeBlockData = {
  copyText: string
  htmlMarkup: string
  lang: string
  title?: string
  tokens: Array<HighlightToken>
}
```

Behavioral differences:

- `htmlMarkup` contains one `<pre><code>` tree instead of one tree per theme.
- Theme switching is CSS-only through variables from `createThemeCss()`.
- The function is synchronous; existing `await renderCodeBlockData(...)` call sites still work because `await` accepts non-Promise values.
- Unknown languages normalize to `plaintext`.
- Mermaid is highlighted lightly as Mermaid text, not rendered as a diagram.

CSS requirement:

Add the output of `createThemeCss({ light, dark })` once in the app stylesheet or translate its variables/classes into the existing Tailwind/CSS setup. The local site patch uses classes in `src/styles/app.css`.

Markdown adapter options:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
```

Use `rehypeHighlightCodeBlocks({ highlighter })` when the pipeline already has `<pre><code class="language-*">` HAST nodes. It emits normal HAST elements and spans, not raw HTML.

Use `remarkHighlightCodeBlocks({ highlighter })` before `remark-rehype`. It replaces mdast `code` nodes with an extension node carrying standard HAST data, so the pipeline does not need raw HTML enabled.

Theme options:

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'
import { auroraXTheme } from '@tanstack/highlight/themes/aurora-x'

const css = createThemeCss({
  light: githubLightTheme,
  dark: auroraXTheme,
  darkSelector: '.dark',
})
```

Each theme lives in its own subpath. Importing one theme does not import the rest of the collection.

Evaluation artifact:

```sh
pnpm run report:compare
```

This generates `artifacts/shiki-comparison.html`, with one real TanStack docs sample per normalized language next to the pinned development version of Shiki.

Runtime comparison:

```sh
pnpm run compare:shiki
```

Latest local run over 333 real docs fixtures:

```txt
ours: 19ms highlight, 364 KiB HTML
shiki: 23ms init, 1253ms highlight, 1252 KiB HTML
```

Shiki fell back for `ejs` and `env` in that run.
