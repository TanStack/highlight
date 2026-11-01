import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { doubleStrings } from '../internal/simple-language.js'

export const clojure = /* @__PURE__ */ simpleLanguage({
  name: "clojure",
  wordCharacters: "\\w$!?*+./-",
  aliases: ["clj", "edn"],
  comments: /;[^\r\n]*/,
  strings: doubleStrings,
  keywords: "binding case catch cond def defmacro defmethod defmulti defn defn- defprotocol defrecord deftype do doseq dotimes finally fn for if if-let if-not import in-ns let letfn loop new ns quote recur require set! throw try use var when when-let when-not",
  literals: "false nil true",
  beforeWords: [[/::?[A-Za-z_][\w!?*+./-]*/g, 'literal']],
})
