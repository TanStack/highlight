import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

// C++-only words such as `class`, `new`, `this`, and `template` stay plain because they are valid C identifiers.
export const c = defineLanguage({
  name: 'c',
  aliases: ['h'],
  tokenize: patternTokenizer([
    {
      className: (match) => match[0].startsWith('/') ? 'comment' : 'string',
      regex: /\/\/(?:\\\r?\n|[^\n])*|\/\*[\s\S]*?\*\/|(?:u8|u|U|L)?"(?:\\[\s\S]|[^"\\\r\n])*"?|(?<![\w'])(?:u8|u|U|L)?'(?:\\.|[^'\\\r\n])*'/g,
    },
    { className: 'string', regex: /^[ \t]*#[ \t]*(?:include|embed)[ \t]*(<[^>\r\n]+>)/gm, group: 1 },
    { className: 'meta', regex: /^[ \t]*(#[ \t]*[A-Za-z_]\w*)/gm, group: 1 },
    {
      className: 'keyword',
      regex: /\b(?:alignas|alignof|auto|break|case|const|constexpr|continue|default|do|else|enum|extern|for|goto|if|inline|register|restrict|return|sizeof|static|static_assert|struct|switch|thread_local|typedef|typeof|typeof_unqual|union|volatile|while|_Alignas|_Alignof|_Atomic|_Generic|_Noreturn|_Static_assert|_Thread_local)\b/g,
    },
    { className: 'literal', regex: /\b(?:true|false|nullptr|NULL)\b/g },
    { className: 'type', regex: /\b(?:bool|char|double|float|int|long|short|signed|unsigned|void|_BitInt|_Bool|_Complex|_Decimal32|_Decimal64|_Decimal128|_Imaginary)\b/g },
    { className: 'type', regex: /\b(?:struct|enum|union)\s+([A-Za-z_]\w*)/g, group: 1 },
    {
      className: 'number',
      regex: /(?:^|[^\w.])((?:0[xX][\da-fA-F](?:'?[\da-fA-F])*(?:\.(?:[\da-fA-F]'?)*)?(?:[pP][+-]?\d(?:'?\d)*)?|0[bB][01](?:'?[01])*|(?:\d(?:'?\d)*(?:\.(?:\d(?:'?\d)*)?)?|\.\d(?:'?\d)*)(?:[eE][+-]?\d(?:'?\d)*)?)(?:[uUlLfF]|wb|WB)*)(?![\w.])/g,
      group: 1,
    },
    { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g },
    { className: 'operator', regex: /->|\.\.\.|<<=?|>>=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g },
  ]),
})
