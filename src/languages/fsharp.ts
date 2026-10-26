// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const fsharp = /* @__PURE__ */ simpleLanguage({
  name: "fsharp",
  wordCharacters: "\\w$'",
  aliases: ["fs", "f#", "fsx"],
  comments: /\/\/[^\r\n]*|\(\*[\s\S]*?(?:\*\)|(?![\s\S]))/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|@"(?:""|[^"])*(?:"|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\.|[^\'\\\r\n])\'/,
  keywords: "abstract and as assert base begin class default delegate do done downcast downto elif else end exception extern finally fixed for fun function global if in inherit inline interface internal lazy let match member module mutable namespace new of open or override private public rec return static struct then to try type upcast use val void when while with yield",
  literals: "true false null Some None Ok Error infinity infinityf nan nanf",
  nestedComments: [["(*", "*)"]],
})
