import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const lua = defineLanguage({
  name: 'lua',
  tokenize: patternTokenizer([
    {
      className: (match) => match[0][0] === '-' ? 'comment' : match[0][0] === '#' ? 'meta' : 'string',
      regex: /^#![^\n]*|--(?:\[(=*)\[[\s\S]*?(?:\]\1\]|$)|[^\n]*)|\[(=*)\[[\s\S]*?(?:\]\2\]|$)|(["'`])(?:\\z\s*|\\\r?\n|\\[\s\S]|(?!\3)[^\\\n])*\3?/g,
    },
    {
      className: 'keyword',
      regex: /\b(?:and|break|do|else|elseif|end|for|function|goto|if|in|local|not|or|repeat|return|then|until|while)\b|\b(?<=<\s*)(?:const|close)(?=\s*>)/g,
    },
    { className: 'literal', regex: /\b(?:nil|true|false)\b/g },
    { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\(|[ \t]*["'{]|[ \t]*\[=*\[|\s*=\s*function\b)/g },
    {
      className: 'number',
      regex: /(?:(?<![\w.])|(?<=\.\.))(?:0[xX](?:[\da-fA-F]+(?:\.[\da-fA-F]*)?|\.[\da-fA-F]+)(?:[pP][+-]?\d+)?|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?:[uU]?[lL]{2}|i)?(?!\w|\.(?!\.))/g,
    },
    { className: 'property', regex: /(?<!\.)\.\s*([A-Za-z_]\w*)/g, group: 1 },
    { className: 'operator', regex: /\.\.\.?|[=~<>]=|\/\/|<<|>>|::|[-+*/%^#&|~<>=]/g },
  ]),
})
