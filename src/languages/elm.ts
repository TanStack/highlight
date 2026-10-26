// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const elm = /* @__PURE__ */ simpleLanguage({
  name: "elm",
  aliases: [],
  comments: /--[^\r\n]*|\{-[\s\S]*?(?:-\}|(?![\s\S]))/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "let in if then else case of where module import exposing type alias as infix infixl infixr port effect command subscription",
  literals: "True False",
  nestedComments: [["{-", "-}"]],
})
