// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const awk = /* @__PURE__ */ simpleLanguage({
  name: "awk",
  aliases: [],
  comments: /#[^\r\n]*/,
  strings: /"(?:\\[^\r\n]|[^"\\\r\n])*(?:"|(?![\s\S]))|(?<=~[ \t]*)\/(?:\\.|[^/\\\r\n])*\//,
  keywords: "BEGIN END if else while do for in break continue delete next nextfile function func exit",
  beforeWords: [{ className: 'variable', regex: /\$(?:\d+|[A-Za-z_]\w*)/g }],
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
