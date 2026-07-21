---
title: Custom Languages
---

# Custom Languages

A language definition maps source ranges to the library's semantic token classes.

## Minimal definition

```ts
import {
  createHighlighter,
  defineLanguage,
  type TokenRange,
} from '@tanstack/highlight/core'

const taskList = defineLanguage({
  name: 'task-list',
  aliases: ['tasks'],
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const pattern = /\b(?:TODO|DONE|BLOCKED)\b/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        className: match[0] === 'DONE' ? 'inserted' : 'keyword',
      })
    }

    return ranges
  },
})

const highlighter = createHighlighter({
  languages: [taskList],
})
```

`defineLanguage()` is an identity helper that preserves the literal `name` type.

## Range contract

Each `TokenRange` contains:

```ts
type TokenRange = {
  start: number
  end: number
  className: HighlightTokenClass
}
```

Ranges use zero-based, end-exclusive UTF-16 offsets. Return them in priority order. The core bounds, orders, and removes overlaps before creating tokens.

Prefer leaving text unclassified over assigning an inaccurate class. Gaps are preserved as plain text automatically.

## Delegation

The tokenizer receives a `TokenizerContext`:

```ts
type TokenizerContext = {
  hasLanguage(lang: string): boolean
  tokenize(code: string, lang: string): Array<TokenRange>
}
```

An outer definition can delegate a substring and offset the returned ranges into its own source coordinates. Check `hasLanguage()` first so the dependency remains optional.

Avoid making a custom definition import another shipped definition directly. Registry delegation preserves selective imports and lets the application decide dependencies.

## Semantic classes only

Custom definitions must use an existing `HighlightTokenClass`. This keeps themes complete and prevents language-specific CSS scope proliferation.

## Contribution bar

A new shipped language should have:

- A real documentation use case
- An isolated module
- Common valid-code fixtures
- Source reconstruction coverage
- Focused tests for any context-aware scanner
- Acceptable impact only when explicitly imported

A language requiring a general grammar runtime is not a fit for this package.
