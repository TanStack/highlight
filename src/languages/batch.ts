// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, doubleStrings } from '../internal/simple-language.js'

export const batch = /* @__PURE__ */ simpleLanguage({
  name: "batch",
  aliases: ["bat", "dos"],
  comments: /^[ \t]*@?(?:rem\b|::)[^\r\n]*/,
  strings: doubleStrings,
  keywords: "if else goto for in do call exit not exist errorlevel defined equ neq lss leq gtr geq",
  insensitive: true,
  beforeWords: [{ className: 'variable', regex: /%[^%\r\n]+%|![^!\r\n]+!|%[0-9*]|%%[A-Za-z]/g }],
})
