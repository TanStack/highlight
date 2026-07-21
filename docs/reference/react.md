---
title: React API
---

# React API

`@tanstack/highlight/react` prepares code-block data for React components. It intentionally does not import React, render elements, own copy state, or inject CSS.

## `CreateHighlightedCodeBlockPropsOptions`

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

## `HighlightedCodeBlockProps`

[`RenderedCodeBlockData`](core#renderedcodeblockdata) plus an optional `className`.

## `createHighlightedCodeBlockProps`

```ts
function createHighlightedCodeBlockProps(
  options: CreateHighlightedCodeBlockPropsOptions,
): HighlightedCodeBlockProps
```

Calls `highlighter.renderCodeBlockData` and preserves `className`. It is deterministic and produces the same data during SSR and hydration.

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'

function CodeBlock(input: Omit<CreateHighlightedCodeBlockPropsOptions, 'highlighter'>) {
  const block = createHighlightedCodeBlockProps({ ...input, highlighter })

  return (
    <figure className={block.className}>
      {block.title ? <figcaption>{block.title}</figcaption> : null}
      <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
    </figure>
  )
}
```

`htmlMarkup` is escaped by the library. Do not append unrelated unescaped HTML to it before rendering. See the [React guide](../guides/react).
