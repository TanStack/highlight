import { describe, expect, it } from 'vitest'
import {
  createThemeBaseCss,
  createThemeCss,
  createThemeRule,
  themeTokenClasses,
} from '../src/theme'
import { auroraXTheme } from '../src/themes/aurora-x'
import { draculaTheme } from '../src/themes/dracula'
import { githubDarkTheme } from '../src/themes/github-dark'
import { githubLightTheme } from '../src/themes/github-light'
import { monokaiTheme } from '../src/themes/monokai'
import { nordTheme } from '../src/themes/nord'
import { oneDarkProTheme } from '../src/themes/one-dark-pro'
import { solarizedDarkTheme } from '../src/themes/solarized-dark'
import { solarizedLightTheme } from '../src/themes/solarized-light'

const themes = [
  auroraXTheme,
  draculaTheme,
  githubDarkTheme,
  githubLightTheme,
  monokaiTheme,
  nordTheme,
  oneDarkProTheme,
  solarizedDarkTheme,
  solarizedLightTheme,
]

describe('themes', () => {
  it('ships complete isolated theme objects', () => {
    for (const theme of themes) {
      expect(theme.name).toBeTruthy()
      expect(theme.background).toMatch(/^#/)
      expect(theme.foreground).toMatch(/^#/)
      expect(theme.tokens.token).toMatch(/^#/)
      expect(theme.tokens.keyword).toMatch(/^#/)
      expect(theme.tokens.string).toMatch(/^#/)
      expect(theme.tokens.comment).toMatch(/^#/)
    }
  })

  it('composes only the themes the caller passes', () => {
    const css = createThemeCss({
      dark: draculaTheme,
      darkSelector: '.theme-dracula',
      light: githubLightTheme,
      lightSelector: ':root',
    })

    expect(css).toContain(':root')
    expect(css).toContain('.theme-dracula')
    expect(css).toContain('--th-background: #ffffff')
    expect(css).toContain('--th-background: #282a36')
    expect(css).toContain('pre.th-code')
    expect(css).not.toContain('#2e3440')

    for (const className of themeTokenClasses) {
      expect(css).toContain(`--th-${className}`)
      expect(createThemeBaseCss()).toContain(`.th-${className}`)
    }
  })

  it('can emit one scoped theme without base styles', () => {
    const css = createThemeCss({
      includeBaseStyles: false,
      themes: [{ selector: '[data-code-theme="monokai"]', theme: monokaiTheme }],
    })

    expect(css).toContain('[data-code-theme="monokai"]')
    expect(css).toContain('--th-keyword: #f92672')
    expect(css).not.toContain('pre.th-code')
  })

  it('can emit a raw theme rule', () => {
    const css = createThemeRule('.theme-nord', nordTheme)

    expect(css).toContain('.theme-nord')
    expect(css).toContain('--th-background: #2e3440')
  })
})
