# Direct Fence and HAST Helpers

## `renderCodeFence`

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const block = renderCodeFence(
  {
    code: 'const answer = 42\n',
    lang: 'ts',
    meta: 'title="answer.ts" {1} lineNumbers',
  },
  highlighter,
)
```

Explicit `decorations`, `lineNumbers`, and `title` override or extend parsed metadata:

- Parsed decorations come before explicit decorations.
- Explicit `lineNumbers` overrides metadata when defined.
- Explicit `title` wins over a parsed title.
- `copyText` and highlighted source use `code.trimEnd()`.

## `codeFenceToHast`

```ts
import { codeFenceToHast } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const node = codeFenceToHast(
  {
    code: 'const answer = 42',
    lang: 'ts',
    lineNumbers: true,
  },
  highlighter,
)
```

The result is a structured HAST `pre` element with a `code` child.

## `tokensToHast`

```ts
import { tokensToHast } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

const result = highlighter.tokenize('const answer = 42', { lang: 'ts' })

export const node = tokensToHast(result.tokens, result.lang, {
  lineNumbers: true,
  title: 'answer.ts',
})
```

Use this when tokenization and tree construction occur in separate application layers.

## Fence Metadata

| Syntax | Output |
| --- | --- |
| `title="App.tsx"` | `title: "App.tsx"` |
| `filename=App.tsx` | `title: "App.tsx"` |
| `{2,4-6}` | highlighted line decorations |
| `highlight={2}` | highlighted line decorations |
| `ins={2}` | inserted line decorations |
| `del={2}` | deleted line decorations |
| `focus={2}` | focused line decorations |
| `error={2}` | error line decorations |
| `warning={2}` | warning line decorations |
| `lineNumbers` | line-number wrappers |
| `showLineNumbers` | line-number wrappers |
