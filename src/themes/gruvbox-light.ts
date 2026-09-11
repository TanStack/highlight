import type { HighlightTheme } from '../theme.js'

export const gruvboxLightTheme = {
  background: '#fbf1c7',
  foreground: '#3c3836',
  name: 'gruvbox-light',
  type: 'light',
  tokens: {
    attr: '#427b58',
    'code-inline': '#427b58',
    command: '#79740e',
    comment: '#928374',
    deleted: '#9d0006',
    function: '#79740e',
    heading: '#79740e',
    inserted: '#79740e',
    keyword: '#9d0006',
    link: '#8f3f71',
    literal: '#8f3f71',
    meta: '#928374',
    number: '#8f3f71',
    operator: '#3c3836',
    property: '#427b58',
    selector: '#af3a03',
    string: '#79740e',
    tag: '#427b58',
    token: '#3c3836',
    type: '#b57614',
    variable: '#076678',
  },
} as const satisfies HighlightTheme

export default gruvboxLightTheme
