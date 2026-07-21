import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const scheme = defineLanguage({
  name: 'scheme',
  aliases: ['scm', 'racket'],
  tokenize: patternTokenizer([
    { className: 'comment', regex: /;[^\n]*|#\|[\s\S]*?\|#/g },
    { className: 'string', regex: /"(?:\\.|[^"\\])*"/g },
    {
      className: 'keyword',
      regex:
        /\b(?:and|begin|case|cond|define|delay|do|else|if|lambda|let|let\*|letrec|or|quasiquote|quote|set!|unquote)\b/g,
    },
    { className: 'literal', regex: /#(?:t|f|true|false)\b/g },
    { className: 'number', regex: /(?:^|[\s(])(-?\d+(?:\.\d+)?)(?=[\s)])/g, group: 1 },
    { className: 'function', regex: /\(define\s+\(([A-Za-z_+\-*/<>=!?][\w+\-*/<>=!?]*)/g, group: 1 },
  ]),
})
