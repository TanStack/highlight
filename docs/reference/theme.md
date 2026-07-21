---
title: Theme API
---

# Theme API

`@tanstack/highlight/theme` converts portable theme objects into CSS custom properties and base styles. It contains no bundled theme.

## `themeTokenClasses`

A readonly list containing `token` and every semantic [`HighlightTokenClass`](core#highlighttokenclass). Use it to validate or generate a complete theme.

## `HighlightThemeToken`

The union derived from `themeTokenClasses`.

## `HighlightTheme`

```ts
type HighlightTheme = {
  background: string
  foreground: string
  name: string
  tokens: Record<HighlightThemeToken, string>
  type: 'dark' | 'light'
}
```

Every token color is required. `foreground` describes the theme and `tokens.token` is the emitted default token color.

## `CreateThemeCssOptions`

Use either a light/dark pair or an explicit selector list:

```ts
type CreateThemeCssOptions = {
  includeBaseStyles?: boolean
  lightSelector?: string
  darkSelector?: string
} & (
  | { light: HighlightTheme; dark?: HighlightTheme }
  | { dark: HighlightTheme; light?: HighlightTheme }
  | {
      themes: ReadonlyArray<{
        selector: string
        theme: HighlightTheme
      }>
    }
)
```

Pair mode defaults to `:root` for light and `.dark` for dark. `includeBaseStyles` defaults to `true`.

## `createThemeCss`

```ts
function createThemeCss(options: CreateThemeCssOptions): string
```

Returns theme-variable rules followed by base code-block CSS unless `includeBaseStyles` is `false`.

## `createThemeRule`

```ts
function createThemeRule(selector: string, theme: HighlightTheme): string
```

Returns one selector block defining `--th-background`, `--th-token`, and every semantic `--th-*` color.

## `createThemeBaseCss`

```ts
function createThemeBaseCss(): string
```

Returns the structural styles and variable lookups for code blocks, tokens, line wrappers, and line numbers. It does not set fonts, borders, radii, or application layout.

See [Themes](../guides/themes) for isolated imports and custom themes.
