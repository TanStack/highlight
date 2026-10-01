---
title: Language Registration
---

# Language Registration

Imports determine which language modules can reach your bundle; registration determines which of those languages the highlighter can use. Import definitions from direct subpaths and register the languages your content needs. Removing a definition from the registry does not guarantee that a bundler removes its imported module.

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

Core helpers re-exported from the root, such as `createHighlighter`, `defineLanguage`, and `escapeHtml`, don't need that registry. Importing only those helpers lets a compatible bundler remove every built-in language.

## Share one registry

Create the highlighter once at module scope:

```ts
// code-highlighter.ts
export const highlighter = createHighlighter({
  languages: [json, shell, tsx],
})
```

Reuse the highlighter across blocks and server requests to avoid rebuilding its name and alias maps. There is no API for adding registrations after construction; create another highlighter when the language set changes. Language definitions are retained by reference, so keep their tokenizers unchanged and free of request-specific state.

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
