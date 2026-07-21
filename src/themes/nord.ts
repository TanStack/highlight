import type { HighlightTheme } from '../theme.js'

export const nordTheme = {
  background: '#2e3440',
  foreground: '#d8dee9',
  name: 'nord',
  type: 'dark',
  tokens: {
    attr: '#8fbcbb',
    'code-inline': '#d08770',
    command: '#88c0d0',
    comment: '#616e88',
    deleted: '#bf616a',
    function: '#88c0d0',
    heading: '#81a1c1',
    inserted: '#a3be8c',
    keyword: '#81a1c1',
    link: '#88c0d0',
    literal: '#b48ead',
    meta: '#616e88',
    number: '#b48ead',
    operator: '#81a1c1',
    property: '#8fbcbb',
    selector: '#a3be8c',
    string: '#a3be8c',
    tag: '#81a1c1',
    token: '#d8dee9',
    type: '#8fbcbb',
    variable: '#d08770',
  },
} as const satisfies HighlightTheme

export default nordTheme
