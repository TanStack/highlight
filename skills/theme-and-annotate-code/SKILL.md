---
name: 'theme-and-annotate-code'
description: >
  Style @tanstack/highlight with createThemeCss, createThemeRule,
  createThemeBaseCss, isolated theme imports, lineNumbers, line decorations,
  UTF-16 range decorations, and fence annotations. Load for light/dark themes,
  custom semantic colors, focused lines, diffs, diagnostics, or data hooks.
metadata:
  type: core
  library: '@tanstack/highlight'
  library_version: '0.0.5'
sources:
  - 'TanStack/highlight:docs/guides/themes.md'
  - 'TanStack/highlight:docs/guides/annotations.md'
  - 'TanStack/highlight:docs/guides/output-and-css.md'
  - 'TanStack/highlight:src/theme.ts'
  - 'TanStack/highlight:src/core.ts'
---

# Theme and Annotate Code

## Setup

Generate light and dark CSS independently from highlighted markup:

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const syntaxThemeCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: ':root',
  darkSelector: '.dark',
})
```

The default selectors are `:root` and `.dark`; base code and token styles are included unless `includeBaseStyles` is false.

## Core Patterns

### Select among named themes

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { draculaTheme } from '@tanstack/highlight/themes/dracula'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const syntaxThemeCss = createThemeCss({
  themes: [
    {
      selector: '[data-code-theme="github"]',
      theme: githubLightTheme,
    },
    {
      selector: '[data-code-theme="dracula"]',
      theme: draculaTheme,
    },
  ],
})
```

`themes` mode is mutually exclusive with the `light` and `dark` pair mode.

### Add line numbers and line decorations

```ts
import { highlighter } from './highlight'

export const result = highlighter.highlight(
  'const first = 1\nconst second = 2\nconst third = 3',
  {
    lang: 'ts',
    lineNumbers: true,
    decorations: [
      { lines: 2, className: 'is-focused' },
      { lines: [2, 3], className: 'is-highlighted' },
    ],
  },
)
```

Line coordinates are one-based and inclusive; decorations activate `th-line` wrappers even without line numbers.

### Attach exact source diagnostics

```ts
import { highlighter } from './highlight'

const code = 'const answer = unknownValue'
const start = code.indexOf('unknownValue')

export const result = highlighter.highlight(code, {
  lang: 'ts',
  decorations: [
    {
      range: [start, start + 'unknownValue'.length],
      className: 'is-error',
      data: {
        message: 'Unknown identifier',
        severity: 2,
      },
    },
  ],
})
```

Character ranges use zero-based, end-exclusive UTF-16 offsets.

### Own font styles and annotation presentation in CSS

```css
.th-keyword {
  font-weight: 600;
}

.th-comment {
  font-style: italic;
}

.th-line--highlighted {
  background: rgb(9 105 218 / 10%);
}

.is-error {
  text-decoration: underline wavy #cf222e;
}
```

Theme objects contain colors only; typography, contrast policy, and annotation appearance belong to application CSS.

## Common Mistakes

### HIGH Duplicating markup for light and dark

Wrong:

```ts
import { highlighter } from './highlight'

export const lightHtml = highlighter.highlightToHtml('const value = 1', {
  lang: 'ts',
})
export const darkHtml = highlighter.highlightToHtml('const value = 1', {
  lang: 'ts',
})
```

Correct:

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'
import { highlighter } from './highlight'

export const html = highlighter.highlightToHtml('const value = 1', {
  lang: 'ts',
})
export const css = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
})
```

Token classes are theme-independent, so CSS can switch one highlighted tree.

Source: `docs/guides/themes.md`

### MEDIUM Retaining every candidate theme

Wrong:

```ts
import { auroraXTheme } from '@tanstack/highlight/themes/aurora-x'
import { draculaTheme } from '@tanstack/highlight/themes/dracula'
import { monokaiTheme } from '@tanstack/highlight/themes/monokai'

export const selectedTheme = {
  aurora: auroraXTheme,
  dracula: draculaTheme,
  monokai: monokaiTheme,
}.dracula
```

Correct:

```ts
import { draculaTheme } from '@tanstack/highlight/themes/dracula'

export const selectedTheme = draculaTheme
```

Direct subpaths isolate themes only when unused theme modules are not imported.

Source: `docs/guides/themes.md`

### HIGH Hiding an incomplete custom theme

Wrong:

```ts
import type { HighlightTheme } from '@tanstack/highlight/theme'

export const theme = {
  name: 'docs',
  type: 'light',
  background: '#ffffff',
  foreground: '#24292f',
  tokens: {
    keyword: '#cf222e',
  },
} as HighlightTheme
```

Correct:

```ts
import type { HighlightTheme } from '@tanstack/highlight/theme'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const theme = {
  ...githubLightTheme,
  name: 'docs',
  tokens: {
    ...githubLightTheme.tokens,
    keyword: '#cf222e',
  },
} satisfies HighlightTheme
```

Bypassing the complete token record emits missing CSS variables for semantic classes.

Source: `docs/guides/themes.md`

### HIGH Using character coordinates for lines

Wrong:

```ts
import { highlighter } from './highlight'

export const result = highlighter.highlight('first\nsecond\nthird', {
  decorations: [{ lines: [0, 2], className: 'is-focused' }],
})
```

Correct:

```ts
import { highlighter } from './highlight'

export const result = highlighter.highlight('first\nsecond\nthird', {
  decorations: [{ lines: [1, 3], className: 'is-focused' }],
})
```

Line ranges are one-based and inclusive, unlike zero-based character ranges.

Source: `docs/guides/annotations.md`

### MEDIUM Assuming annotations include appearance

Wrong:

```ts
import { highlighter } from './highlight'

export const result = highlighter.highlight('const value = 1', {
  lang: 'ts',
  decorations: [{ lines: 1, className: 'th-line--highlighted' }],
})
```

Correct:

```css
.th-line--highlighted {
  background: rgb(9 105 218 / 10%);
}
```

The renderer emits classes and escaped data attributes but does not style annotation classes.

Source: `docs/guides/annotations.md`

## References

- [Theme matrix, semantic tokens, and complete custom themes](references/themes-and-tokens.md)

See also: `integrate-markdown-pipelines/SKILL.md` - fence metadata is the standard source for documentation line annotations.
