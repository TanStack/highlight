# Themes and Semantic Tokens

## Shipped Themes

| Theme | Export | Type | Direct import |
| --- | --- | --- | --- |
| Aurora X | `auroraXTheme` | dark | `@tanstack/highlight/themes/aurora-x` |
| Dracula | `draculaTheme` | dark | `@tanstack/highlight/themes/dracula` |
| GitHub Dark | `githubDarkTheme` | dark | `@tanstack/highlight/themes/github-dark` |
| GitHub Light | `githubLightTheme` | light | `@tanstack/highlight/themes/github-light` |
| Monokai | `monokaiTheme` | dark | `@tanstack/highlight/themes/monokai` |
| Nord | `nordTheme` | dark | `@tanstack/highlight/themes/nord` |
| One Dark Pro | `oneDarkProTheme` | dark | `@tanstack/highlight/themes/one-dark-pro` |
| Solarized Dark | `solarizedDarkTheme` | dark | `@tanstack/highlight/themes/solarized-dark` |
| Solarized Light | `solarizedLightTheme` | light | `@tanstack/highlight/themes/solarized-light` |

## Complete Custom Theme

```ts
import type { HighlightTheme } from '@tanstack/highlight/theme'

export const docsTheme = {
  name: 'docs-light',
  type: 'light',
  background: '#ffffff',
  foreground: '#24292f',
  tokens: {
    token: '#24292f',
    attr: '#0550ae',
    'code-inline': '#953800',
    command: '#8250df',
    comment: '#6e7781',
    deleted: '#cf222e',
    function: '#8250df',
    heading: '#0550ae',
    inserted: '#1a7f37',
    keyword: '#cf222e',
    link: '#0969da',
    literal: '#0550ae',
    meta: '#57606a',
    number: '#0550ae',
    operator: '#8250df',
    property: '#0550ae',
    selector: '#116329',
    string: '#0a7f64',
    tag: '#116329',
    type: '#953800',
    variable: '#953800',
  },
} satisfies HighlightTheme
```

## Theme API

- `createThemeCss(options)` emits theme variables and, by default, base styles.
- `createThemeRule(selector, theme)` emits one selector's variables.
- `createThemeBaseCss()` emits code, token, line, and line-number selectors.
- `includeBaseStyles: false` limits `createThemeCss()` to variable rules.
- Pair mode accepts `light`, `dark`, `lightSelector`, and `darkSelector`.
- List mode accepts `themes: Array<{ selector, theme }>` and cannot be combined with pair mode.

## Semantic Classes

Every classified span includes `th-token` and one semantic class:

| Class | Typical use |
| --- | --- |
| `th-attr` | Markup attributes |
| `th-code-inline` | Inline Markdown or unparsed fenced code |
| `th-command` | Shell and Docker commands |
| `th-comment` | Comments |
| `th-deleted` | Deleted diff lines |
| `th-function` | Function declarations and calls |
| `th-heading` | Markdown headings and TOML tables |
| `th-inserted` | Inserted diff lines |
| `th-keyword` | Keywords and directives |
| `th-link` | Markdown links |
| `th-literal` | Booleans, nulls, and regex literals |
| `th-meta` | Diff, fence, and protocol metadata |
| `th-number` | Numeric values |
| `th-operator` | Template boundaries and arrows |
| `th-property` | Object properties, headers, and config keys |
| `th-selector` | CSS selectors |
| `th-string` | Strings and protected scalar bodies |
| `th-tag` | Markup tags |
| `th-type` | Type names and annotations |
| `th-variable` | Shell, CSS, and config variables |
