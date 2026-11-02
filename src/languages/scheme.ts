import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const scheme = defineLanguage({
  name: 'scheme',
  aliases: ['scm', 'racket'],
  tokenize: patternTokenizer([
    [/;[^\n]*|#\|[\s\S]*?\|#/g, 'comment'],
    [/"(?:\\.|[^"\\])*"/g, 'string'],
    [/\b(?:and|begin|case|cond|define|delay|do|else|if|lambda|let|let\*|letrec|or|quasiquote|quote|set!|unquote)\b/g, 'keyword'],
    [/#(?:t|f|true|false)\b/g, 'literal'],
    [/(?:^|[\s(])(-?\d+(?:\.\d+)?)(?=[\s)])/g, 'number', 1],
    [/\(define\s+\(([A-Za-z_+\-*/<>=!?][\w+\-*/<>=!?]*)/g, 'function', 1],
  ]),
})
