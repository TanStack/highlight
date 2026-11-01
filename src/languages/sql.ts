import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const sql = defineLanguage({
  name: 'sql',
  tokenize: patternTokenizer([
    [/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"/g, (match) => match[0].startsWith('--') || match[0].startsWith('/*')
        ? 'comment'
        : 'string'],
    [/\b(?:add|all|alter|and|as|asc|begin|between|by|case|check|column|commit|constraint|create|cross|database|default|delete|desc|distinct|drop|else|end|exists|foreign|from|full|group|having|index|inner|insert|into|join|key|left|like|limit|not|null|on|or|order|outer|primary|references|returning|right|rollback|select|set|table|then|union|unique|update|using|values|view|when|where|with)\b/gi, 'keyword'],
    [/\b(?:false|null|true)\b/gi, 'literal'],
    [/\b\d+(?:\.\d+)?\b/g, 'number'],
    [/\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, 'function'],
  ]),
})
