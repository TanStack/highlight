import type { HighlightTheme } from '../theme.js'

export const draculaTheme = {
  background: '#282a36',
  foreground: '#f8f8f2',
  name: 'dracula',
  type: 'dark',
  tokens: {
    attr: '#50fa7b',
    'code-inline': '#ffb86c',
    command: '#8be9fd',
    comment: '#6272a4',
    deleted: '#ff5555',
    function: '#50fa7b',
    heading: '#bd93f9',
    inserted: '#50fa7b',
    keyword: '#ff79c6',
    link: '#8be9fd',
    literal: '#bd93f9',
    meta: '#6272a4',
    number: '#bd93f9',
    operator: '#ff79c6',
    property: '#8be9fd',
    selector: '#50fa7b',
    string: '#f1fa8c',
    tag: '#ff79c6',
    token: '#f8f8f2',
    type: '#8be9fd',
    variable: '#ffb86c',
  },
} as const satisfies HighlightTheme

export default draculaTheme
