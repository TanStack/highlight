import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const lua = defineLanguage({
  name: 'lua',
  tokenize: patternTokenizer([
    [/^#![^\n]*|--(?:\[(=*)\[[\s\S]*?(?:\]\1\]|$)|[^\n]*)|\[(=*)\[[\s\S]*?(?:\]\2\]|$)|(["'`])(?:\\z\s*|\\\r?\n|\\[\s\S]|(?!\3)[^\\\n])*\3?/g, (match) => match[0][0] === '-' ? 'comment' : match[0][0] === '#' ? 'meta' : 'string'],
    [/\b(?:and|break|do|else|elseif|end|for|function|goto|if|in|local|not|or|repeat|return|then|until|while)\b|\b(?<=<\s*)(?:const|close)(?=\s*>)/g, 'keyword'],
    [/\b(?:nil|true|false)\b/g, 'literal'],
    [/\b[A-Za-z_]\w*(?=\s*\(|[ \t]*["'{]|[ \t]*\[=*\[|\s*=\s*function\b)/g, 'function'],
    [/(?:(?<![\w.])|(?<=\.\.))(?:0[xX](?:[\da-fA-F]+(?:\.[\da-fA-F]*)?|\.[\da-fA-F]+)(?:[pP][+-]?\d+)?|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?:[uU]?[lL]{2}|i)?(?!\w|\.(?!\.))/g, 'number'],
    [/(?<!\.)\.\s*([A-Za-z_]\w*)/g, 'property', 1],
    [/\.\.\.?|[=~<>]=|\/\/|<<|>>|::|[-+*/%^#&|~<>=]/g, 'operator'],
  ]),
})
