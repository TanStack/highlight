// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, quotedStrings } from '../internal/simple-language.js'

export const x86asm = /* @__PURE__ */ simpleLanguage({
  name: "x86asm",
  aliases: ["asm", "nasm"],
  comments: /;[^\r\n]*/,
  strings: quotedStrings,
  keywords: "section segment global extern bits default org equ db dw dd dq resb resw resd resq align mov movzx movsx lea push pop call ret jmp je jne jz jnz ja jae jb jbe jg jge jl jle add sub mul imul div idiv inc dec and or xor not neg shl shr sar sal test cmp nop int syscall sysenter leave enter loop rep repe repne lock xchg cmpxchg",
  types: "al ah ax eax rax bl bh bx ebx rbx cl ch cx ecx rcx dl dh dx edx rdx si esi rsi di edi rdi sp esp rsp bp ebp rbp rip eip r8 r9 r10 r11 r12 r13 r14 r15 byte word dword qword",
  insensitive: true,
  beforeWords: [{ className: 'function', regex: /^[A-Za-z_.][\w.]*(?=:)/gm }],
})
