// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { stylesheetWords } from '../internal/stylesheet-words.js'
import { simpleLanguage, cComments, quotedStrings } from '../internal/simple-language.js'

export const scss = /* @__PURE__ */ simpleLanguage({
  name: "scss",
  aliases: [],
  comments: cComments,
  strings: quotedStrings,
  insensitive: true,
  beforeWords: [{ className: 'variable', regex: /\$[\w-]+/g }, { className: 'meta', regex: /@[\w-]+/g }, stylesheetWords],
})
