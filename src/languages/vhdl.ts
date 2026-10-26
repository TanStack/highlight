// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const vhdl = /* @__PURE__ */ simpleLanguage({
  name: "vhdl",
  aliases: [],
  comments: /--[^\r\n]*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/,
  strings: /"(?:""|[^"\r\n])*(?:"|(?![\s\S]))|\'[^\'\r\n]\'/,
  keywords: "abs access after alias all and architecture array assert assume assume_guarantee attribute begin block body buffer bus case component configuration constant context cover disconnect downto default else elsif end entity exit fairness file for force function generate generic group guarded if impure in inertial inout is label library linkage literal loop map mod nand new next nor not null of on open or others out package parameter port postponed procedure process property protected pure range record register reject release rem report restrict restrict_guarantee return rol ror select sequence severity shared signal sla sll sra srl strong subtype then to transport type unaffected units until use variable view vmode vprop vunit wait when while with xnor xor",
  literals: "false true note warning error failure line text side width",
  insensitive: true,
})
