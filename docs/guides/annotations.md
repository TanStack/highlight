---
title: Annotations
---

# Annotations

Annotations add application classes and data to lines or exact source ranges without changing the token stream.

## Line decorations

Line numbers are one-based:

```ts
const result = highlighter.highlight(code, {
  lang: 'ts',
  decorations: [
    { lines: 2, className: 'is-focused' },
    { lines: [4, 6], className: 'is-highlighted' },
  ],
})
```

`lines: [4, 6]` includes lines 4, 5, and 6.

Line decorations activate `th-line` wrappers even when `lineNumbers` is false.

## Character-range decorations

Character ranges are zero-based, end-exclusive UTF-16 offsets, matching `String.prototype.slice()`:

```ts
const code = `const answer = unknownValue`
const start = code.indexOf('unknownValue')

const result = highlighter.highlight(code, {
  lang: 'ts',
  decorations: [
    {
      range: [start, start + 'unknownValue'.length],
      className: 'is-error',
      data: { message: 'Unknown identifier', severity: 2 },
    },
  ],
})
```

The renderer splits token boundaries as needed and wraps the selected text with `th-decoration` plus your classes. Overlapping decorations remain valid nested HTML.

## Line numbers

```ts
highlighter.highlight(code, {
  lang: 'ts',
  lineNumbers: true,
})
```

This adds `th-code--line-numbers`, line wrappers, and `data-line`. Base theme CSS renders the number with `::before`.

## Fence annotations

The Markdown helpers recognize common metadata:

````md
```tsx title="App.tsx" {2,4-6} ins={8} del={9} error={11} lineNumbers
```
````

| Syntax | Class |
| --- | --- |
| `{2,4-6}` | `th-line--highlighted` |
| `highlight={2}` | `th-line--highlighted` |
| `ins={2}` | `th-line--inserted` |
| `del={2}` | `th-line--deleted` |
| `focus={2}` | `th-line--focused` |
| `error={2}` | `th-line--error` |
| `warning={2}` | `th-line--warning` |

`title`, `filename`, `file`, and `name` are accepted title keys. `lineNumbers` and `showLineNumbers` enable numbers.

## Styling

Annotation classes are intentionally unstyled:

```css
.th-line--highlighted { background: rgb(9 105 218 / 10%); }
.th-line--inserted { background: rgb(26 127 55 / 12%); }
.th-line--deleted { background: rgb(207 34 46 / 12%); }
.th-line--error { text-decoration: underline wavy #cf222e; }
.th-line--focused { opacity: 1; }
.th-code:has(.th-line--focused) .th-line:not(.th-line--focused) { opacity: 0.55; }
```

Use `data` for tooltips, diagnostics, IDs, or application hooks. Values are stringified and escaped.
