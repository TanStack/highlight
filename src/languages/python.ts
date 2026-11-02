import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const python = defineLanguage({
  name: 'python',
  aliases: ['py'],
  tokenize: patternTokenizer([
    [/#[^\n]*|(?:br|rb|fr|rf|[rubf])?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/gi, (match) => match[0].startsWith('#') ? 'comment' : 'string'],
    [/\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, 'keyword'],
    [/\b(?:False|None|True|NotImplemented|Ellipsis)\b/g, 'literal'],
    [/@[A-Za-z_][\w.]*/g, 'function'],
    [/\bdef\s+([A-Za-z_]\w*)/g, 'function', 1],
    [/\b(?:bool|bytes|dict|float|frozenset|int|list|object|set|str|tuple|type)\b/g, 'type'],
    [/\b(?:0x[\da-f_]+|0b[01_]+|0o[0-7_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:e[+-]?\d[\d_]*)?j?)\b/gi, 'number'],
  ]),
})
