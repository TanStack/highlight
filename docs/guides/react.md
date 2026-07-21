---
title: React Integration
---

# React Integration

TanStack Highlight has no React runtime dependency. The React entry only prepares a generic data shape for an application-owned code block component.

## Create component props

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

const props = createHighlightedCodeBlockProps({
  highlighter,
  code: `const answer = 42`,
  lang: 'ts',
  title: 'answer.ts',
  className: 'docs-code',
})
```

The result contains `copyText`, `htmlMarkup`, `lang`, `title`, `tokens`, and the optional `className`.

## Application component

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
      <button type="button" onClick={() => navigator.clipboard.writeText(copyText)}>
        Copy
      </button>
    </figure>
  )
}
```

`htmlMarkup` is escaped output produced by the library. Do not pass arbitrary user HTML through the same prop.

## SSR

Call `createHighlightedCodeBlockProps()` during server rendering. The returned markup is deterministic, so React can hydrate the surrounding component without rerunning highlighting.

## Why this is not a component package

Code blocks differ substantially across documentation systems: copy controls, filenames, tabs, collapsible sections, line callouts, and responsive behavior all belong to the application. The helper keeps highlighting generic instead of imposing TanStack-specific UI props.

You can skip the React helper and call `highlighter.renderCodeBlockData()` directly; they return the same core data plus `className` handling.
