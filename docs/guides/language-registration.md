---
title: Language Registration
---

# Language Registration

Language registration is the main bundle-size control in TanStack Highlight.

## Create a selective highlighter

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { json } from '@tanstack/highlight/languages/json'
import { shell } from '@tanstack/highlight/languages/shell'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [json, shell, tsx],
})
```

The resulting registry contains three definitions plus their aliases. It does not load a global grammar catalog.

```ts
highlighter.listLanguages()
// ['json', 'shell', 'tsx']

highlighter.normalizeLanguage('bash')
// 'shell'

highlighter.normalizeLanguage('python')
// 'plaintext'
```

Aliases belong to definitions. `bash` resolves only because `shell` was registered.

## Fallback behavior

The default fallback name is `plaintext`:

```ts
const result = highlighter.highlight('<unsafe>', {
  lang: 'not-registered',
})

result.lang
// 'plaintext'

result.html
// The angle brackets are escaped.
```

You can choose another registered fallback language:

```ts
const highlighter = createHighlighter({
  fallbackLanguage: 'json',
  languages: [json],
})
```

Unknown inputs will then be tokenized as JSON. An unregistered fallback name still produces escaped plaintext under that name, but registering `plaintext` is clearer when plain output is intentional.

## Root convenience entry

The package root constructs a highlighter with `allLanguages` and exports bound helpers:

```ts
import {
  defaultHighlighter,
  highlight,
  highlightToHtml,
  listLanguages,
  normalizeLanguage,
  renderCodeBlockData,
  tokenize,
} from '@tanstack/highlight'
```

This is convenient, but importing any bound helper retains the all-language registry. Use `@tanstack/highlight/core` when browser size matters.

## Share one registry

Create the highlighter once at module scope:

```ts
// code-highlighter.ts
export const highlighter = createHighlighter({
  languages: [json, shell, tsx],
})
```

There is no benefit to creating one per block. The registry is immutable after construction and safe to reuse across server requests and client renders.

## Aggregate imports

The aggregate entry exposes every shipped language module:

```ts
import { json, shell, tsx } from '@tanstack/highlight/languages'
```

A tree-shaking bundler can remove unused definitions because the package is side-effect free. Prefer direct subpaths when the bundle must make isolation explicit:

```ts
import { json } from '@tanstack/highlight/languages/json'
```

See [Language Support](../language-support) for every name and alias.
