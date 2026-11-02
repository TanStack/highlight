import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const r = /* @__PURE__ */ simpleLanguage({
  name: "r",
  wordCharacters: "\\w.$",
  aliases: [],
  numberSuffix: '[Li]?',
  comments: /#[^\r\n]*/,
  strings: /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[\s\S]|[^\'\\])*(?:\'|(?![\s\S]))|`[^`]*(?:`|(?![\s\S]))/,
  keywords: "break else for function if in next repeat while",
  literals: "FALSE Inf NA NA_character_ NA_complex_ NA_integer_ NA_real_ NULL NaN TRUE",
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
