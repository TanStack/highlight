// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, cComments, quotedStrings } from '../internal/simple-language.js'

export const protobuf = /* @__PURE__ */ simpleLanguage({
  name: "protobuf",
  aliases: ["proto"],
  comments: cComments,
  strings: quotedStrings,
  keywords: "package import option optional required repeated group oneof syntax message enum service rpc returns reserved extend extensions map stream",
  literals: "true false",
  types: "double float int32 int64 uint32 uint64 sint32 sint64 fixed32 fixed64 sfixed32 sfixed64 bool string bytes",
})
