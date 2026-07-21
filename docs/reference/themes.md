---
title: Theme Modules
---

# Theme Modules

Bundled themes are isolated objects. Importing one theme does not include another or generate CSS.

| Export | Module | Type |
| --- | --- | --- |
| `auroraXTheme` | `@tanstack/highlight/themes/aurora-x` | Dark |
| `draculaTheme` | `@tanstack/highlight/themes/dracula` | Dark |
| `githubDarkTheme` | `@tanstack/highlight/themes/github-dark` | Dark |
| `githubLightTheme` | `@tanstack/highlight/themes/github-light` | Light |
| `monokaiTheme` | `@tanstack/highlight/themes/monokai` | Dark |
| `nordTheme` | `@tanstack/highlight/themes/nord` | Dark |
| `oneDarkProTheme` | `@tanstack/highlight/themes/one-dark-pro` | Dark |
| `solarizedDarkTheme` | `@tanstack/highlight/themes/solarized-dark` | Dark |
| `solarizedLightTheme` | `@tanstack/highlight/themes/solarized-light` | Light |

Each module provides both its named export and the same object as its default export.

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const css = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
})
```

The objects satisfy [`HighlightTheme`](theme#highlighttheme). See the [theme guide](../guides/themes) for custom selectors, CSS output, and authoring a theme.
