// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, quotedStrings } from '../internal/simple-language.js'

export const ini = /* @__PURE__ */ simpleLanguage({
  name: "ini",
  aliases: ["cfg"],
  comments: /^[ \t]*[;#][^\r\n]*|(?<=[ \t]);[^\r\n]*/,
  strings: quotedStrings,
  insensitive: true,
  beforeWords: [[/^\s*\[[^\]\r\n]+\]/gm, 'meta'], [/^[ \t]*[^\s=;#\[\]\r\n][^=\r\n]*?(?=[ \t]*=)/gm, 'property']],
})
