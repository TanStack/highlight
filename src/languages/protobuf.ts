import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { cComments, quotedStrings } from '../internal/simple-language.js'

export const protobuf = /* @__PURE__ */ simpleLanguage({
  name: "protobuf",
  aliases: ["proto"],
  comments: cComments,
  strings: quotedStrings,
  keywords: "enum extend extensions group import map message oneof option optional package repeated required reserved returns rpc service stream syntax",
  literals: "false true",
  types: "bool bytes double fixed32 fixed64 float int32 int64 sfixed32 sfixed64 sint32 sint64 string uint32 uint64",
})
