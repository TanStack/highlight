// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const ocaml = /* @__PURE__ */ simpleLanguage({
  name: "ocaml",
  wordCharacters: "\\w$'",
  aliases: ["ml"],
  comments: /\(\*[\s\S]*?(?:\*\)|(?![\s\S]))/,
  strings: /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\(?:[0-9]{1,3}|x[\da-fA-F]+|[^\r\n])|[^\'\\\r\n])\'/,
  keywords: "and as assert asr begin class constraint do done downto else end exception external for fun function functor if in include inherit! inherit initializer land lazy let lor lsl lsr lxor match method! method mod module mutable new object of open! open or private rec sig struct then to try type val! val virtual when while with parser value",
  literals: "true false",
  nestedComments: [["(*", "*)"]],
})
