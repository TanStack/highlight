import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const elm = /* @__PURE__ */ simpleLanguage({
  name: "elm",
  aliases: [],
  comments: /--[^\r\n]*|\{-[\s\S]*?(?:-\}|(?![\s\S]))/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "alias as case command effect else exposing if import in infix infixl infixr let module of port subscription then type where",
  literals: "False True",
  nestedComments: [["{-", "-}"]],
})
