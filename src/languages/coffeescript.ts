// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const coffeescript = /* @__PURE__ */ simpleLanguage({
  name: "coffeescript",
  aliases: ["coffee", "cson"],
  comments: /###[\s\S]*?(?:###|(?![\s\S]))|#[^\r\n]*/,
  strings: /'''[\s\S]*?(?:'''|(?![\s\S]))|"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "as in of if for while finally new do return void else break catch instanceof with throw case default try switch continue typeof delete yield class debugger async await import from export extends using then unless until loop by when and or is isnt not",
  literals: "true false null undefined NaN Infinity yes no on off",
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
