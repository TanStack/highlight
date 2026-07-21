---
title: Language Support
---

# Language Support

Every language is an isolated definition imported from `@tanstack/highlight/languages/<name>`. Aliases normalize only when their target definition is registered.

## Language matrix

| Language | Export | Aliases | Context-aware behavior |
| --- | --- | --- | --- |
| Apache | `apache` | - | Directives, tags, comments |
| CSS | `css` | - | Strings and comments protect inner syntax |
| Diff | `diff` | `patch` | Metadata, inserted, and deleted lines |
| Dockerfile | `dockerfile` | `docker` | Common directives, variables, commands |
| EJS | `ejs` | - | HTML plus optional JavaScript delegation |
| Env | `env` | `dotenv` | Properties, values, comments |
| HTML | `html` | `htm`, `xml`, `angular-html` | Optional JavaScript/TypeScript and CSS delegation |
| HTTP | `http` | - | Methods, headers, protocol, paths |
| JavaScript | `js` | `javascript`, `mjs`, `cjs`, `js-vue` | Templates, interpolation, regex literals |
| JSON | `json` | `jsonc`, `json5` | Properties, comments, strings, literals |
| JSX | `jsx` | - | JavaScript plus contextual JSX tags |
| Markdown | `markdown` | `md` | Optional fenced-language delegation |
| Mermaid | `mermaid` | - | Common diagram declarations and arrows |
| Nginx | `nginx` | - | Directives, variables, URLs, comments |
| Plaintext | `plaintext` | `text`, `txt`, `-->` | Escaping only |
| Python | `python` | `py` | Triple strings, prefixes, decorators, comments |
| Scheme | `scheme` | `scm`, `racket` | Comments, strings, forms, literals |
| Shell | `shell` | `bash`, `sh`, `zsh`, `cmd`, `console` | Heredocs, parameter expansion, comment boundaries |
| SQL | `sql` | - | Strings, comments, common SQL clauses |
| Svelte | `svelte` | - | Markup plus optional script/style and expression delegation |
| TOML | `toml` | - | Strings, comments, tables, properties |
| TypeScript | `ts` | `typescript`, `angular-ts` | JavaScript scanner plus TypeScript keywords/types |
| TSX | `tsx` | - | TypeScript, contextual JSX, generic disambiguation |
| Vue | `vue` | - | Template markup plus optional script/style delegation |
| YAML | `yaml` | `yml` | Comment boundaries and block scalars |

## Registration matters

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'

const markupOnly = createHighlighter({ languages: [html] })
```

`markupOnly` highlights tags and attributes, but leaves `<script>` and `<style>` bodies uncolored. Add the delegated languages explicitly:

```ts
import { css } from '@tanstack/highlight/languages/css'
import { js } from '@tanstack/highlight/languages/js'

const withEmbeddings = createHighlighter({
  languages: [html, css, js],
})
```

## Quality boundary

Support means useful highlighting for valid code commonly found in documentation. It does not mean compiler conformance or parity with an IDE grammar. The regression suite concentrates on contexts where simple priority regexes are predictably wrong.

Unknown or unregistered language names normalize to the configured fallback, which defaults to `plaintext`.

See [Embedded Languages](guides/embedded-languages) and [Custom Languages](guides/custom-languages) for the registry model.
