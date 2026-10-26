// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, quotedStrings } from '../internal/simple-language.js'

export const makefile = /* @__PURE__ */ simpleLanguage({
  name: "makefile",
  aliases: ["make", "mk", "mak"],
  comments: /(?<!\\)#[^\r\n]*/,
  strings: quotedStrings,
  keywords: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath",
  beforeWords: [{ className: 'variable', regex: /\$\([^()]*\)|\$\{[^{}]*\}|\$[@<^?*%+|]/g }, { className: 'property', regex: /^[ \t]*[\w.-]+(?=[ \t]*[:?+!]?=)/gm }, { className: 'meta', regex: /^\.\w+(?=:)/gm }, { className: 'function', regex: /^[\w./%-]+(?=[ \t]*:(?!=))/gm }],
})
