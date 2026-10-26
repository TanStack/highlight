# @tanstack/highlight

## 1.2.0

### Minor Changes

- 36fc879: Add 40 independently importable language definitions, bringing the built-in registry to 79 including plaintext. Named language-barrel imports and direct language subpaths are checked for tree shaking. New definitions provide lightweight lexical coverage using shared scanning helpers and vendored Highlight.js vocabularies, without adding runtime dependencies. The full registry grows; existing selective language imports do not retain the new definitions.

  Serialize ordinary HTML blocks directly and avoid replacement work for text that needs no HTML escaping. Keep token output and decorated rendering unchanged. Measured local docs highlighting takes 20% less time in Node and 27% less in Bun for 73 additional gzip bytes in core.

  Preserve all existing language names and aliases, including `cmd` for `shell`. The new Windows Batch definition uses `batch`, `bat`, and `dos`.

## 1.1.0

### Minor Changes

- 49c2ba6: Add isolated Java, Kotlin, Rust, Ruby, C#, Dart, Lua, and Perl language definitions. Core and existing selective bundles are unchanged.
- 0b8d429: Add an isolated Swift language definition. Core and existing selective bundles are unchanged.

## 1.0.0

### Major Changes

- e125561: Release the stable 1.0 highlighting and adapter contracts. Correct JavaScript and TypeScript keyword property names while preserving switch defaults, accessors, strings, and comments. Validate installed package exports and bounded malformed input across supported Node runtimes, and document migration and compatibility guarantees.

## 0.1.0

### Minor Changes

- 6f0dd9c: Add isolated C++ and CMake language definitions with contextual strings and comments, C++ aliases and numeric literals, and CMake variables and generator expressions. Core and unrelated selective bundles are unchanged.
- Add an isolated Go language definition with the `golang` alias and isolated Gruvbox Dark and Light themes. Existing selective language bundles and the core are unchanged.
- 9ffa69e: Add an isolated PHP language definition with PHP tags, attributes, strings, heredoc/nowdoc, and optional HTML delegation. Core and unrelated selective bundles are unchanged.

## 0.0.11

### Patch Changes

- a1a39c2: Speed up highlighting and numbered blocks, avoid unused HTML rendering in Markdown adapters, and let root helper imports remove unused language code. Reduce the theme helper's size and fix embedded language scanning, captured token offsets, template regex literals, Windows diff annotations, and fence metadata. Preserve existing attributes and plugin data in Rehype output.
