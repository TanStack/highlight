import type { HighlightTheme } from '../theme.js'

export const githubDarkTheme = {
  background: '#0d1117',
  foreground: '#c9d1d9',
  name: 'github-dark',
  type: 'dark',
  tokens: {
    attr: '#79c0ff',
    'code-inline': '#ffa657',
    command: '#d2a8ff',
    comment: '#8b949e',
    deleted: '#ff7b72',
    function: '#d2a8ff',
    heading: '#79c0ff',
    inserted: '#7ee787',
    keyword: '#ff7b72',
    link: '#58a6ff',
    literal: '#79c0ff',
    meta: '#8b949e',
    number: '#79c0ff',
    operator: '#d2a8ff',
    property: '#79c0ff',
    selector: '#7ee787',
    string: '#a5d6ff',
    tag: '#7ee787',
    token: '#c9d1d9',
    type: '#ffa657',
    variable: '#ffa657',
  },
} as const satisfies HighlightTheme

export default githubDarkTheme
