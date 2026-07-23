# React Component Data

`@tanstack/highlight/react` has no React runtime dependency. It exports a data helper and types.

```tsx
import {
  createHighlightedCodeBlockProps,
  type CreateHighlightedCodeBlockPropsOptions,
} from '@tanstack/highlight/react'
import { highlighter } from './highlight'

type CodeBlockProps = Omit<
  CreateHighlightedCodeBlockPropsOptions,
  'highlighter'
>

export function CodeBlock(options: CodeBlockProps) {
  const block = createHighlightedCodeBlockProps({
    ...options,
    highlighter,
  })

  return (
    <figure className={block.className}>
      {block.title ? <figcaption>{block.title}</figcaption> : null}
      <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(block.copyText)}
      >
        Copy
      </button>
    </figure>
  )
}
```

The returned object contains:

- `className`
- `copyText`
- `htmlMarkup`
- `lang`
- `title`
- `tokens`

It accepts `code`, `decorations`, `highlighter`, `lang`, `lineNumbers`, `title`, and `className`.
