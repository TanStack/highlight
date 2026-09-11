import type { HighlightTheme } from '../theme.js'

export const gruvboxDarkTheme = {
  background: '#282828',
  foreground: '#ebdbb2',
  name: 'gruvbox-dark',
  type: 'dark',
  tokens: {
    attr: '#8ec07c',
    'code-inline': '#8ec07c',
    command: '#b8bb26',
    comment: '#928374',
    deleted: '#fb4934',
    function: '#b8bb26',
    heading: '#b8bb26',
    inserted: '#b8bb26',
    keyword: '#fb4934',
    link: '#d3869b',
    literal: '#d3869b',
    meta: '#928374',
    number: '#d3869b',
    operator: '#ebdbb2',
    property: '#8ec07c',
    selector: '#fe8019',
    string: '#b8bb26',
    tag: '#8ec07c',
    token: '#ebdbb2',
    type: '#fabd2f',
    variable: '#83a598',
  },
} as const satisfies HighlightTheme

export default gruvboxDarkTheme
