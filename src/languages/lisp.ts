import { nativeCompiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { doubleStrings } from '../internal/simple-language.js'

export const lisp = /* @__PURE__ */ simpleLanguage({
  name: "lisp",
  wordCharacters: "\\w$!?*+./-",
  aliases: ["commonlisp", "cl"],
  comments: /;[^\r\n]*|#\|[\s\S]*?(?:\|#|(?![\s\S]))/,
  strings: doubleStrings,
  keywords: "block case catch cond defclass defconstant defgeneric defmacro defmethod defpackage defparameter defun defvar do dolist dotimes eval-when flet function if in-package labels lambda let let* loop macrolet progn quote return-from setf setq throw unless unwind-protect when",
  literals: "nil t",
  insensitive: true,
  nestedComments: [["#|", "|#"]],
  beforeWords: [[/:[A-Za-z][\w-]*/g, 'literal']],
})
