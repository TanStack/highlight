// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const elixir = /* @__PURE__ */ simpleLanguage({
  name: "elixir",
  wordCharacters: "\\w$!?",
  aliases: ["ex", "exs"],
  comments: /#[^\r\n]*/,
  strings: /'''[\s\S]*?(?:'''|(?![\s\S]))|"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "def defp defmodule defmacro defmacrop defprotocol defimpl defdelegate defexception defoverridable after alias and case catch cond defstruct defguard do else end fn for if import in not or quote raise receive require reraise rescue try unless unquote unquote_splicing use when with",
  literals: "false nil true",
  beforeWords: [{ className: 'literal', regex: /:[A-Za-z_]\w*[!?]?/g }],
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
