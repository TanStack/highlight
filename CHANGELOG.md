# @tanstack/highlight

## 1.2.8

### Patch Changes

- b1891d2: Handle large template interpolations in JavaScript, TypeScript, JSX and TSX without exceeding the JavaScript argument limit.

## 1.2.7

### Patch Changes

- 08125a1: Handle large highlighted Markdown code fences without exceeding the JavaScript argument limit.

## 1.2.6

### Patch Changes

- 48c3f23: Avoid JavaScript argument-count limits when appending large embedded-language token results in markup.

## 1.2.5

### Patch Changes

- 01e5bf0: Avoid repeatedly scanning impossible tag endings in malformed markup while preserving comment, template and inner-tag recovery.

## 1.2.4

### Patch Changes

- 81b6d79: Use native newline search when rendering line numbers and line decorations, reducing the scan cost for long source lines while preserving line boundaries and escaping.

## 1.2.3

### Patch Changes

- c133368: Reduce repeated identifier scanning inside JavaScript and TypeScript object expressions.

## 1.2.2

### Patch Changes

- a52b8f6: Improve JavaScript and TypeScript highlighting speed for division-heavy code by bounding regex literal context checks.

## 1.2.1

### Patch Changes

- 57dc919: Reduce intermediate token-range and regular-expression allocations while preserving highlighting output.

  Use compact internal pattern records to reduce selective and all-language bundle sizes.

  Initialize optional-language tokenizers on first use to reduce unused startup work.

  Render decorated HTML directly while preserving the public render-node output.

  Reuse boundary edges and defer decoration sets until a slice overlaps a range.

  Reuse normalized internal attribute names and inline key formatting.

  Order eligible whole-word vocabulary alternatives to improve bundle compression.

  Reuse freshly owned lexical ranges to avoid intermediate copies and overlap scans.

  Compile proven case-sensitive word categories into one exact-word scanner while native insensitive imports retain their smaller backend.

  Retain only non-keyword classes after compiling the exact vocabulary.

  Release owned tokenizer construction state after successful initialization while preserving live generic options.

  Share the fixed nested-comment scanner across Rust, Kotlin, Swift and Dart, using direct delimiter runs and cached forward searches without match arrays.

  Keep fresh PHP lexical ranges owned while changing coordinate systems, avoiding intermediate range and array copies.

  Canonicalize ASCII spellings in case-insensitive Ada and Fortran vocabularies to reduce compressed bundle bytes.

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
