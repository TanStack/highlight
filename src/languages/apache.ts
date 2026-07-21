import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const apache = defineLanguage({
  name: 'apache',
  tokenize: patternTokenizer([
    { className: 'comment', regex: /^\s*#.*$/gm },
    { className: 'tag', regex: /<\/?\s*([A-Za-z][\w.-]*)/g, group: 1 },
    {
      className: 'keyword',
      regex:
        /^\s*(?:AllowOverride|DirectoryIndex|DocumentRoot|ErrorLog|Header|Include|Listen|LogLevel|Options|ProxyPass|Redirect|Require|RewriteCond|RewriteEngine|RewriteRule|ServerAlias|ServerName|SetEnv|SSLEngine)\b/gim,
    },
    { className: 'string', regex: /\b(?:[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\*:\d+)\b/g },
    { className: 'number', regex: /\b\d+\b/g },
  ]),
})
