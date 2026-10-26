// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, cComments, quotedStrings } from '../internal/simple-language.js'

export const c = /* @__PURE__ */ simpleLanguage({
  name: "c",
  aliases: ["h"],
  numberSuffix: '[uUlLfF]*',
  comments: cComments,
  strings: quotedStrings,
  keywords: "asm auto break case continue default do else enum extern for fortran goto if inline register restrict return sizeof typeof typeof_unqual struct switch typedef union volatile while _Alignas _Alignof _Atomic _Generic _Noreturn _Static_assert _Thread_local alignas alignof noreturn static_assert thread_local _Pragma",
  literals: "true false NULL",
  types: "float double signed unsigned int short long char void _Bool _BitInt _Complex _Imaginary _Decimal32 _Decimal64 _Decimal96 _Decimal128 _Decimal64x _Decimal128x _Float16 _Float32 _Float64 _Float128 _Float32x _Float64x _Float128x const static constexpr complex bool imaginary",
  beforeWords: [{ className: 'meta', regex: /^[ \t]*#[ \t]*[A-Za-z_]\w*/gm }],
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
