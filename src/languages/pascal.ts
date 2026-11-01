// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const pascal = /* @__PURE__ */ simpleLanguage({
  name: "pascal",
  aliases: ["pas", "delphi", "dpr"],
  comments: /\{[\s\S]*?(?:\}|(?![\s\S]))|\(\*[\s\S]*?(?:\*\)|(?![\s\S]))|\/\/[^\r\n]*/,
  strings: /'(?:''|[^'])*(?:'|(?![\s\S]))/,
  keywords: "absolute abstract alias ally and array as asm assembler begin bitpacked break case cdecl class const constructor continue cppdecl cvar default deprecated destructor div do downto dynamic else end enumerator except exit experimental export exports external far far16 file finalization finally for forward function generic goto helper if implementation implements in index inherited initialization inline interface interrupt iochecks is label library local message mod name near nil nodefault noreturn nostackframe not object of oldfpccall on operator or otherwise out overload override packed pascal platform private procedure program property protected public published raise read record register reintroduce repeat resourcestring safecall saveregisters set shl shr softfloat specialize static stdcall stored strict string then threadvar to try type unaligned unimplemented unit until uses var varargs virtual while with write xorwrite",
  insensitive: true,
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
