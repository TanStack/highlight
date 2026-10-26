// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, cComments, quotedStrings } from '../internal/simple-language.js'

export const less = /* @__PURE__ */ simpleLanguage({
  name: "less",
  aliases: [],
  comments: cComments,
  strings: quotedStrings,
  insensitive: true,
  beforeWords: [{ className: 'variable', regex: /@[\w-]+/g }, { className: 'meta', regex: /@[\w-]+/g }, { className: 'selector', regex: /[.#][A-Za-z_][\w-]*/g }, { className: 'property', regex: /[\w-]+(?=\s*:(?!:))/g }],
})
