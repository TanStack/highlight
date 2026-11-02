import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const apache = defineLanguage({
  name: 'apache',
  tokenize: patternTokenizer([
    [/^\s*#.*$/gm, 'comment'],
    [/<\/?\s*([A-Za-z][\w.-]*)/g, 'tag', 1],
    [/^\s*(?:AllowOverride|DirectoryIndex|DocumentRoot|ErrorLog|Header|Include|Listen|LogLevel|Options|ProxyPass|Redirect|Require|RewriteCond|RewriteEngine|RewriteRule|ServerAlias|ServerName|SetEnv|SSLEngine)\b/gim, 'keyword'],
    [/\b(?:[A-Za-z0-9.-]+\.[A-Za-z]{2,}|\*:\d+)\b/g, 'string'],
    [/\b\d+\b/g, 'number'],
  ]),
})
