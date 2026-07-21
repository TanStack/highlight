---
title: Markdown API
---

# Markdown API

`@tanstack/highlight/markdown` converts Markdown code-fence inputs into rendered block data or HAST. It does not parse Markdown documents.

## Metadata

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

Explicit `decorations` are appended after metadata decorations. Explicit `lineNumbers` takes precedence over metadata. Explicit `title` takes precedence when it is non-empty.

### `HighlightedCodeFence`

[`RenderedCodeBlockData`](core#renderedcodeblockdata) plus the resolved `decorations` and `lineNumbers`.

### `renderCodeFence`

```ts
function renderCodeFence(
  input: CodeFenceInput,
  highlighter: Highlighter,
): HighlightedCodeFence
```

Parses metadata and delegates to the supplied highlighter.

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
