// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const r = /* @__PURE__ */ simpleLanguage({
  name: "r",
  wordCharacters: "\\w.$",
  aliases: [],
  numberSuffix: '[Li]?',
  comments: /#[^\r\n]*/,
  strings: /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[\s\S]|[^\'\\])*(?:\'|(?![\s\S]))|`[^`]*(?:`|(?![\s\S]))/,
  keywords: "function if in break next repeat else for while",
  literals: "NULL NA TRUE FALSE Inf NaN NA_integer_ NA_real_ NA_character_ NA_complex_",
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
