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
| `cmake` | `@tanstack/highlight/languages/cmake` | None |
| `cpp` | `@tanstack/highlight/languages/cpp` | `c++`, `cc`, `cxx`, `hpp`, `hxx` |
| `csharp` | `@tanstack/highlight/languages/csharp` | `c#`, `cs` |
| `css` | `@tanstack/highlight/languages/css` | None |
| `dart` | `@tanstack/highlight/languages/dart` | None |
| `diff` | `@tanstack/highlight/languages/diff` | `patch` |
| `dockerfile` | `@tanstack/highlight/languages/dockerfile` | `docker` |
| `ejs` | `@tanstack/highlight/languages/ejs` | None |
| `env` | `@tanstack/highlight/languages/env` | `dotenv` |
| `go` | `@tanstack/highlight/languages/go` | `golang` |
| `html` | `@tanstack/highlight/languages/html` | `htm`, `xml`, `angular-html` |
| `http` | `@tanstack/highlight/languages/http` | None |
| `java` | `@tanstack/highlight/languages/java` | None |
| `js` | `@tanstack/highlight/languages/js` | `javascript`, `mjs`, `cjs`, `js-vue` |
| `json` | `@tanstack/highlight/languages/json` | `jsonc`, `json5` |
| `jsx` | `@tanstack/highlight/languages/jsx` | None |
| `kotlin` | `@tanstack/highlight/languages/kotlin` | `kt`, `kts` |
| `lua` | `@tanstack/highlight/languages/lua` | None |
| `markdown` | `@tanstack/highlight/languages/markdown` | `md` |
| `mermaid` | `@tanstack/highlight/languages/mermaid` | None |
| `nginx` | `@tanstack/highlight/languages/nginx` | None |
| `perl` | `@tanstack/highlight/languages/perl` | `pl` |
| `php` | `@tanstack/highlight/languages/php` | None |
| `plaintext` | `@tanstack/highlight/languages/plaintext` | `text`, `txt`, `-->` |
| `python` | `@tanstack/highlight/languages/python` | `py` |
| `ruby` | `@tanstack/highlight/languages/ruby` | `rb` |
| `rust` | `@tanstack/highlight/languages/rust` | `rs` |
| `scheme` | `@tanstack/highlight/languages/scheme` | `scm`, `racket` |
| `shell` | `@tanstack/highlight/languages/shell` | `bash`, `sh`, `zsh`, `cmd`, `console` |
| `sql` | `@tanstack/highlight/languages/sql` | None |
| `svelte` | `@tanstack/highlight/languages/svelte` | None |
| `swift` | `@tanstack/highlight/languages/swift` | None |
| `toml` | `@tanstack/highlight/languages/toml` | None |
| `ts` | `@tanstack/highlight/languages/ts` | `typescript`, `angular-ts` |
| `tsrx` | `@tanstack/highlight/languages/tsrx` | `octane` |
| `tsx` | `@tanstack/highlight/languages/tsx` | None |
| `vue` | `@tanstack/highlight/languages/vue` | None |
| `yaml` | `@tanstack/highlight/languages/yaml` | `yml` |

`@tanstack/highlight/languages` re-exports `apache`, `cmake`, `cpp`, `csharp`, `css`, `dart`, `diff`, `dockerfile`, `ejs`, `env`, `go`, `html`, `http`, `java`, `js`, `json`, `jsx`, `kotlin`, `lua`, `markdown`, `mermaid`, `nginx`, `perl`, `php`, `plaintext`, `python`, `ruby`, `rust`, `scheme`, `shell`, `sql`, `svelte`, `swift`, `toml`, `ts`, `tsrx`, `tsx`, `vue`, and `yaml`. The barrel is convenient but individual subpaths make bundle intent explicit.

See the [language support matrix](../language-support) for the context-aware behavior and current scope of each registration.
