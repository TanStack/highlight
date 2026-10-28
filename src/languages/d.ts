// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const d = /* @__PURE__ */ simpleLanguage({
  name: "d",
  aliases: [],
  numberSuffix: '[uUlLfFiI]*',
  comments: /\/\/[^\r\n]*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))|\/\+[\s\S]*?(?:\+\/|(?![\s\S]))/,
  strings: /`[^`]*(?:`|(?![\s\S]))|r"[^"]*(?:"|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\.|[^\'\\\r\n])\'/,
  keywords: "abstract alias align asm assert auto body break byte case cast catch class const continue debug default delete deprecated do else enum export extern final finally for foreach foreach_reverse goto if immutable import in inout int interface invariant is lazy macro mixin module new nothrow out override package pragma private protected public pure ref return scope shared static struct super switch synchronized template this throw try typedef typeid typeof union unittest version void volatile while with __FILE__ __LINE__ __gshared __thread __traits __DATE__ __EOF__ __TIME__ __TIMESTAMP__ __VENDOR__ __VERSION__",
  literals: "false null true",
  nestedComments: [["/+", "+/"]],
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
