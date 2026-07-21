import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const css = defineLanguage({
  name: 'css',
  tokenize: patternTokenizer([
    {
      className: (match) =>
        match[0].startsWith('/*') ? 'comment' : 'string',
      regex: /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g,
    },
    { className: 'variable', regex: /--[A-Za-z0-9_-]+/g },
    {
      className: 'selector',
      regex: /(^|[}\n])\s*([^@{}\n][^{}\n]*)(?=\s*\{)/g,
      group: 2,
    },
    { className: 'property', regex: /(?:^|[;{]\s*)([A-Za-z-]+)(?=\s*:)/gm, group: 1 },
    { className: 'function', regex: /\b[A-Za-z-]+(?=\()/g },
    { className: 'number', regex: /\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|deg)?\b/g },
  ]),
})
