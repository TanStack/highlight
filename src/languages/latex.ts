// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const latex = /* @__PURE__ */ simpleLanguage({
  name: "latex",
  aliases: ["tex"],
  comments: /(?<!\\)%[^\r\n]*/,
  strings: /\\verb\*?\|[^|\r\n]*\||\\verb\*?\+[^+\r\n]*\+/,
  beforeWords: [{ className: 'keyword', regex: /\\[A-Za-z@]+\*?|\\[^A-Za-z\r\n]/g }],
})
