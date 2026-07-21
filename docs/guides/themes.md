---
title: Themes
---

# Themes

Themes are isolated color objects converted into CSS variables. They never change tokenization or duplicate highlighted markup.

## Light and dark

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const css = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: ':root',
  darkSelector: '.dark',
})
```

The default selectors are `:root` for light and `.dark` for dark.

## One theme

```ts
import { draculaTheme } from '@tanstack/highlight/themes/dracula'

const css = createThemeCss({
  dark: draculaTheme,
  darkSelector: ':root',
})
```

At least one of `light` or `dark` is required in pair mode.

## Multiple named themes

```ts
const css = createThemeCss({
  themes: [
    { selector: '[data-code-theme="github"]', theme: githubLightTheme },
    { selector: '[data-code-theme="dracula"]', theme: draculaTheme },
  ],
})
```

`themes` mode is mutually exclusive with `light` and `dark`.

## Variables only

Set `includeBaseStyles: false` when the application already owns the token selectors:

```ts
const variables = createThemeCss({
  light: githubLightTheme,
  includeBaseStyles: false,
})
```

You can also call `createThemeRule(selector, theme)` and `createThemeBaseCss()` separately.

## Shipped theme matrix

| Theme | Export | Type | Import |
| --- | --- | --- | --- |
| Aurora X | `auroraXTheme` | Dark | `themes/aurora-x` |
| Dracula | `draculaTheme` | Dark | `themes/dracula` |
| GitHub Dark | `githubDarkTheme` | Dark | `themes/github-dark` |
| GitHub Light | `githubLightTheme` | Light | `themes/github-light` |
| Monokai | `monokaiTheme` | Dark | `themes/monokai` |
| Nord | `nordTheme` | Dark | `themes/nord` |
| One Dark Pro | `oneDarkProTheme` | Dark | `themes/one-dark-pro` |
| Solarized Dark | `solarizedDarkTheme` | Dark | `themes/solarized-dark` |
| Solarized Light | `solarizedLightTheme` | Light | `themes/solarized-light` |

Prefix each import with `@tanstack/highlight/`.

## Create a theme

```ts
import type { HighlightTheme } from '@tanstack/highlight/theme'

export const docsTheme = {
  name: 'Docs Light',
  type: 'light',
  background: '#ffffff',
  foreground: '#24292f',
  tokens: {
    token: '#24292f',
    attr: '#953800',
    'code-inline': '#0550ae',
    command: '#8250df',
    comment: '#6e7781',
    deleted: '#cf222e',
    function: '#8250df',
    heading: '#0550ae',
    inserted: '#116329',
    keyword: '#cf222e',
    link: '#0969da',
    literal: '#0550ae',
    meta: '#6e7781',
    number: '#0550ae',
    operator: '#cf222e',
    property: '#953800',
    selector: '#116329',
    string: '#0a3069',
    tag: '#116329',
    type: '#953800',
    variable: '#953800',
  },
} satisfies HighlightTheme
```

The complete token record is intentional: missing semantic colors should be a type error rather than an implicit theme mismatch.

Theme objects do not include font weight, italics, contrast validation, or typography. Add those rules in CSS.
