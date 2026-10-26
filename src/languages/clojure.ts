// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, doubleStrings } from '../internal/simple-language.js'

export const clojure = /* @__PURE__ */ simpleLanguage({
  name: "clojure",
  wordCharacters: "\\w$!?*+./-",
  aliases: ["clj", "edn"],
  comments: /;[^\r\n]*/,
  strings: doubleStrings,
  keywords: "def defn defn- defmacro defmulti defmethod defrecord deftype defprotocol fn let letfn loop recur if if-not if-let when when-let when-not do cond case for doseq dotimes try catch finally throw ns in-ns require use import quote var set! new binding",
  literals: "true false nil",
  beforeWords: [{ className: 'literal', regex: /::?[A-Za-z_][\w!?*+./-]*/g }],
})
