import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const cpp = defineLanguage({
  name: 'cpp',
  aliases: ['c++', 'cc', 'cxx', 'hpp', 'hxx'],
  tokenize: patternTokenizer([
    {
      className: (match) => match[0].startsWith('/') ? 'comment' : 'string',
      regex: /\/\/(?:\\\r?\n|[^\n])*|\/\*[\s\S]*?\*\/|(?:u8|u|U|L)?R"([^ ()\\\t\r\n]{0,16})\([\s\S]*?\)\1"|(?:u8|u|U|L)?"(?:\\[\s\S]|[^"\\])*"|(?<![\w'])(?:u8|u|U|L)?'(?:\\.|[^'\\\r\n])*'/g,
    },
    { className: 'string', regex: /^[ \t]*#[ \t]*include[ \t]*(<[^>\r\n]+>)/gm, group: 1 },
    { className: 'meta', regex: /^[ \t]*(#[ \t]*[A-Za-z_]\w*)/gm, group: 1 },
    {
      className: 'keyword',
      regex: /\b(?:alignas|alignof|and|and_eq|asm|auto|bitand|bitor|break|case|catch|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|dynamic_cast|else|enum|explicit|export|extern|for|friend|goto|if|inline|mutable|namespace|new|noexcept|not|not_eq|operator|or|or_eq|private|protected|public|register|reinterpret_cast|requires|return|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|using|virtual|volatile|while|xor|xor_eq)\b/g,
    },
    { className: 'literal', regex: /\b(?:true|false|nullptr|NULL)\b/g },
    { className: 'type', regex: /\b(?:bool|char|char8_t|char16_t|char32_t|double|float|int|long|short|signed|unsigned|void|wchar_t)\b/g },
    { className: 'type', regex: /\b(?:class|struct|enum|union)\s+([A-Za-z_]\w*)/g, group: 1 },
    {
      className: 'number',
      regex: /(?:^|[^\w.])((?:0[xX][\da-fA-F](?:'?[\da-fA-F])*(?:\.(?:[\da-fA-F]'?)*)?(?:[pP][+-]?\d(?:'?\d)*)?|0[bB][01](?:'?[01])*|(?:\d(?:'?\d)*(?:\.(?:\d(?:'?\d)*)?)?|\.\d(?:'?\d)*)(?:[eE][+-]?\d(?:'?\d)*)?)(?:[uUlLfFzZ]+|_[A-Za-z_]\w*)?)(?![\w.])/g,
      group: 1,
    },
    { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g },
    { className: 'operator', regex: /<=>|->\*?|\.\*|::|<<=?|>>=?|\+\+|--|&&|\|\||[+\-*/%&|^!<>=]=?|[~?:]/g },
  ]),
})
