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
| `ada` | `@tanstack/highlight/languages/ada` | None |
| `apache` | `@tanstack/highlight/languages/apache` | None |
| `applescript` | `@tanstack/highlight/languages/applescript` | `osascript` |
| `awk` | `@tanstack/highlight/languages/awk` | None |
| `batch` | `@tanstack/highlight/languages/batch` | `bat`, `dos` |
| `c` | `@tanstack/highlight/languages/c` | `h` |
| `clojure` | `@tanstack/highlight/languages/clojure` | `clj`, `edn` |
| `cmake` | `@tanstack/highlight/languages/cmake` | None |
| `coffeescript` | `@tanstack/highlight/languages/coffeescript` | `coffee`, `cson` |
| `cpp` | `@tanstack/highlight/languages/cpp` | `c++`, `cc`, `cxx`, `hpp`, `hxx` |
| `crystal` | `@tanstack/highlight/languages/crystal` | `cr` |
| `csharp` | `@tanstack/highlight/languages/csharp` | `c#`, `cs` |
| `css` | `@tanstack/highlight/languages/css` | None |
| `d` | `@tanstack/highlight/languages/d` | None |
| `dart` | `@tanstack/highlight/languages/dart` | None |
| `diff` | `@tanstack/highlight/languages/diff` | `patch` |
| `dockerfile` | `@tanstack/highlight/languages/dockerfile` | `docker` |
| `ejs` | `@tanstack/highlight/languages/ejs` | None |
| `elixir` | `@tanstack/highlight/languages/elixir` | `ex`, `exs` |
| `elm` | `@tanstack/highlight/languages/elm` | None |
| `env` | `@tanstack/highlight/languages/env` | `dotenv` |
| `erlang` | `@tanstack/highlight/languages/erlang` | `erl` |
| `fortran` | `@tanstack/highlight/languages/fortran` | `f90`, `f95`, `f03`, `f08` |
| `fsharp` | `@tanstack/highlight/languages/fsharp` | `fs`, `f#`, `fsx` |
| `glsl` | `@tanstack/highlight/languages/glsl` | None |
| `go` | `@tanstack/highlight/languages/go` | `golang` |
| `graphql` | `@tanstack/highlight/languages/graphql` | `gql` |
| `groovy` | `@tanstack/highlight/languages/groovy` | None |
| `haskell` | `@tanstack/highlight/languages/haskell` | `hs` |
| `html` | `@tanstack/highlight/languages/html` | `htm`, `xml`, `angular-html` |
| `http` | `@tanstack/highlight/languages/http` | None |
| `ini` | `@tanstack/highlight/languages/ini` | `cfg` |
| `java` | `@tanstack/highlight/languages/java` | None |
| `js` | `@tanstack/highlight/languages/js` | `javascript`, `mjs`, `cjs`, `js-vue` |
| `json` | `@tanstack/highlight/languages/json` | `jsonc`, `json5`, `jsonl` |
| `jsx` | `@tanstack/highlight/languages/jsx` | None |
| `julia` | `@tanstack/highlight/languages/julia` | `jl` |
| `kotlin` | `@tanstack/highlight/languages/kotlin` | `kt`, `kts` |
| `latex` | `@tanstack/highlight/languages/latex` | `tex` |
| `less` | `@tanstack/highlight/languages/less` | None |
| `lisp` | `@tanstack/highlight/languages/lisp` | `commonlisp`, `cl` |
| `lua` | `@tanstack/highlight/languages/lua` | None |
| `makefile` | `@tanstack/highlight/languages/makefile` | `make`, `mk`, `mak` |
| `markdown` | `@tanstack/highlight/languages/markdown` | `md` |
| `matlab` | `@tanstack/highlight/languages/matlab` | None |
| `mermaid` | `@tanstack/highlight/languages/mermaid` | None |
| `nginx` | `@tanstack/highlight/languages/nginx` | None |
| `nix` | `@tanstack/highlight/languages/nix` | `nixos` |
| `objectivec` | `@tanstack/highlight/languages/objectivec` | `objc`, `obj-c`, `objective-c`, `mm` |
| `ocaml` | `@tanstack/highlight/languages/ocaml` | `ml` |
| `pascal` | `@tanstack/highlight/languages/pascal` | `pas`, `delphi`, `dpr` |
| `perl` | `@tanstack/highlight/languages/perl` | `pl` |
| `php` | `@tanstack/highlight/languages/php` | None |
| `plaintext` | `@tanstack/highlight/languages/plaintext` | `text`, `txt`, `-->` |
| `powershell` | `@tanstack/highlight/languages/powershell` | `pwsh`, `ps1`, `ps` |
| `properties` | `@tanstack/highlight/languages/properties` | `java-properties` |
| `protobuf` | `@tanstack/highlight/languages/protobuf` | `proto` |
| `python` | `@tanstack/highlight/languages/python` | `py` |
| `r` | `@tanstack/highlight/languages/r` | None |
| `ruby` | `@tanstack/highlight/languages/ruby` | `rb` |
| `rust` | `@tanstack/highlight/languages/rust` | `rs` |
| `scala` | `@tanstack/highlight/languages/scala` | `sc` |
| `scheme` | `@tanstack/highlight/languages/scheme` | `scm`, `racket` |
| `scss` | `@tanstack/highlight/languages/scss` | None |
| `shell` | `@tanstack/highlight/languages/shell` | `bash`, `sh`, `zsh`, `cmd`, `console` |
| `sql` | `@tanstack/highlight/languages/sql` | None |
| `svelte` | `@tanstack/highlight/languages/svelte` | None |
| `swift` | `@tanstack/highlight/languages/swift` | None |
| `toml` | `@tanstack/highlight/languages/toml` | None |
| `ts` | `@tanstack/highlight/languages/ts` | `typescript`, `angular-ts` |
| `tsrx` | `@tanstack/highlight/languages/tsrx` | `octane` |
| `tsx` | `@tanstack/highlight/languages/tsx` | None |
| `vbnet` | `@tanstack/highlight/languages/vbnet` | `vb` |
| `verilog` | `@tanstack/highlight/languages/verilog` | `v`, `sv`, `svh` |
| `vhdl` | `@tanstack/highlight/languages/vhdl` | None |
| `vue` | `@tanstack/highlight/languages/vue` | None |
| `wat` | `@tanstack/highlight/languages/wat` | `wasm` |
| `x86asm` | `@tanstack/highlight/languages/x86asm` | `asm`, `nasm` |
| `yaml` | `@tanstack/highlight/languages/yaml` | `yml` |

`@tanstack/highlight/languages` re-exports every definition listed above. Named imports from the barrel tree-shake; direct subpaths also avoid resolving unrelated modules.

See the [language support matrix](../language-support) for the context-aware behavior and current scope of each registration.
