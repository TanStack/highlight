import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const toml = defineLanguage({
  name: 'toml',
  tokenize: patternTokenizer([
    {
      className: (match) =>
        match[0].startsWith('#') ? 'comment' : 'string',
      regex:
        /#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    },
    { className: 'heading', regex: /^\s*\[\[?[^\]]+\]\]?/gm },
    { className: 'property', regex: /^\s*([A-Za-z0-9_.-]+)(?=\s*=)/gm, group: 1 },
    { className: 'literal', regex: /\b(?:false|true)\b/g },
    { className: 'number', regex: /\b\d+(?:\.\d+)?\b/g },
  ]),
})
