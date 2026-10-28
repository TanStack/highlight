// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const matlab = /* @__PURE__ */ simpleLanguage({
  name: "matlab",
  aliases: [],
  comments: /^[ \t]*%\{[ \t]*\r?\n[\s\S]*?^[ \t]*%\}[ \t]*(?=\r?$)|%[^\r\n]*/,
  strings: /"(?:""|[^"\r\n])*(?:"|(?![\s\S]))|(?<![\w)\]}.])\'(?:\'\'|[^\'\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "arguments break case catch classdef continue else elseif end enumeration events for function global if methods otherwise parfor persistent properties return spmd switch try while",
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
