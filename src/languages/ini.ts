// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, quotedStrings } from '../internal/simple-language.js'

export const ini = /* @__PURE__ */ simpleLanguage({
  name: "ini",
  aliases: ["cfg"],
  comments: /^[ \t]*[;#][^\r\n]*|(?<=[ \t]);[^\r\n]*/,
  strings: quotedStrings,
  insensitive: true,
  beforeWords: [{ className: 'meta', regex: /^\s*\[[^\]\r\n]+\]/gm }, { className: 'property', regex: /^[ \t]*[^\s=;#\[\]\r\n][^=\r\n]*?(?=[ \t]*=)/gm }],
})
