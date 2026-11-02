import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const d = /* @__PURE__ */ simpleLanguage({
  name: "d",
  aliases: [],
  numberSuffix: '[uUlLfFiI]*',
  comments: /\/\/[^\r\n]*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))|\/\+[\s\S]*?(?:\+\/|(?![\s\S]))/,
  strings: /`[^`]*(?:`|(?![\s\S]))|r"[^"]*(?:"|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\.|[^\'\\\r\n])\'/,
  keywords: "__DATE__ __EOF__ __FILE__ __LINE__ __TIMESTAMP__ __TIME__ __VENDOR__ __VERSION__ __gshared __thread __traits abstract alias align asm assert auto body break byte case cast catch class const continue debug default delete deprecated do else enum export extern final finally for foreach foreach_reverse goto if immutable import in inout int interface invariant is lazy macro mixin module new nothrow out override package pragma private protected public pure ref return scope shared static struct super switch synchronized template this throw try typedef typeid typeof union unittest version void volatile while with",
  literals: "false null true",
  nestedComments: [["/+", "+/"]],
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
