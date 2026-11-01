// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const awk = /* @__PURE__ */ simpleLanguage({
  name: "awk",
  aliases: [],
  comments: /#[^\r\n]*/,
  strings: /"(?:\\[^\r\n]|[^"\\\r\n])*(?:"|(?![\s\S]))|(?<=~[ \t]*)\/(?:\\.|[^/\\\r\n])*\//,
  keywords: "BEGIN END break continue delete do else exit for func function if in next nextfile while",
  beforeWords: [[/\$(?:\d+|[A-Za-z_]\w*)/g, 'variable']],
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
