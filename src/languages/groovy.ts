import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { cComments } from '../internal/simple-language.js'

export const groovy = /* @__PURE__ */ simpleLanguage({
  name: "groovy",
  aliases: [],
  numberSuffix: '[gGlLiIfFdD]?',
  comments: cComments,
  strings: /'''[\s\S]*?(?:'''|(?![\s\S]))|"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "abstract as assert break case catch class continue def default else enum extends final finally for if implements import in instanceof interface new package private protected public return static switch synchronized throw throws trait transient try var volatile while",
  literals: "false null true",
  types: "boolean byte char double float int long short void",
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
