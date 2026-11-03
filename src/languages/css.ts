import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const css = defineLanguage({
  name: 'css',
  tokenize: patternTokenizer([
    [/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, (match) => match[0].startsWith('/*') ? 'comment' : 'string'],
    [/--[A-Za-z0-9_-]+/g, 'variable'],
    [/(^|[}\n])\s*([^@{}\n][^{}\n]*)(?=\s*\{)/g, 'selector', 2],
    [/(?:^|[;{]\s*)([A-Za-z-]+)(?=\s*:)/gm, 'property', 1],
    [/\b[A-Za-z-]+(?=\()/g, 'function'],
    [/\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|deg)?\b/g, 'number'],
  ]),
})
