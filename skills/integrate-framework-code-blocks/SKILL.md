---
name: 'integrate-framework-code-blocks'
description: >
  Integrate @tanstack/highlight with React code-block props, Octane
  dangerouslySetInnerHTML data, createOctaneMdxHighlight, hydrated SSR, and
  post-navigation client content. Load when implementing application-owned code
  components or sharing highlighted output across server and client.
metadata:
  type: composition
  library: '@tanstack/highlight'
  library_version: '0.0.5'
requires:
  - 'configure-selective-highlighting'
  - 'integrate-markdown-pipelines'
sources:
  - 'TanStack/highlight:docs/guides/react.md'
  - 'TanStack/highlight:docs/guides/octane.md'
  - 'TanStack/highlight:docs/guides/ssr-and-client.md'
  - 'TanStack/highlight:src/react.ts'
  - 'TanStack/highlight:src/octane.ts'
---

This skill requires `configure-selective-highlighting` and `integrate-markdown-pipelines`. Read them first for registry and tree-transform behavior.

# Integrate Framework Code Blocks

## Integration Setup

Create the highlighter in an isomorphic module, then pass it into the adapter:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'

const highlighter = createHighlighter({ languages: [ts, tsx] })

export const block = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const answer = 42',
  lang: 'ts',
  title: 'answer.ts',
  className: 'docs-code',
})
```

The adapters import no React, Octane, or MDX runtime and register no languages.

## Core Integration Patterns

### Render React-owned controls around generated markup

```tsx
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
}: HighlightedCodeBlockProps) {
  return (
    <figure className={className}>
      {title ? <figcaption>{title}</figcaption> : null}
      <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(copyText)}
      >
        Copy
      </button>
    </figure>
  )
}
```

Copy controls, tabs, filenames, and layout remain application-owned.

### Configure Octane MDX with a plugin tuple

```ts
import { octaneMdx } from '@octanejs/mdx/vite'
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export default {
  plugins: [
    octaneMdx({
      rehypePlugins: [
        createOctaneMdxHighlight({
          highlighter,
          lineNumbers: true,
        }),
      ],
    }),
  ],
}
```

The tuple wraps the synchronous Rehype adapter expected by `@octanejs/mdx`.

### Highlight only content introduced after hydration

```ts
import { highlighter } from './highlight'

export function renderClientNavigationCode(code: string, lang: string) {
  return highlighter.renderCodeBlockData({ code, lang })
}
```

Initial server-rendered code is already static highlighted HTML; use the client registry for new routes, previews, or interactive source changes.

## Common Mistakes

### HIGH Nesting complete markup inside code

Wrong:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function CodeBlock() {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code: 'const answer = 42',
    lang: 'ts',
  })

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
    </pre>
  )
}
```

Correct:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function CodeBlock() {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code: 'const answer = 42',
    lang: 'ts',
  })

  return <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
}
```

`htmlMarkup` already contains the complete `pre > code` tree, so wrapping it creates invalid nested block markup.

Source: `docs/guides/react.md`

### CRITICAL Inserting arbitrary HTML through block props

Wrong:

```tsx
export function UserContent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

Correct:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function UserCode({ code }: { code: string }) {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code,
    lang: 'plaintext',
  })

  return <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
}
```

The highlighter escapes code source; the insertion prop does not sanitize unrelated HTML.

Source: `docs/guides/react.md`

### HIGH Rehighlighting initial DOM during hydration

Wrong:

```tsx
import { highlighter } from './highlight'
import { useEffect } from 'react'

export function HydratedCode() {
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((node) => {
      const pre = node.parentElement
      const language = [...node.classList]
        .find((name) => name.startsWith('language-'))
        ?.slice('language-'.length)

      if (pre) {
        pre.outerHTML = highlighter.highlightToHtml(node.textContent || '', {
          lang: language,
        })
      }
    })
  }, [])

  return null
}
```

Correct:

```tsx
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function HydratedCode({ htmlMarkup }: HighlightedCodeBlockProps) {
  return <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
}
```

Server-rendered highlighted HTML is static and does not need a hydration effect.

Source: `docs/guides/ssr-and-client.md`

### HIGH Passing a bare transformer to Octane

Wrong:

```ts
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { highlighter } from './src/highlight'

export const rehypePlugins = [
  rehypeHighlightCodeBlocks({ highlighter }),
]
```

Correct:

```ts
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export const rehypePlugins = [
  createOctaneMdxHighlight({ highlighter }),
]
```

Octane MDX consumes the plugin-and-options tuple returned by its adapter.

Source: `docs/guides/octane.md`

### CRITICAL Diverging server and client registries

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

const languages = typeof window === 'undefined' ? [html, js] : [html]

export const highlighter = createHighlighter({ languages })
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

export const highlighter = createHighlighter({ languages: [html, js] })
```

Different registrations change normalized languages and embedded output during hydration.

Source: `docs/guides/ssr-and-client.md`

### CRITICAL Mixing exact and block-normalized APIs

Wrong:

```ts
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export const serverHtml = highlighter.highlightToHtml('const value = 1\n', {
  lang: 'ts',
})
export const clientHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
```

Correct:

```ts
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export const serverHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
export const clientHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
```

Block-data adapters trim trailing whitespace while core `highlight()` preserves it.

Source: `docs/guides/ssr-and-client.md`

### HIGH Tension: convenience versus client size

Adapters accept an explicit highlighter so the application controls retained languages. Passing root helpers around defeats that boundary.

See also: `configure-selective-highlighting/SKILL.md` - build one selective isomorphic registry.

### HIGH Tension: structured output versus raw HTML

Use structured HAST in MDX pipelines. Insert generated `htmlMarkup` only inside an application-owned direct component.

See also: `integrate-markdown-pipelines/SKILL.md` - Remark and Rehype can avoid raw HTML.

### HIGH Tension: exact source versus block normalization

Use the same adapter and options for server and client output. Theme selection does not affect markup, but source normalization does.

See also: `integrate-markdown-pipelines/SKILL.md` - fence helpers share block normalization.

## References

- [React component data](references/react.md)
- [Octane component data](references/octane-components.md)
- [Octane MDX](references/octane-mdx.md)

See also: `configure-selective-highlighting/SKILL.md` - SSR and client output require the same registry and package version.
