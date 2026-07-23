---
name: 'extend-language-support'
description: >
  Extend @tanstack/highlight with defineLanguage, LanguageDefinition,
  TokenRange, HighlightTokenClass, and TokenizerContext. Load when adding a
  custom or shipped tokenizer, resolving overlapping ranges, delegating embedded
  code, preserving selective imports, or adding fixture, size, and throughput
  coverage.
metadata:
  type: core
  library: '@tanstack/highlight'
  library_version: '0.0.5'
requires:
  - 'configure-selective-highlighting'
sources:
  - 'TanStack/highlight:docs/guides/custom-languages.md'
  - 'TanStack/highlight:docs/guides/embedded-languages.md'
  - 'TanStack/highlight:docs/test-strategy.md'
  - 'TanStack/highlight:src/core.ts'
  - 'TanStack/highlight:src/languages'
---

This skill builds on `configure-selective-highlighting`. Read it first for explicit registration and optional embedding.

# Extend Language Support

## Setup

Define an isolated tokenizer that returns semantic source ranges:

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

export const highlighter = createHighlighter({
  languages: [taskList],
})
```

Gaps remain plain text automatically. Ranges must be non-overlapping, zero-based, end-exclusive UTF-16 offsets.

## Core Patterns

### Preserve exact source through tokenization

```ts
import { highlighter } from './task-list-highlighter'

const code = 'TODO write docs\nDONE add tests'
const result = highlighter.tokenize(code, { lang: 'tasks' })

export const sourceWasPreserved =
  result.tokens.map((token) => token.value).join('') === code
```

Source reconstruction is the primary tokenizer invariant.

### Delegate embedded content through the registry

```ts
import {
  createHighlighter,
  defineLanguage,
  type TokenRange,
} from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'

const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    const ranges: Array<TokenRange> = []
    const pattern = /<script>([\s\S]*?)<\/script>/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      const openStart = match.index
      const bodyStart = openStart + '<script>'.length
      const bodyEnd = bodyStart + match[1].length
      const closeEnd = bodyEnd + '</script>'.length

      ranges.push({ start: openStart, end: bodyStart, className: 'tag' })

      if (context.hasLanguage('js')) {
        ranges.push(
          ...context.tokenize(match[1], 'js').map((range) => ({
            ...range,
            start: range.start + bodyStart,
            end: range.end + bodyStart,
          })),
        )
      }

      ranges.push({ start: bodyEnd, end: closeEnd, className: 'tag' })
    }

    return ranges
  },
})

export const highlighter = createHighlighter({
  languages: [scriptDocument, js],
})
```

The outer definition remains independent of JavaScript; the application decides whether delegation is available.

### Prefer unclassified text over incorrect classes

```ts
import { defineLanguage, type TokenRange } from '@tanstack/highlight/core'

export const identifiers = defineLanguage({
  name: 'identifiers',
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const pattern = /\b[A-Z][A-Za-z0-9]*\b/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        className: 'type',
      })
    }

    return ranges
  },
})
```

Do not classify ambiguous gaps merely to increase token coverage.

## Common Mistakes

### CRITICAL Returning inclusive range ends

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function keywordRange(start: number, value: string): TokenRange {
  return {
    start,
    end: start + value.length - 1,
    className: 'keyword',
  }
}
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function keywordRange(start: number, value: string): TokenRange {
  return {
    start,
    end: start + value.length,
    className: 'keyword',
  }
}
```

Range ends match `String.prototype.slice()` and exclude the end offset.

Source: `docs/guides/custom-languages.md`

### HIGH Returning overlapping token ranges

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function tokenize(code: string): Array<TokenRange> {
  return [
    { start: 0, end: code.length, className: 'string' },
    { start: 6, end: 10, className: 'keyword' },
  ]
}
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function tokenize(code: string): Array<TokenRange> {
  const keywordStart = code.indexOf('TODO')

  return keywordStart < 0
    ? []
    : [
        {
          start: keywordStart,
          end: keywordStart + 'TODO'.length,
          className: 'keyword',
        },
      ]
}
```

The core sorts by source position and drops later overlaps, so an earlier broad range can suppress a specific range.

Source: `src/core.ts`

### CRITICAL Importing an embedded definition into a language

Wrong:

```ts
import { defineLanguage } from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'

export const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    return js.tokenize(code, context)
  },
})
```

Correct:

```ts
import { defineLanguage } from '@tanstack/highlight/core'

export const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    return context.hasLanguage('js') ? context.tokenize(code, 'js') : []
  },
})
```

Direct definition imports make an embedded dependency part of every outer-language bundle.

Source: `docs/guides/custom-languages.md`

### HIGH Inventing language-specific token classes

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export const range = {
  start: 0,
  end: 4,
  className: 'tsx-generic',
} as unknown as TokenRange
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export const range = {
  start: 0,
  end: 4,
  className: 'type',
} satisfies TokenRange
```

The fixed semantic union keeps every theme complete and language-independent.

Source: `src/core.ts`

### CRITICAL Shipping without tokenizer quality gates

Wrong:

```ts
import { defineLanguage } from '@tanstack/highlight/core'

export const taskList = defineLanguage({
  name: 'task-list',
  tokenize() {
    return []
  },
})
```

Correct:

```ts
import { expect, test } from 'vitest'
import { createHighlighter } from '@tanstack/highlight/core'
import { taskList } from '../src/languages/task-list'

test('task-list reconstructs valid source', () => {
  const highlighter = createHighlighter({ languages: [taskList] })
  const code = 'TODO write docs'
  const result = highlighter.tokenize(code, { lang: 'task-list' })

  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  expect(result.tokens.some((token) => token.className === 'keyword')).toBe(
    true,
  )
})
```

Shipped languages require valid-code fixtures, source reconstruction, focused regressions, and explicit-import size evaluation.

Source: `docs/guides/custom-languages.md`

### HIGH Omitting embedded tokenizer registration

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { scriptDocument } from './script-document'

export const highlighter = createHighlighter({
  languages: [scriptDocument],
})
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'
import { scriptDocument } from './script-document'

export const highlighter = createHighlighter({
  languages: [scriptDocument, js],
})
```

Delegation remains plain when the target definition is absent from the same registry.

Source: `docs/guides/embedded-languages.md`

### HIGH Tension: language isolation versus embedding depth

Use `TokenizerContext` for optional delegation and let the application register targets. Importing target definitions inside an outer tokenizer hides bundle cost.

See also: `configure-selective-highlighting/SKILL.md` - registration controls delegated language availability.

## References

- [Tokenizer contracts and repository implementation patterns](references/tokenizer-patterns.md)

See also: `configure-selective-highlighting/SKILL.md` - aliases, fallbacks, and embedded targets resolve through the registry.
