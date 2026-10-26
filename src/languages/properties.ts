// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const properties = /* @__PURE__ */ simpleLanguage({
  name: "properties",
  aliases: ["java-properties"],
  comments: /^[ \t]*[#!][^\r\n]*/,
  strings: /(?!)/,
  insensitive: true,
  beforeWords: [{ className: 'property', regex: /^[ \t]*(?:\\[^\r\n]|[^\s=:\\#!])+(?=[ \t=:])/gm }, { className: 'string', regex: /(?<=[=:])[^\r\n]+/g }],
  numbers: false,
})
