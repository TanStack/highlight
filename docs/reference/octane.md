---
title: Octane API
---

# Octane API

`@tanstack/highlight/octane` adapts highlighted block data to Octane components and adapts the Rehype transformer to `@octanejs/mdx` plugin configuration. It has no framework dependency.

## Component data

### `CreateHighlightedCodeBlockPropsOptions`

```ts
type CreateHighlightedCodeBlockPropsOptions = {
  className?: string
  code: string
  decorations?: ReadonlyArray<HighlightDecoration>
  highlighter: Highlighter
  lang?: string
  lineNumbers?: boolean
  title?: string
}
```

### `HighlightedCodeBlockProps`

```ts
type HighlightedCodeBlockProps = RenderedCodeBlockData & {
  className?: string
  dangerouslySetInnerHTML: { __html: string }
}
```

`dangerouslySetInnerHTML.__html` and `htmlMarkup` contain the same escaped `<pre><code>` tree.

### `createHighlightedCodeBlockProps`

```ts
function createHighlightedCodeBlockProps(
  options: CreateHighlightedCodeBlockPropsOptions,
): HighlightedCodeBlockProps
```

Calls `highlighter.renderCodeBlockData`, preserves `className`, and creates the raw-HTML payload accepted by Octane host elements. The result is deterministic across server rendering and hydration.

## MDX plugin

### `OctaneMdxHighlightOptions`

An alias of [`RehypeHighlightOptions`](rehype#rehypehighlightoptions). It requires an explicit `highlighter` and accepts `lineNumbers`, `getDecorations`, and `getTitle`.

### `OctaneMdxHighlightPlugin`

```ts
type OctaneMdxHighlightPlugin = [
  plugin: typeof rehypeHighlightCodeBlocks,
  options: OctaneMdxHighlightOptions,
]
```

A mutable Unified plugin tuple accepted inside the `rehypePlugins` array exposed by `@octanejs/mdx`.

### `createOctaneMdxHighlight`

```ts
function createOctaneMdxHighlight(
  options: OctaneMdxHighlightOptions,
): OctaneMdxHighlightPlugin
```

Returns `[rehypeHighlightCodeBlocks, options]`. The underlying transformer is synchronous, emits structured HAST, and skips already highlighted `th-code` blocks.

See the [Octane guide](../guides/octane) for Vite, MDX, and direct-component examples.
