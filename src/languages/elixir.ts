import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const elixir = /* @__PURE__ */ simpleLanguage({
  name: "elixir",
  wordCharacters: "\\w$!?",
  aliases: ["ex", "exs"],
  comments: /#[^\r\n]*/,
  strings: /'''[\s\S]*?(?:'''|(?![\s\S]))|"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\[^\r\n]|[^\'\\\r\n])*(?:\'|(?![\s\S]))/,
  keywords: "after alias and case catch cond def defdelegate defexception defguard defimpl defmacro defmacrop defmodule defoverridable defp defprotocol defstruct do else end fn for if import in not or quote raise receive require reraise rescue try unless unquote unquote_splicing use when with",
  literals: "false nil true",
  beforeWords: [[/:[A-Za-z_]\w*[!?]?/g, 'literal']],
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
