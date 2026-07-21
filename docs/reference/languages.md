---
title: Language Modules
---

# Language Modules

Every bundled language is an isolated [`LanguageDefinition`](core#languagedefinition). Import exactly the registrations needed by your application.

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { plaintext } from '@tanstack/highlight/languages/plaintext'
import { tsx } from '@tanstack/highlight/languages/tsx'

const highlighter = createHighlighter({
  fallbackLanguage: 'plaintext',
  languages: [plaintext, tsx],
})
```

## Individual exports

| Export | Module | Aliases |
| --- | --- | --- |
| `apache` | `@tanstack/highlight/languages/apache` | None |
| `css` | `@tanstack/highlight/languages/css` | None |
| `diff` | `@tanstack/highlight/languages/diff` | `patch` |
| `dockerfile` | `@tanstack/highlight/languages/dockerfile` | `docker` |
| `ejs` | `@tanstack/highlight/languages/ejs` | None |
| `env` | `@tanstack/highlight/languages/env` | `dotenv` |
| `html` | `@tanstack/highlight/languages/html` | `htm`, `xml`, `angular-html` |
| `http` | `@tanstack/highlight/languages/http` | None |
| `js` | `@tanstack/highlight/languages/js` | `javascript`, `mjs`, `cjs`, `js-vue` |
| `json` | `@tanstack/highlight/languages/json` | `jsonc`, `json5` |
| `jsx` | `@tanstack/highlight/languages/jsx` | None |
| `markdown` | `@tanstack/highlight/languages/markdown` | `md` |
| `mermaid` | `@tanstack/highlight/languages/mermaid` | None |
| `nginx` | `@tanstack/highlight/languages/nginx` | None |
| `plaintext` | `@tanstack/highlight/languages/plaintext` | `text`, `txt`, `-->` |
| `python` | `@tanstack/highlight/languages/python` | `py` |
| `scheme` | `@tanstack/highlight/languages/scheme` | `scm`, `racket` |
| `shell` | `@tanstack/highlight/languages/shell` | `bash`, `sh`, `zsh`, `cmd`, `console` |
| `sql` | `@tanstack/highlight/languages/sql` | None |
| `svelte` | `@tanstack/highlight/languages/svelte` | None |
| `toml` | `@tanstack/highlight/languages/toml` | None |
| `ts` | `@tanstack/highlight/languages/ts` | `typescript`, `angular-ts` |
| `tsx` | `@tanstack/highlight/languages/tsx` | None |
| `vue` | `@tanstack/highlight/languages/vue` | None |
| `yaml` | `@tanstack/highlight/languages/yaml` | `yml` |

`@tanstack/highlight/languages` re-exports `apache`, `css`, `diff`, `dockerfile`, `ejs`, `env`, `html`, `http`, `js`, `json`, `jsx`, `markdown`, `mermaid`, `nginx`, `plaintext`, `python`, `scheme`, `shell`, `sql`, `svelte`, `toml`, `ts`, `tsx`, `vue`, and `yaml`. The barrel is convenient but individual subpaths make bundle intent explicit.

See the [language support matrix](../language-support) for the context-aware behavior and current scope of each registration.
