---
title: SSR and Client Rendering
---

# SSR and Client Rendering

The recommended architecture is hydrated SSR: highlight the initial document on the server, then reuse the same synchronous registry for client navigations and dynamic content.

## Isomorphic module

```ts
// src/lib/highlight.ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { shell } from '@tanstack/highlight/languages/shell'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, js, json, shell, ts, tsx],
})
```

Do not put server-only imports in this module. The highlighter itself needs none.

## Server path

Highlight before serializing or streaming the code block:

```ts
const data = highlighter.renderCodeBlockData({
  code,
  lang,
  title,
  decorations,
})
```

Send or render `data.htmlMarkup`. Keep `data.copyText` for a copy button.

## Hydration

Server-rendered code does not need to be highlighted again. It is already static HTML controlled by CSS.

Use the client highlighter only for code introduced after hydration:

- Client-side route content not included in the initial payload
- Live Markdown previews
- Interactive examples that change source
- User-selected language variants

## Determinism

Server and client output match when all of these match:

- Source string
- Language registrations and order
- Language option
- Decorations and line-number option
- Package version

Themes do not affect highlighted markup.

## Avoid hydration mismatches

- Export one registry module used by both paths.
- Do not conditionally register languages with `window` checks.
- Normalize Markdown fence metadata before rendering on both paths.
- Do not highlight trimmed code on one path and untrimmed code on the other.

`renderCodeBlockData()` and `renderCodeFence()` trim trailing block whitespace consistently for copy/render workflows. `highlight()` preserves its input exactly.

## Caching

The highlighter is fast enough for normal docs pages without a cache. For large static builds, cache by package version, language, source, and decoration options if build time becomes material.

Do not cache theme variants separately. They share the same HTML.

## Why no worker?

The docs-sized path is synchronous and usually much cheaper than worker startup and message serialization. A worker is reasonable only for unusually large interactive inputs, which is outside the primary use case.
