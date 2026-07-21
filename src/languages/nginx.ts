import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const nginx = defineLanguage({
  name: 'nginx',
  tokenize: patternTokenizer([
    { className: 'comment', regex: /#.*$/gm },
    { className: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g },
    {
      className: 'keyword',
      regex:
        /\b(?:add_header|client_max_body_size|events|http|include|listen|location|map|proxy_pass|proxy_set_header|return|server|server_name|ssl_certificate|ssl_certificate_key|upstream)\b/g,
    },
    { className: 'variable', regex: /\$[A-Za-z_][A-Za-z0-9_]*/g },
    { className: 'number', regex: /\b\d+\b/g },
    { className: 'string', regex: /(?:\/[^\s;{}]*|https?:\/\/[^\s;{}]+)/g },
  ]),
})
