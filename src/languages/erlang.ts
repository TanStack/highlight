import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { quotedStrings } from '../internal/simple-language.js'

export const erlang = /* @__PURE__ */ simpleLanguage({
  name: "erlang",
  aliases: ["erl"],
  comments: /%[^\r\n]*/,
  strings: quotedStrings,
  keywords: "after and andalso band begin bnot bor bsl bxor bzr case catch cond div else end fun if let maybe not of orelse query receive rem try when xor",
  literals: "false true",
  beforeWords: [[/^-[a-z]+(?=\()/gm, 'meta']],
  rules: [[/\b[A-Z_]\w*/g, 'variable'], [/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
