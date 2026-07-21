import { defineLanguage } from '../core.js'
import { patternTokenizer } from '../internal/patterns.js'

export const dockerfile = defineLanguage({
  name: 'dockerfile',
  aliases: ['docker'],
  tokenize: patternTokenizer([
    { className: 'comment', regex: /^\s*#.*$/gm },
    {
      className: 'keyword',
      regex:
        /^\s*(?:ADD|ARG|CMD|COPY|ENTRYPOINT|ENV|EXPOSE|FROM|HEALTHCHECK|LABEL|MAINTAINER|ONBUILD|RUN|SHELL|STOPSIGNAL|USER|VOLUME|WORKDIR)\b/gim,
    },
    { className: 'string', regex: /\b[A-Za-z0-9._/-]+:[A-Za-z0-9._-]+\b/g },
    { className: 'variable', regex: /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/g },
    { className: 'command', regex: /\b(?:bun|npm|npx|pnpm|yarn|node|apt|apt-get|apk)\b/g },
  ]),
})
