import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const go = defineLanguage({
  name: 'go',
  aliases: ['golang'],
  tokenize: patternTokenizer([
    [/\/\/[^\n]*|\/\*[\s\S]*?\*\/|`[\s\S]*?`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, (match) => match[0].startsWith('/') ? 'comment' : 'string'],
    [/\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g, 'keyword'],
    [/\b(?:false|iota|nil|true)\b/g, 'literal'],
    [/\btype\s+([A-Za-z_]\w*)/g, 'type', 1],
    [/\b(?:any|bool|byte|comparable|complex64|complex128|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr)\b/g, 'type'],
    [/\b[A-Za-z_]\w*(?=\s*\()/g, 'function'],
    [/(?:^|[^\w.])((?:0[bB]_?[01](?:_?[01])*|0[oO]_?[0-7](?:_?[0-7])*|0[xX](?:(?:_?[\da-fA-F](?:_?[\da-fA-F])*(?:\.(?:[\da-fA-F](?:_?[\da-fA-F])*)?)?|\.[\da-fA-F](?:_?[\da-fA-F])*)[pP][+-]?\d(?:_?\d)*|_?[\da-fA-F](?:_?[\da-fA-F])*)|\d(?:_?\d)*\.(?:\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|\d(?:_?\d)*[eE][+-]?\d(?:_?\d)*|\.\d(?:_?\d)*(?:[eE][+-]?\d(?:_?\d)*)?|\d(?:_?\d)*)(?:i)?)(?![\w.])/g, 'number', 1],
    [/\.\s*([A-Za-z_]\w*)/g, 'property', 1],
    [/\.\.\.|<<=?|>>=?|&\^=?|:=|<-|\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/%&|^!<>=~]=?/g, 'operator'],
  ]),
})
