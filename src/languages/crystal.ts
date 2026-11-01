import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { quotedStrings } from '../internal/simple-language.js'

export const crystal = /* @__PURE__ */ simpleLanguage({
  name: "crystal",
  wordCharacters: "\\w$!?",
  aliases: ["cr"],
  comments: /#[^\r\n]*/,
  strings: quotedStrings,
  keywords: "__DIR__ __END_LINE__ __FILE__ __LINE__ abstract alias annotation as as? asm begin break case class def do else elsif end ensure enum extend for fun if include instance_sizeof is_a? lib macro module next nil? of out pointerof private protected require rescue responds_to? return select self sizeof struct super then type typeof uninitialized union unless until verbatim when while with yield",
  literals: "false nil true",
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
