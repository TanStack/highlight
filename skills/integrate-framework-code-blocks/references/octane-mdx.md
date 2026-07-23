# Octane MDX

`createOctaneMdxHighlight(options)` returns:

```ts
[
  rehypeHighlightCodeBlocks,
  options,
]
```

Pass that tuple to `@octanejs/mdx`:

```ts
import { octaneMdx } from '@octanejs/mdx/vite'
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export default {
  plugins: [
    octaneMdx({
      rehypePlugins: [
        createOctaneMdxHighlight({
          highlighter,
          lineNumbers: true,
          getTitle(node) {
            const title = node.properties?.dataTitle
            return typeof title === 'string' ? title : undefined
          },
        }),
      ],
    }),
  ],
}
```

The transform is synchronous and works with both `compileMdx()` and `compileMdxSync()`. It replaces `pre > code.language-*` with structured highlighted HAST and emits no raw HTML.
