import type { HighlightTheme } from '../theme.js'

export const oneDarkProTheme = {
  background: '#282c34',
  foreground: '#abb2bf',
  name: 'one-dark-pro',
  type: 'dark',
  tokens: {
    attr: '#d19a66',
    'code-inline': '#e5c07b',
    command: '#61afef',
    comment: '#5c6370',
    deleted: '#e06c75',
    function: '#61afef',
    heading: '#61afef',
    inserted: '#98c379',
    keyword: '#c678dd',
    link: '#56b6c2',
    literal: '#d19a66',
    meta: '#5c6370',
    number: '#d19a66',
    operator: '#56b6c2',
    property: '#e06c75',
    selector: '#98c379',
    string: '#98c379',
    tag: '#e06c75',
    token: '#abb2bf',
    type: '#e5c07b',
    variable: '#e5c07b',
  },
} as const satisfies HighlightTheme

export default oneDarkProTheme
