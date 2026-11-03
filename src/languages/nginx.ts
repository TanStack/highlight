import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const nginx = defineLanguage({
  name: 'nginx',
  tokenize: patternTokenizer([
    [/#.*$/gm, 'comment'],
    [/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, 'string'],
    [/\b(?:add_header|client_max_body_size|events|http|include|listen|location|map|proxy_pass|proxy_set_header|return|server|server_name|ssl_certificate|ssl_certificate_key|upstream)\b/g, 'keyword'],
    [/\$[A-Za-z_][A-Za-z0-9_]*/g, 'variable'],
    [/\b\d+\b/g, 'number'],
    [/(?:\/[^\s;{}]*|https?:\/\/[^\s;{}]+)/g, 'string'],
  ]),
})
