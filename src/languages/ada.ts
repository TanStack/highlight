// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const ada = /* @__PURE__ */ simpleLanguage({
  name: "ada",
  aliases: [],
  comments: /--[^\r\n]*/,
  strings: /"(?:""|[^"\r\n])*(?:"|(?![\s\S]))|\'[^\'\r\n]\'/,
  keywords: "abort else new return abs elsif not reverse abstract end accept entry select access exception of separate aliased exit or some all others subtype and for out synchronized array function overriding at tagged generic package task begin goto pragma terminate body private then if procedure type case in protected constant interface is raise use declare range delay limited record when delta loop rem while digits renames with do mod requeue xor",
  literals: "True False",
  insensitive: true,
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
