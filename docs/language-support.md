---
title: Language Support
---

# Language Support

Every language is an isolated definition imported from `@tanstack/highlight/languages/<name>`. Aliases normalize only when their target definition is registered.

## Language matrix

| Language | Export | Aliases | Context-aware behavior |
| --- | --- | --- | --- |
| Apache | `apache` | - | Directives, tags, comments |
| CMake | `cmake` | - | Bracket strings/comments, nested variables, generator expressions |
| C++ | `cpp` | `c++`, `cc`, `cxx`, `hpp`, `hxx` | Raw and prefixed strings, character literals, preprocessor directives, digit separators |
| C# | `csharp` | `c#`, `cs` | Verbatim, interpolated, and raw strings with nested quotes, character literals, preprocessor directives, line-leading and parameter attributes, contextual and LINQ keywords |
| CSS | `css` | - | Strings and comments protect inner syntax |
| Dart | `dart` | - | Interpolated strings with nested quotes and braces, triple-quoted and raw strings, nested block comments, annotations, named-argument labels, contextual keywords |
| Diff | `diff` | `patch` | Metadata, inserted, and deleted lines |
| Dockerfile | `dockerfile` | `docker` | Common directives, variables, commands |
| EJS | `ejs` | - | HTML plus optional JavaScript delegation |
| Env | `env` | `dotenv` | Properties, values, comments |
| Go | `go` | `golang` | Raw strings, runes, comments, declarations |
| HTML | `html` | `htm`, `xml`, `angular-html` | Optional JavaScript/TypeScript and CSS delegation |
| HTTP | `http` | - | Methods, headers, protocol, paths |
| Java | `java` | - | Text blocks, character literals, annotations, contextual keywords, digit separators and hex floats |
| JavaScript | `js` | `javascript`, `mjs`, `cjs`, `js-vue` | Templates, interpolation, regex literals |
| JSON | `json` | `jsonc`, `json5` | Properties, comments, strings, literals |
| JSX | `jsx` | - | JavaScript plus contextual JSX tags |
| Kotlin | `kotlin` | `kt`, `kts` | String templates with nested quotes and braces, raw strings, nested block comments, annotations vs labels, backticked names, contextual soft keywords and accessors |
| Lua | `lua` | - | Level-matched long-bracket strings and comments, string escapes, Luau backtick strings, shebang lines, paren-less calls, LuaJIT number suffixes |
| Markdown | `markdown` | `md` | Optional fenced-language delegation |
| Mermaid | `mermaid` | - | Common diagram declarations and arrows |
| Nginx | `nginx` | - | Directives, variables, URLs, comments |
| Perl | `perl` | `pl` | Sigil and special variables, quote-like operators with nested delimiters, regex vs division, heredocs, POD blocks |
| PHP | `php` | - | PHP tags, attributes, quoted strings, heredoc/nowdoc, optional HTML delegation |
| Plaintext | `plaintext` | `text`, `txt`, `-->` | Escaping only |
| Python | `python` | `py` | Triple strings, prefixes, decorators, comments |
| Ruby | `ruby` | `rb` | Interpolated strings with nested quotes, percent literals, heredocs, regex vs division, symbols and hash keys, block comments |
| Rust | `rust` | `rs` | Nested block comments, raw strings with hash counts, byte and C strings, lifetimes vs character literals, attributes, macros |
| Scheme | `scheme` | `scm`, `racket` | Comments, strings, forms, literals |
| Shell | `shell` | `bash`, `sh`, `zsh`, `cmd`, `console` | Heredocs, parameter expansion, comment boundaries |
| SQL | `sql` | - | Strings, comments, common SQL clauses |
| Svelte | `svelte` | - | Markup plus optional script/style and expression delegation |
| Swift | `swift` | - | Interpolated, multi-line, and raw strings with nested quotes, regex literals vs division, nested block comments, contextual keywords, attributes and directives |
| TOML | `toml` | - | Strings, comments, tables, properties |
| TypeScript | `ts` | `typescript`, `angular-ts` | JavaScript scanner plus TypeScript keywords/types |
| TSRX | `tsrx` | `octane` | TypeScript, contextual JSX, Octane component shorthand and template directives |
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
