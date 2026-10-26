// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage, doubleStrings } from '../internal/simple-language.js'

export const applescript = /* @__PURE__ */ simpleLanguage({
  name: "applescript",
  aliases: ["osascript"],
  comments: /--[^\r\n]*|\(\*[\s\S]*?(?:\*\)|(?![\s\S]))/,
  strings: doubleStrings,
  keywords: "about above after against and around as at back before beginning behind below beneath beside between but by considering contain contains continue copy div does eighth else end equal equals error every exit fifth first for fourth from front get given global if ignoring in into is it its last local me middle mod my ninth not of on onto or over prop property put ref reference repeat returning script second set seventh since sixth some tell tenth that the then third through thru timeout times to transaction try until where while whose with without",
  literals: "AppleScript false linefeed return pi quote result space tab true",
  nestedComments: [["(*", "*)"]],
})
