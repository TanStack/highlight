import type { HighlightTheme } from '../theme.js'

export const githubLightTheme = {
  background: '#ffffff',
  foreground: '#24292f',
  name: 'github-light',
  type: 'light',
  tokens: {
    attr: '#0550ae',
    'code-inline': '#953800',
    command: '#8250df',
    comment: '#6e7781',
    deleted: '#cf222e',
    function: '#8250df',
    heading: '#0550ae',
    inserted: '#1a7f37',
    keyword: '#cf222e',
    link: '#0969da',
    literal: '#0550ae',
    meta: '#57606a',
    number: '#0550ae',
    operator: '#8250df',
    property: '#0550ae',
    selector: '#116329',
    string: '#0a7f64',
    tag: '#116329',
    token: '#24292f',
    type: '#953800',
    variable: '#953800',
  },
} as const satisfies HighlightTheme

export default githubLightTheme
