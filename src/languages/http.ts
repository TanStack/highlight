import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const http = defineLanguage({
  name: 'http',
  tokenize: patternTokenizer([
    { className: 'comment', regex: /^\s*#.*$/gm },
    { className: 'keyword', regex: /^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT|TRACE)\b/gm },
    { className: 'meta', regex: /\bHTTP\/\d(?:\.\d)?\b/g },
    { className: 'property', regex: /^[A-Za-z][A-Za-z0-9-]+(?=:)/gm },
    { className: 'string', regex: /(?:https?:\/\/[^\s]+|\/[^\s]*|[A-Za-z-]+\/[A-Za-z0-9.+-]+)/g },
    { className: 'number', regex: /\b\d{3}\b/g },
  ]),
})
