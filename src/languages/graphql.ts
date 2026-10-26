// Vocabulary adapted from Highlight.js 11.11.1, see NOTICE.md.
import { simpleLanguage } from '../internal/simple-language.js'

export const graphql = /* @__PURE__ */ simpleLanguage({
  name: "graphql",
  aliases: ["gql"],
  comments: /#[^\r\n]*/,
  strings: /"""[\s\S]*?(?:"""|(?![\s\S]))|"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))/,
  keywords: "query mutation subscription type input schema directive interface union scalar fragment enum on",
  literals: "true false null",
  insensitive: true,
  beforeWords: [{ className: 'variable', regex: /\$[A-Za-z_]\w*/g }, { className: 'attr', regex: /@[A-Za-z_]\w*/g }],
})
