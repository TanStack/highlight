import type { HighlightTheme } from '../theme.js'

export const auroraXTheme = {
  background: '#030712',
  foreground: '#d1d5db',
  name: 'aurora-x',
  type: 'dark',
  tokens: {
    attr: '#79c0ff',
    'code-inline': '#ffa657',
    command: '#d2a8ff',
    comment: '#9099c0',
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
    token: '#d1d5db',
    type: '#ffa657',
    variable: '#ffa657',
  },
} as const satisfies HighlightTheme

export default auroraXTheme
