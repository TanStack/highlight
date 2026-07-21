export const themeTokenClasses = [
  'token',
  'attr',
  'code-inline',
  'command',
  'comment',
  'deleted',
  'function',
  'heading',
  'inserted',
  'keyword',
  'link',
  'literal',
  'meta',
  'number',
  'operator',
  'property',
  'selector',
  'string',
  'tag',
  'type',
  'variable',
] as const

export type HighlightThemeToken = (typeof themeTokenClasses)[number]

export type HighlightTheme = {
  background: string
  foreground: string
  name: string
  tokens: Record<HighlightThemeToken, string>
  type: 'dark' | 'light'
}

type ThemeCssOptions = {
  darkSelector?: string
  includeBaseStyles?: boolean
  lightSelector?: string
}

type ThemeListOptions = {
  dark?: never
  light?: never
  themes: ReadonlyArray<{
    selector: string
    theme: HighlightTheme
  }>
}

type ThemePairOptions =
  | {
      dark?: HighlightTheme
      light: HighlightTheme
      themes?: never
    }
  | {
      dark: HighlightTheme
      light?: HighlightTheme
      themes?: never
    }

export type CreateThemeCssOptions = ThemeCssOptions &
  (ThemeListOptions | ThemePairOptions)

export function createThemeCss(options: CreateThemeCssOptions) {
  const themeEntries = options.themes || [
    ...(options.light
      ? [
          {
            selector: options.lightSelector || ':root',
            theme: options.light,
          },
        ]
      : []),
    ...(options.dark
      ? [
          {
            selector: options.darkSelector || '.dark',
            theme: options.dark,
          },
        ]
      : []),
  ]

  const themeCss = themeEntries
    .map(({ selector, theme }) => createThemeRule(selector, theme))
    .join('\n\n')

  if (options.includeBaseStyles === false) {
    return themeCss
  }

  return `${themeCss}\n\n${createThemeBaseCss()}`
}

export function createThemeRule(selector: string, theme: HighlightTheme) {
  const variables = [
    `  --th-background: ${theme.background};`,
    `  --th-token: ${theme.tokens.token || theme.foreground};`,
    ...themeTokenClasses
      .filter((className) => className !== 'token')
      .map((className) => `  --th-${className}: ${theme.tokens[className]};`),
  ]

  return `${selector} {
${variables.join('\n')}
}`
}

export function createThemeBaseCss() {
  return `pre.th-code {
  overflow-x: auto;
  padding: 1rem;
  background: var(--th-background);
  color: var(--th-token);
}

.th-token { color: var(--th-token); }
.th-keyword { color: var(--th-keyword); }
.th-string { color: var(--th-string); }
.th-comment { color: var(--th-comment); }
.th-function { color: var(--th-function); }
.th-type { color: var(--th-type); }
.th-property { color: var(--th-property); }
.th-tag { color: var(--th-tag); }
.th-attr { color: var(--th-attr); }
.th-literal { color: var(--th-literal); }
.th-number { color: var(--th-number); }
.th-variable { color: var(--th-variable); }
.th-operator { color: var(--th-operator); }
.th-inserted { color: var(--th-inserted); }
.th-deleted { color: var(--th-deleted); }
.th-meta { color: var(--th-meta); }
.th-heading { color: var(--th-heading); }
.th-link { color: var(--th-link); }
.th-code-inline { color: var(--th-code-inline); }
.th-selector { color: var(--th-selector); }
.th-command { color: var(--th-command); }
.th-line { display: block; min-width: max-content; }
.th-code--line-numbers code { counter-reset: th-line; }
.th-code--line-numbers .th-line::before {
  display: inline-block;
  width: 2.5em;
  padding-right: 1em;
  color: var(--th-comment);
  content: attr(data-line);
  text-align: right;
  user-select: none;
}`
}
