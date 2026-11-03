import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const coffeescript = /* @__PURE__ */ simpleLanguage({
  name: "coffeescript",
  aliases: ["coffee", "cson"],
  comments: /###[\s\S]*?(?:###|(?![\s\S]))|#[^\r\n]*/,
  strings: /'''[\s\S]*?(?:'''|(?![\s\S]))|"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "and as async await break by case catch class continue debugger default delete do else export extends finally for from if import in instanceof is isnt loop new not of or return switch then throw try typeof unless until using void when while with yield",
  literals: "Infinity NaN false no null off on true undefined yes",
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
