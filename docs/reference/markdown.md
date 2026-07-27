---
title: Markdown API
---

# Markdown API

`@tanstack/highlight/markdown` converts Markdown code-fence inputs into rendered block data or HAST. It does not parse Markdown documents.

## TanStack Markdown adapter

### `TanStackMarkdownHighlighterOptions`

```ts
type TanStackMarkdownHighlighterOptions = {
  highlightLines?: ReadonlyArray<number>
  lineNumbers?: boolean
}
```

### `TanStackMarkdownHighlighter`

A synchronous callback matching TanStack Markdown's code-highlighter contract without importing `@tanstack/markdown`.

### `createTanStackMarkdownHighlighter`

```ts
function createTanStackMarkdownHighlighter(
  highlighter: Highlighter,
): TanStackMarkdownHighlighter
```

Returns escaped inner token markup for a renderer-owned `<code>` element. Highlighted lines receive `th-line--highlighted`; unknown languages use the highlighter's configured fallback.

## Metadata

### `parseCodeDiffNotation`

```ts
function parseCodeDiffNotation(code: string): {
  code: string
  decorations: Array<HighlightDecoration>
}
```

Removes trailing `[!code ++]` and `[!code --]` directives and returns `th-line--inserted` and `th-line--deleted` decorations for their one-based line numbers. JavaScript-style line and block comments, `#` line comments, and HTML comments are supported.

### `CodeFenceMeta`

```ts
type CodeFenceMeta = {
  decorations: Array<HighlightDecoration>
  lineNumbers: boolean
  title?: string
}
```

### `parseCodeFenceMeta`

```ts
function parseCodeFenceMeta(meta?: string | null): CodeFenceMeta
```

Recognizes `title`, `filename`, `file`, `name`, `lineNumbers`, `showLineNumbers`, shorthand highlighted lines, and named line annotations. Invalid line fragments are ignored. See [Annotations](../guides/annotations).

### `getCodeFenceTitle`

```ts
function getCodeFenceTitle(meta?: string | null): string | undefined
```

Returns the trimmed value of the first `title`, `filename`, `file`, or `name` assignment. Single-quoted, double-quoted, and unquoted values are accepted.

## Fence rendering

### `CodeFenceInput`

```ts
type CodeFenceInput = {
  code: string
  decorations?: ReadonlyArray<HighlightDecoration>
  lang?: string | null
  lineNumbers?: boolean
  meta?: string | null
  title?: string | null
}
```

Inline diff notation is converted first, followed by metadata and explicit `decorations`. Explicit `lineNumbers` takes precedence over metadata. Explicit `title` takes precedence when it is non-empty.

### `HighlightedCodeFence`

[`RenderedCodeBlockData`](core#renderedcodeblockdata) plus the resolved `decorations` and `lineNumbers`.

### `renderCodeFence`

```ts
function renderCodeFence(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HighlightedCodeFence
```

Parses inline diff notation and metadata, then delegates to the supplied highlighter.

## HAST

### `HastText`

A HAST-compatible text node with `type: 'text'` and `value`.

### `HastElement`

A HAST-compatible element node with `type`, `tagName`, optional `properties`, and recursive `children`.

### `codeFenceToHast`

```ts
function codeFenceToHast(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HastElement
```

Returns a `<pre class="th-code th-code--LANG"><code>...</code></pre>` HAST tree. A title is exposed as `dataTitle` on the `pre` node.

### `tokensToHast`

```ts
function tokensToHast(
  tokens: ReadonlyArray<HighlightToken>,
  lang: string,
  options?: {
    decorations?: ReadonlyArray<HighlightDecoration>
    lineNumbers?: boolean
    title?: string
  },
): HastElement
```

Renders existing tokens to the same HAST structure without tokenizing code.
