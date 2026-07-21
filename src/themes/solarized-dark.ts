import type { HighlightTheme } from '../theme.js'

export const solarizedDarkTheme = {
  background: '#002b36',
  foreground: '#839496',
  name: 'solarized-dark',
  type: 'dark',
  tokens: {
    attr: '#268bd2',
    'code-inline': '#cb4b16',
    command: '#2aa198',
    comment: '#586e75',
    deleted: '#dc322f',
    function: '#268bd2',
    heading: '#268bd2',
    inserted: '#859900',
    keyword: '#859900',
    link: '#268bd2',
    literal: '#d33682',
    meta: '#586e75',
    number: '#d33682',
    operator: '#859900',
    property: '#268bd2',
    selector: '#859900',
    string: '#2aa198',
    tag: '#268bd2',
    token: '#839496',
    type: '#b58900',
    variable: '#cb4b16',
  },
} as const satisfies HighlightTheme

export default solarizedDarkTheme
