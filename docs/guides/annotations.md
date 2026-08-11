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

## Try annotations

The rendered block combines line numbers, a focused line, and an exact character-range diagnostic.

```ts group=highlight-annotations file=/src/main.ts entry env=client
import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const source = [
  'type User = { name: string }',
  'const user = missingUser',
  'console.log(user.name)',
].join('\n')
const identifier = 'missingUser'
const start = source.indexOf(identifier)

const highlighter = createHighlighter({ languages: [ts] })
const result = highlighter.highlight(source, {
  lang: 'ts',
  lineNumbers: true,
  decorations: [
    { lines: 3, className: 'is-focused' },
    {
      range: [start, start + identifier.length],
      className: 'is-error',
      data: { message: 'Unknown identifier' },
    },
  ],
})

const themeCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '.dark',
})

export default function render(output: HTMLElement) {
  const style = document.createElement('style')
  style.textContent = `${themeCss}
body { margin: 0; padding: 24px; font-family: ui-sans-serif, system-ui; }
pre.th-code { margin: 0; border: 1px solid color-mix(in srgb, currentColor 16%, transparent); border-radius: 12px; }
code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 14px; line-height: 1.65; }
.is-focused { background: color-mix(in srgb, #8250df 14%, transparent); }
.is-error { text-decoration: underline wavy var(--notebook-error); text-underline-offset: 3px; }
.hint { margin: 12px 4px 0; color: color-mix(in srgb, currentColor 70%, transparent); font-size: 13px; }`

  document.head.append(style)
  output.innerHTML = `${result.html}<p class="hint">Hover the underlined identifier to read its diagnostic.</p>`

  const diagnostic = output.querySelector<HTMLElement>('.is-error')
  if (diagnostic) diagnostic.title = diagnostic.dataset.message ?? ''
}
```

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

## Inline diff notation

Markdown adapters also recognize the diff notation used by Shiki:

```ts
- const oldValue = true // [!code --]
+ const newValue = true // [!code ++]
```

The directives are removed before tokenization and copying. Their lines receive `th-line--deleted` and `th-line--inserted`, respectively. JavaScript-style line and block comments, `#` line comments, and HTML comments are supported.

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
