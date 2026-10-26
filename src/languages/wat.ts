// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, doubleStrings } from '../internal/simple-language.js'

export const wat = /* @__PURE__ */ simpleLanguage({
  name: "wat",
  aliases: ["wasm"],
  comments: /;;[^\r\n]*|\(;[\s\S]*?(?:;\)|(?![\s\S]))/,
  strings: doubleStrings,
  keywords: "anyfunc block br br_if br_table call call_indirect data drop elem else end export func global.get global.set local.get local.set local.tee get_global get_local global if import local loop memory memory.grow memory.size module mut nop offset param result return select set_global set_local start table tee_local then type unreachable",
  nestedComments: [["(;", ";)"]],
  beforeWords: [{ className: 'variable', regex: /\$[\w.!?+*/<>=-]+/g }],
})
