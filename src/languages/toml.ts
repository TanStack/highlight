import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const toml = defineLanguage({
  name: 'toml',
  tokenize: patternTokenizer([
    [/#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, (match) => match[0].startsWith('#') ? 'comment' : 'string'],
    [/^\s*\[\[?[^\]]+\]\]?/gm, 'heading'],
    [/^\s*([A-Za-z0-9_.-]+)(?=\s*=)/gm, 'property', 1],
    [/\b(?:false|true)\b/g, 'literal'],
    [/\b\d+(?:\.\d+)?\b/g, 'number'],
  ]),
})
