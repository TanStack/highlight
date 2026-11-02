import { nativeCompiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const vbnet = /* @__PURE__ */ simpleLanguage({
  name: "vbnet",
  aliases: ["vb"],
  comments: /\'[^\r\n]*|\bREM[ \t][^\r\n]*/,
  strings: /"(?:""|[^"\r\n])*(?:"|(?![\s\S]))/,
  keywords: "addhandler aggregate alias ansi as assembly async auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each else elseif end enum equals erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop strict structure sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
  literals: "false nothing true",
  types: "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort",
  insensitive: true,
  rules: [[/\b[A-Za-z_]\w*(?=\s*\()/g, 'function']],
})
