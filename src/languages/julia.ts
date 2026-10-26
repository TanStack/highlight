// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const julia = /* @__PURE__ */ simpleLanguage({
  name: "julia",
  aliases: ["jl"],
  comments: /\#=[\s\S]*?(?:=\#|(?![\s\S]))|#[^\r\n]*/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|\'(?:\\.|[^\'\\\r\n])\'/,
  keywords: "baremodule begin break catch ccall const continue do else elseif end export false finally for function global if import in isa let local macro module quote return true try using where while",
  literals: "ARGS C_NULL DEPOT_PATH ENDIAN_BOM ENV Inf Inf16 Inf32 Inf64 InsertionSort LOAD_PATH MergeSort NaN NaN16 NaN32 NaN64 PROGRAM_FILE QuickSort RoundDown RoundFromZero RoundNearest RoundNearestTiesAway RoundNearestTiesUp RoundToZero RoundUp VERSION devnull false im missing nothing pi stderr stdin stdout true undef \u03c0 \u212f",
  nestedComments: [["#=", "=#"]],
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
