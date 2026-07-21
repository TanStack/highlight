---
title: Default Entry
---

# Default Entry

`@tanstack/highlight` registers every bundled language and exposes a ready-to-use singleton. It also re-exports the public core API.

```ts
import {
  highlight,
  highlightToHtml,
  listLanguages,
  normalizeLanguage,
  renderCodeBlockData,
  tokenize,
} from '@tanstack/highlight'
```

## Values

### `allLanguages`

A readonly tuple containing all bundled [`LanguageDefinition`](core#languagedefinition) objects. Its order is stable and matches [`listLanguages`](#listlanguages).

### `defaultHighlighter`

The [`Highlighter`](core#highlighter) used by every convenience function in this entry point. Its fallback is `plaintext`.

## Functions

### `normalizeLanguage`

```ts
function normalizeLanguage(lang?: string): HighlightLanguage
```

Returns the canonical registered language name for a name or alias. Names are trimmed and lowercased. Unknown or omitted values resolve to `plaintext`.

### `listLanguages`

```ts
function listLanguages(): Array<HighlightLanguage>
```

Returns the 25 canonical language names registered in `defaultHighlighter`.

### `tokenize`

```ts
function tokenize(code: string, options?: HighlightOptions): HighlightTokenResult
```

Returns normalized language information and semantic tokens without rendering HTML.

### `highlight`

```ts
function highlight(code: string, options?: HighlightOptions): HighlightResult
```

Returns `code`, `lang`, `tokens`, and a complete escaped `<pre><code>` string in `html`.

### `highlightToHtml`

```ts
function highlightToHtml(code: string, options?: HighlightOptions): string
```

Returns only the HTML produced by `highlight`.

### `renderCodeBlockData`

```ts
function renderCodeBlockData(options: {
  code: string
  decorations?: HighlightOptions['decorations']
  lang?: string
  lineNumbers?: boolean
  title?: string
}): RenderedCodeBlockData
```

Trims trailing whitespace from `code`, highlights it, and returns `copyText`, `htmlMarkup`, `lang`, `title`, and `tokens` for a code block component.

## Types

### `HighlightLanguage`

A union of every canonical language name included by this entry point. See the [language matrix](../language-support).

### `HighlightResult`

The core [`HighlightResult`](core#highlightresult) narrowed so `lang` is `HighlightLanguage`.

### `HighlightTokenResult`

The core [`HighlightTokenResult`](core#highlighttokenresult) narrowed so `lang` is `HighlightLanguage`.

### `RenderedCodeBlockData`

The core [`RenderedCodeBlockData`](core#renderedcodeblockdata) narrowed so `lang` is `HighlightLanguage`.

### `RenderCodeBlockOptions`

[`HighlightOptions`](core#highlightoptions) plus an optional `title`.

## Core re-exports

The default entry also exports `createHighlighter`, `defineLanguage`, `escapeHtml`, `renderNodesToHtml`, and `renderTokens`, along with these types: `Highlighter`, `HighlightDecoration`, `HighlightDecorationData`, `HighlightElementNode`, `HighlightLineDecoration`, `HighlightOptions`, `HighlightRangeDecoration`, `HighlightRenderNode`, `HighlightTextNode`, `HighlightToken`, `HighlightTokenClass`, `LanguageDefinition`, `TokenRange`, and `TokenizerContext`.

Their contracts are documented in the [core reference](core).
