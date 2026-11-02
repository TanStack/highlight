import { nativeCompiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const ada = /* @__PURE__ */ simpleLanguage({
  name: "ada",
  aliases: [],
  comments: /--[^\r\n]*/,
  strings: /"(?:""|[^"\r\n])*(?:"|(?![\s\S]))|\'[^\'\r\n]\'/,
  keywords: "abort abs abstract accept access aliased all and array at begin body case constant declare delay delta digits do else elsif end entry exception exit for function generic goto if in interface is limited loop mod new not of or others out overriding package pragma private procedure protected raise range record rem renames requeue return reverse select separate some subtype synchronized tagged task terminate then type use when while with xor",
  literals: "false true",
  insensitive: true,
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
