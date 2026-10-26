// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const pascal = /* @__PURE__ */ simpleLanguage({
  name: "pascal",
  aliases: ["pas", "delphi", "dpr"],
  comments: /\{[\s\S]*?(?:\}|(?![\s\S]))|\(\*[\s\S]*?(?:\*\)|(?![\s\S]))|\/\/[^\r\n]*/,
  strings: /'(?:''|[^'])*(?:'|(?![\s\S]))/,
  keywords: "exports register file shl array record property for mod while set ally label uses raise not stored class safecall var interface or private static exit index inherited to else stdcall override shr asm far resourcestring finalization packed virtual out and protected library do xorwrite goto near function end div overload object unit begin string on inline repeat until destructor write message program with read initialization except default nil if case cdecl in downto threadvar of try pascal const external constructor type public then implementation finally published procedure absolute reintroduce operator as is abstract alias assembler bitpacked break continue cppdecl cvar enumerator experimental platform deprecated unimplemented dynamic export far16 forward generic helper implements interrupt iochecks local name nodefault noreturn nostackframe oldfpccall otherwise saveregisters softfloat specialize strict unaligned varargs",
  insensitive: true,
  rules: [{ className: 'function', regex: /\b[A-Za-z_]\w*(?=\s*\()/g }],
})
