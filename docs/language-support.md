---
title: Language Support
---

# Language Support

Every language is an isolated definition imported from `@tanstack/highlight/languages/<name>`. Aliases normalize only when their target definition is registered.

## Language matrix

| Language | Export | Aliases | Context-aware behavior |
| --- | --- | --- | --- |
| Ada | `ada` | None | Doubled quotes, character literals, case-insensitive keywords |
| Apache | `apache` | - | Directives, tags, comments |
| AppleScript | `applescript` | `osascript` | Nested block comments, strings, case-insensitive keywords |
| AWK | `awk` | None | Fields, strings, regex patterns following ~, keywords and comments |
| Batch | `batch` | `bat`, `dos` | REM comments, variables, quoted strings, control keywords |
| C | `c` | `h` | Preprocessor directives, strings, character literals, types |
| C# | `csharp` | `c#`, `cs` | Verbatim, interpolated, and raw strings with nested quotes, character literals, preprocessor directives, line-leading and parameter attributes, contextual and LINQ keywords |
| C++ | `cpp` | `c++`, `cc`, `cxx`, `hpp`, `hxx` | Raw and prefixed strings, character literals, preprocessor directives, digit separators |
| Clojure | `clojure` | `clj`, `edn` | Forms, strings, keyword symbols, line comments |
| CMake | `cmake` | - | Bracket strings/comments, nested variables, generator expressions |
| CoffeeScript | `coffeescript` | `coffee`, `cson` | Block comments, triple-quoted strings, keywords and literals |
| Common Lisp | `lisp` | `commonlisp`, `cl` | Forms, keyword symbols, nested comments, strings |
| Crystal | `crystal` | `cr` | Declarations, quoted strings, line comments |
| CSS | `css` | - | Strings and comments protect inner syntax |
| D | `d` | None | Nested /+ comments, backtick strings, declarations |
| Dart | `dart` | - | Interpolated strings with nested quotes and braces, triple-quoted and raw strings, nested block comments, annotations, named-argument labels, contextual keywords |
| Diff | `diff` | `patch` | Metadata, inserted, and deleted lines |
| Dockerfile | `dockerfile` | `docker` | Common directives, variables, commands |
| EJS | `ejs` | - | HTML plus optional JavaScript delegation |
| Elixir | `elixir` | `ex`, `exs` | Declarations, atoms, quoted and triple-quoted strings |
| Elm | `elm` | None | Nested block comments, strings, keywords |
| Env | `env` | `dotenv` | Properties, values, comments |
| Erlang | `erlang` | `erl` | Directives, variables, strings, keywords |
| F# | `fsharp` | `fs`, `f#`, `fsx` | Nested comments, verbatim and triple-quoted strings, character literals |
| Fortran | `fortran` | `f90`, `f95`, `f03`, `f08` | Free-form comments, doubled quotes, case-insensitive keywords |
| GLSL | `glsl` | None | Preprocessor directives, qualifiers, types, comments |
| Go | `go` | `golang` | Raw strings, runes, comments, declarations |
| GraphQL | `graphql` | `gql` | Block descriptions, variables, directives, schema and operation keywords |
| Groovy | `groovy` | None | Declarations, quoted and triple-quoted strings, comments |
| Haskell | `haskell` | `hs` | Nested comments, character literals, strings, keywords |
| HTML | `html` | `htm`, `xml`, `angular-html` | Optional JavaScript/TypeScript and CSS delegation |
| HTTP | `http` | - | Methods, headers, protocol, paths |
| INI | `ini` | `cfg` | Sections, properties, quoted values, comments |
| Java properties | `properties` | `java-properties` | Keys, simple values, escaped key separators and comments |
| Java | `java` | - | Text blocks, character literals, annotations, contextual keywords, digit separators and hex floats |
| JavaScript | `js` | `javascript`, `mjs`, `cjs`, `js-vue` | Templates, interpolation, regex literals |
| JSON | `json` | `jsonc`, `json5` | Properties, comments, strings, literals |
| JSX | `jsx` | - | JavaScript plus contextual JSX tags |
| Julia | `julia` | `jl` | Nested comments, triple-quoted strings, character literals, keywords |
| Kotlin | `kotlin` | `kt`, `kts` | String templates with nested quotes and braces, raw strings, nested block comments, annotations vs labels, backticked names, contextual soft keywords and accessors |
| LaTeX | `latex` | `tex` | Commands, comments, pipe- and plus-delimited verbatim spans |
| Less | `less` | None | Variables, selectors, properties, strings and comments |
| Lua | `lua` | - | Level-matched long-bracket strings and comments, string escapes, Luau backtick strings, shebang lines, paren-less calls, LuaJIT number suffixes |
| Makefile | `makefile` | `make`, `mk`, `mak` | Targets, assignments, variable references, comments |
| Markdown | `markdown` | `md` | Optional fenced-language delegation |
| MATLAB | `matlab` | None | Line and block comments, doubled quotes, common transpose boundaries |
| Mermaid | `mermaid` | - | Common diagram declarations and arrows |
| Nginx | `nginx` | - | Directives, variables, URLs, comments |
| Nix | `nix` | `nixos` | Indented and quoted strings, comments, keywords |
| Objective-C | `objectivec` | `objc`, `obj-c`, `objective-c`, `mm` | At-prefixed declarations and strings, preprocessor directives |
| OCaml | `ocaml` | `ml` | Nested comments, strings, character literals, type-variable boundaries |
| Pascal / Delphi | `pascal` | `pas`, `delphi`, `dpr` | Brace and block comments, doubled apostrophes, case-insensitive keywords |
| Perl | `perl` | `pl` | Sigil and special variables, quote-like operators with nested delimiters, regex vs division, heredocs, POD blocks |
| PHP | `php` | - | PHP tags, attributes, quoted strings, heredoc/nowdoc, optional HTML delegation |
| Plaintext | `plaintext` | `text`, `txt`, `-->` | Escaping only |
| PowerShell | `powershell` | `pwsh`, `ps1`, `ps` | Here-strings, variables, commands, block comments |
| Protocol Buffers | `protobuf` | `proto` | Message and service declarations, scalar types, comments |
| Python | `python` | `py` | Triple strings, prefixes, decorators, comments |
| R | `r` | None | Strings, backtick names, literals, comments |
| Ruby | `ruby` | `rb` | Interpolated strings with nested quotes, percent literals, heredocs, regex vs division, symbols and hash keys, block comments |
| Rust | `rust` | `rs` | Nested block comments, raw strings with hash counts, byte and C strings, lifetimes vs character literals, attributes, macros |
| Scala | `scala` | `sc` | Nested comments, quoted and triple-quoted strings, declarations |
| Scheme | `scheme` | `scm`, `racket` | Comments, strings, forms, literals |
| SCSS | `scss` | None | Variables, directives, selectors, properties, strings and comments |
| Shell | `shell` | `bash`, `sh`, `zsh`, `cmd`, `console` | Heredocs, parameter expansion, comment boundaries |
| SQL | `sql` | - | Strings, comments, common SQL clauses |
| Svelte | `svelte` | - | Markup plus optional script/style and expression delegation |
| Swift | `swift` | - | Interpolated, multi-line, and raw strings with nested quotes, regex literals vs division, nested block comments, contextual keywords, attributes and directives |
| TOML | `toml` | - | Strings, comments, tables, properties |
| TSRX | `tsrx` | `octane` | TypeScript, contextual JSX, Octane component shorthand and template directives |
| TSX | `tsx` | - | TypeScript, contextual JSX, generic disambiguation |
| TypeScript | `ts` | `typescript`, `angular-ts` | JavaScript scanner plus TypeScript keywords/types |
| Verilog / SystemVerilog | `verilog` | `v`, `sv`, `svh` | Directives, sized numeric literals, keywords and comments |
| VHDL | `vhdl` | None | Strings, character literals, case-insensitive keywords, comments |
| Visual Basic .NET | `vbnet` | `vb` | Doubled quotes, apostrophe and REM comments, case-insensitive keywords |
| Vue | `vue` | - | Template markup plus optional script/style delegation |
| WebAssembly text | `wat` | `wasm` | Nested comments, named variables, instructions and strings |
| x86 assembly | `x86asm` | `asm`, `nasm` | Common instructions and registers, labels, directives and comments |
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

The 40 added definitions from Ada through WebAssembly text provide lexical highlighting for common documentation examples. They share a small scanner and carry only their own vocabulary. They do not include the Highlight.js runtime or its complete grammars.

Expressions inside strings are not tokenized separately in these definitions. Language-specific sigils, heredocs outside PowerShell, regex literals outside AWK's `~` form, macro bodies, and embedded languages are not fully parsed. Fortran covers free-form code; the assembly definition covers common x86 instructions. Existing definitions with deeper interpolation or embedding support retain that behavior.

The existing `cmd` alias continues to resolve to `shell`. Use `batch`, `bat`, or `dos` to select the new Windows Batch definition.


Support means useful highlighting for valid code commonly found in documentation. It does not mean compiler conformance or parity with an IDE grammar. The regression suite concentrates on contexts where simple priority regexes are predictably wrong.

Unknown or unregistered language names normalize to the configured fallback, which defaults to `plaintext`.

See [Embedded Languages](guides/embedded-languages) and [Custom Languages](guides/custom-languages) for the registry model.
