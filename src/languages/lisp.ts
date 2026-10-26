// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, doubleStrings } from '../internal/simple-language.js'

export const lisp = /* @__PURE__ */ simpleLanguage({
  name: "lisp",
  wordCharacters: "\\w$!?*+./-",
  aliases: ["commonlisp", "cl"],
  comments: /;[^\r\n]*|#\|[\s\S]*?(?:\|#|(?![\s\S]))/,
  strings: doubleStrings,
  keywords: "defun defmacro defvar defparameter defconstant defclass defmethod defgeneric lambda let let* if when unless cond case loop do dolist dotimes progn quote function setq setf block return-from catch throw unwind-protect labels flet macrolet eval-when in-package defpackage",
  literals: "nil t",
  insensitive: true,
  nestedComments: [["#|", "|#"]],
  beforeWords: [{ className: 'literal', regex: /:[A-Za-z][\w-]*/g }],
})
