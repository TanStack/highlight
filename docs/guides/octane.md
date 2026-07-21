---
title: Octane Integration
---

# Octane Integration

`@tanstack/highlight/octane` supports direct Octane components and `@octanejs/mdx`. It has no Octane runtime dependency and does not register languages automatically.

## Shared highlighter

Create the same selective highlighter used by the rest of the application:

```ts
// src/highlight.ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { js } from '@tanstack/highlight/languages/js'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, js, ts, tsx],
})
```

## Octane MDX

`createOctaneMdxHighlight()` returns the synchronous rehype-plugin tuple expected by `@octanejs/mdx`:

```ts
// vite.config.ts
import { octaneMdx } from '@octanejs/mdx/vite'
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export default {
  plugins: [
    octaneMdx({
      rehypePlugins: [
        createOctaneMdxHighlight({ highlighter }),
      ],
    }),
  ],
}
```

The plugin replaces Markdown `<pre><code class="language-*">` nodes with structured highlighted HAST. It emits no raw HTML and works in both `compileMdx()` and `compileMdxSync()`.

Add line numbers or application decorations through the same options as the Rehype adapter:

```ts
const highlight = createOctaneMdxHighlight({
  highlighter,
  lineNumbers: true,
  getTitle(node) {
    return node.properties?.dataTitle as string | undefined
  },
})
```

Because highlighting is synchronous and deterministic, separate Octane client and server compilations produce the same highlighted payload when they use the same package version, registry, and options. Theme changes remain CSS-only.

## Direct components

`createHighlightedCodeBlockProps()` prepares escaped markup and Octane's `dangerouslySetInnerHTML` object together:

```tsrx
import {
  createHighlightedCodeBlockProps,
  type CreateHighlightedCodeBlockPropsOptions,
} from '@tanstack/highlight/octane'
import { highlighter } from './highlight'

type CodeBlockProps = Omit<
  CreateHighlightedCodeBlockPropsOptions,
  'highlighter'
>

export function CodeBlock(props: CodeBlockProps) @{
  const block = createHighlightedCodeBlockProps({
    ...props,
    highlighter,
  })

  <figure class={block.className}>
    @if (block.title) {
      <figcaption>{block.title}</figcaption>
    }
    <div dangerouslySetInnerHTML={block.dangerouslySetInnerHTML} />
  </figure>
}
```

The result also exposes `copyText`, `lang`, `title`, and `tokens` for application-owned controls. Do not add arbitrary unescaped HTML to `dangerouslySetInnerHTML.__html`.

## Bundle behavior

The Octane entry imports renderer and Rehype helpers, but no language, theme, `octane`, or `@octanejs/mdx` code. Direct language subpaths remain the bundle-size control.
