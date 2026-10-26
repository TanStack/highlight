// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const haskell = /* @__PURE__ */ simpleLanguage({
  name: "haskell",
  wordCharacters: "\\w$'",
  aliases: ["hs"],
  comments: /--[^\r\n]*|\{-[\s\S]*?(?:-\}|(?![\s\S]))/,
  strings: /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\(?:[0-9]{1,3}|x[\da-fA-F]+|[^\r\n])|[^\'\\\r\n])\'/,
  keywords: "let in if then else case of where do module import hiding qualified type data newtype deriving class instance as default infix infixl infixr foreign export ccall stdcall cplusplus jvm dotnet safe unsafe family forall mdo proc rec",
  literals: "True False",
  nestedComments: [["{-", "-}"]],
})
