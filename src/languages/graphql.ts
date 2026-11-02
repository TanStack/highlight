import { compiledWordLanguage as simpleLanguage } from '../internal/word-language.js'
// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.


export const graphql = /* @__PURE__ */ simpleLanguage({
  name: "graphql",
  aliases: ["gql"],
  comments: /#[^\r\n]*/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))/,
  keywords: "directive enum fragment input interface mutation on query scalar schema subscription type union",
  literals: "false null true",
  beforeWords: [[/\$[A-Za-z_]\w*/g, 'variable'], [/@[A-Za-z_]\w*/g, 'attr']],
})
