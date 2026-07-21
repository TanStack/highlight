import type { HighlightTheme } from '../theme.js'

export const solarizedLightTheme = {
  background: '#fdf6e3',
  foreground: '#657b83',
  name: 'solarized-light',
  type: 'light',
  tokens: {
    attr: '#268bd2',
    'code-inline': '#cb4b16',
    command: '#2aa198',
    comment: '#93a1a1',
    deleted: '#dc322f',
    function: '#268bd2',
    heading: '#268bd2',
    inserted: '#859900',
    keyword: '#859900',
    link: '#268bd2',
    literal: '#d33682',
    meta: '#93a1a1',
    number: '#d33682',
    operator: '#859900',
    property: '#268bd2',
    selector: '#859900',
    string: '#2aa198',
    tag: '#268bd2',
    token: '#657b83',
    type: '#b58900',
    variable: '#cb4b16',
  },
} as const satisfies HighlightTheme

export default solarizedLightTheme
