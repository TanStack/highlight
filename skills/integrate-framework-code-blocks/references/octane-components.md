# Octane Component Data

`@tanstack/highlight/octane` has no Octane runtime dependency. Its direct helper adds Octane's HTML insertion shape to core block data.

```tsrx
import {
  createHighlightedCodeBlockProps,
  type CreateHighlightedCodeBlockPropsOptions,
} from '@tanstack/highlight/octane'
import { highlighter } from './highlight'

type CodeBlockProps = Omit<
  CreateHighlightedCodeBlockPropsOptions,
  'highlighter'
>

export function CodeBlock(props: CodeBlockProps) @{
  const block = createHighlightedCodeBlockProps({
    ...props,
    highlighter,
  })

  <figure class={block.className}>
    @if (block.title) {
      <figcaption>{block.title}</figcaption>
    }
    <div dangerouslySetInnerHTML={block.dangerouslySetInnerHTML} />
  </figure>
}
```

The returned object contains:

- `className`
- `copyText`
- `dangerouslySetInnerHTML: { __html: htmlMarkup }`
- `htmlMarkup`
- `lang`
- `title`
- `tokens`

Only insert the generated object. It does not sanitize arbitrary application HTML.
