// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const nix = /* @__PURE__ */ simpleLanguage({
  name: "nix",
  wordCharacters: "\\w$'-",
  aliases: ["nixos"],
  comments: /#[^\r\n]*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/,
  strings: /\'\'(?:\'\'\'|\'\'\$\{|\'\'\\[\s\S]|(?!\'\')[\s\S])*(?:\'\'|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))/,
  keywords: "assert else if in inherit let or rec then with",
  literals: "true false null",
})
