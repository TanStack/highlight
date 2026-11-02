import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const http = defineLanguage({
  name: 'http',
  tokenize: patternTokenizer([
    [/^\s*#.*$/gm, 'comment'],
    [/^(?:CONNECT|DELETE|GET|HEAD|OPTIONS|PATCH|POST|PUT|TRACE)\b/gm, 'keyword'],
    [/\bHTTP\/\d(?:\.\d)?\b/g, 'meta'],
    [/^[A-Za-z][A-Za-z0-9-]+(?=:)/gm, 'property'],
    [/(?:https?:\/\/[^\s]+|\/[^\s]*|[A-Za-z-]+\/[A-Za-z0-9.+-]+)/g, 'string'],
    [/\b\d{3}\b/g, 'number'],
  ]),
})
