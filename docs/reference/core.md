---
title: Core API
---

# Core API

`@tanstack/highlight/core` contains the engine and renderers. It does not import a language or theme.

## Language registration

### `LanguageDefinition`

```ts
type LanguageDefinition<Name extends string = string> = {
  aliases?: ReadonlyArray<string>
  name: Name
  tokenize: (
    code: string,
    context: TokenizerContext,
  ) => ReadonlyArray<TokenRange>
}
```

A language registration. The tokenizer returns semantic ranges in the original source.

### `TokenRange`

```ts
type TokenRange = {
  className: HighlightTokenClass
  start: number
  end: number
}
```

`start` is inclusive and `end` is exclusive. Both are zero-based UTF-16 string offsets.

### `TokenizerContext`

```ts
type TokenizerContext = {
  hasLanguage: (lang: string) => boolean
  tokenize: (code: string, lang: string) => Array<TokenRange>
}
```

Passed to language tokenizers for opt-in embedded-language delegation. Recursive calls are capped at 24 levels.

### `defineLanguage`

```ts
function defineLanguage<const Name extends string>(
  definition: LanguageDefinition<Name>,
): LanguageDefinition<Name>
```

An identity helper that preserves the literal language name and validates the definition with TypeScript.

### `createHighlighter`

```ts
function createHighlighter(options: {
  fallbackLanguage?: string
  languages: ReadonlyArray<LanguageDefinition>
}): Highlighter
```

Builds an immutable highlighter interface from the supplied registrations. The default fallback name is `plaintext`. An unregistered language, including an unregistered fallback, is rendered as escaped plain text.

Duplicate canonical names or aliases use the last registration encountered.

## Highlighter

### `Highlighter`

```ts
type Highlighter = {
  highlight(code: string, options?: HighlightOptions): HighlightResult
  highlightToHtml(code: string, options?: HighlightOptions): string
  listLanguages(): Array<string>
  normalizeLanguage(lang?: string): string
  renderCodeBlockData(options: RenderCodeBlockOptions & { code: string }): RenderedCodeBlockData
  tokenize(code: string, options?: HighlightOptions): HighlightTokenResult
}
```

`listLanguages` returns canonical names, not aliases. `normalizeLanguage` returns a canonical name when registered and the configured fallback otherwise.

### `HighlightOptions`

| Field | Type | Meaning |
| --- | --- | --- |
| `lang` | `string` | Registered name or alias |
| `lineNumbers` | `boolean` | Wrap each line and emit line-number hooks |
| `decorations` | `ReadonlyArray<HighlightDecoration>` | Line or character-range annotations |

### `RenderCodeBlockOptions`

`HighlightOptions` plus an optional `title`.

### `HighlightTokenResult`

```ts
type HighlightTokenResult = {
  code: string
  lang: string
  tokens: Array<HighlightToken>
}
```

### `HighlightResult`

`HighlightTokenResult` plus `html`, a complete escaped `<pre><code>` string.

### `RenderedCodeBlockData`

```ts
type RenderedCodeBlockData = {
  copyText: string
  htmlMarkup: string
  lang: string
  title?: string
  tokens: Array<HighlightToken>
}
```

`renderCodeBlockData` trims trailing whitespace before creating every field.

## Tokens

### `HighlightTokenClass`

The semantic class union: `attr`, `code-inline`, `command`, `comment`, `deleted`, `function`, `heading`, `inserted`, `keyword`, `link`, `literal`, `meta`, `number`, `operator`, `property`, `selector`, `string`, `tag`, `type`, and `variable`.

### `HighlightToken`

```ts
type HighlightToken = {
  className?: HighlightTokenClass
  value: string
}
```

Untyped source segments omit `className`. Concatenating every `value` always reconstructs the input exactly.

## Decorations

### `HighlightDecorationData`

`Record<string, boolean | number | string>`. Keys become escaped `data-*` attributes on rendered spans.

### `HighlightRangeDecoration`

```ts
type HighlightRangeDecoration = {
  range: readonly [start: number, end: number]
  className?: string
  data?: HighlightDecorationData
}
```

The range uses zero-based, end-exclusive UTF-16 offsets.

### `HighlightLineDecoration`

```ts
type HighlightLineDecoration = {
  lines: number | readonly [start: number, end: number]
  className?: string
  data?: HighlightDecorationData
}
```

Lines are one-based and an interval includes both ends.

### `HighlightDecoration`

The union of `HighlightLineDecoration` and `HighlightRangeDecoration`. A decoration cannot contain both `lines` and `range`.

## Render tree

### `HighlightTextNode`

```ts
type HighlightTextNode = { type: 'text'; value: string }
```

### `HighlightElementNode`

```ts
type HighlightElementNode = {
  type: 'element'
  classNames: Array<string>
  data?: Record<string, string>
  children: Array<HighlightRenderNode>
}
```

### `HighlightRenderNode`

The union of `HighlightTextNode` and `HighlightElementNode`.

### `renderTokens`

```ts
function renderTokens(
  tokens: ReadonlyArray<HighlightToken>,
  options?: Pick<HighlightOptions, 'decorations' | 'lineNumbers'>,
): Array<HighlightRenderNode>
```

Converts flat tokens to the renderer-neutral tree. It adds `th-*` token spans, decoration spans, and `th-line` wrappers when line numbers or line decorations require them.

### `renderNodesToHtml`

```ts
function renderNodesToHtml(nodes: ReadonlyArray<HighlightRenderNode>): string
```

Serializes render nodes to escaped HTML.

### `escapeHtml`

```ts
function escapeHtml(value: string): string
```

Escapes `&`, `<`, `>`, double quotes, and single quotes for HTML text output.
