// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, quotedStrings } from '../internal/simple-language.js'

export const erlang = /* @__PURE__ */ simpleLanguage({
  name: "erlang",
  aliases: ["erl"],
  comments: /%[^\r\n]*/,
  strings: quotedStrings,
  keywords: "after and andalso band begin bnot bor bsl bzr bxor case catch cond div end fun if let not of orelse query receive rem try when xor maybe else",
  literals: "false true",
  beforeWords: [{ className: 'meta', regex: /^-[a-z]+(?=\()/gm }],
  rules: [{ className: 'variable', regex: /\b[A-Z_]\w*/g }, { className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
