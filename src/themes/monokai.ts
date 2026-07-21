import type { HighlightTheme } from '../theme.js'

export const monokaiTheme = {
  background: '#272822',
  foreground: '#f8f8f2',
  name: 'monokai',
  type: 'dark',
  tokens: {
    attr: '#a6e22e',
    'code-inline': '#fd971f',
    command: '#66d9ef',
    comment: '#75715e',
    deleted: '#f92672',
    function: '#a6e22e',
    heading: '#66d9ef',
    inserted: '#a6e22e',
    keyword: '#f92672',
    link: '#66d9ef',
    literal: '#ae81ff',
    meta: '#75715e',
    number: '#ae81ff',
    operator: '#f92672',
    property: '#a6e22e',
    selector: '#a6e22e',
    string: '#e6db74',
    tag: '#f92672',
    token: '#f8f8f2',
    type: '#66d9ef',
    variable: '#fd971f',
  },
} as const satisfies HighlightTheme

export default monokaiTheme
