import { compiledWordLanguage } from '../internal/word-language.js'

// C++-only words stay plain because they are valid C identifiers.
export const c = /* @__PURE__ */ compiledWordLanguage({
  name: 'c',
  aliases: ['h'],
  wordCharacters: "\\w",
  comments: /\/\/(?:\\\r?\n|[^\n])*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/,
  strings: /(?:u8|u|U|L)?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"?|(?<![\w'])(?:u8|u|U|L)?'(?:\\.|[^'\\\r\n])*'/,
  keywords: "asm fortran alignas alignof auto break case const constexpr continue default do else enum extern for goto if inline noreturn register restrict return sizeof static static_assert struct switch thread_local typedef typeof typeof_unqual union volatile while _Alignas _Alignof _Atomic _Generic _Noreturn _Static_assert _Thread_local _Pragma",
  literals: "true false nullptr NULL",
  types: "bool char double float int long short signed unsigned void _BitInt _Bool _Complex _Decimal32 _Decimal64 _Decimal96 _Decimal128 _Decimal64x _Decimal128x _Float16 _Float32 _Float64 _Float128 _Float32x _Float64x _Float128x _Imaginary complex imaginary",
  beforeWords: [
    [/^[ \t]*#[ \t]*(?:include|embed)[ \t]*(<[^>\r\n]+>)/gm, 'string', 1],
    [/^[ \t]*(#[ \t]*[A-Za-z_]\w*)/gm, 'meta', 1],
  ],
  numbers: false,
  rules: [
    [/\b(?:struct|enum|union)\s+([A-Za-z_]\w*)/g, 'type', 1],
    [/(?:^|[^\w.])((?:0[xX](?:[\da-fA-F](?:'?[\da-fA-F])*(?:\.(?:[\da-fA-F]'?)*)?|\.[\da-fA-F](?:'?[\da-fA-F])*)(?:[pP][+-]?\d(?:'?\d)*)?|0[bB][01](?:'?[01])*|(?:\d(?:'?\d)*(?:\.(?:\d(?:'?\d)*)?)?|\.\d(?:'?\d)*)(?:[eE][+-]?\d(?:'?\d)*)?)(?:[uUlLfF]|wb|WB)*)(?![\w.])/g, 'number', 1],
    [/\b[A-Za-z_]\w*(?=\s*\()/g, 'function'],
    [/->|\.\.\.|<<=?|>>=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g, 'operator'],
  ],
})
