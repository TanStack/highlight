// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const powershell = /* @__PURE__ */ simpleLanguage({
  name: "powershell",
  aliases: ["pwsh", "ps1", "ps"],
  comments: /<#[\s\S]*?(?:#>|(?![\s\S]))|#[^\r\n]*/,
  strings: /@"\r?\n[\s\S]*?^"@|@\'\r?\n[\s\S]*?^\'@|"(?:`[\s\S]|[^"`])*(?:"|(?![\s\S]))|\'(?:\'\'|[^\'])*(?:\'|(?![\s\S]))/,
  keywords: "function class enum using configuration if else foreach return do while until elseif begin for trap data dynamicparam end break throw param continue finally in switch exit filter try process catch hidden static parameter",
  insensitive: true,
  beforeWords: [{ className: 'command', regex: /\b[A-Za-z]+-[A-Za-z][\w-]*/g }, { className: 'literal', regex: /\$(?:true|false|null)\b/gi }, { className: 'variable', regex: /\$(?:\{[^}]*\}|[\w:?]+)/g }],
})
