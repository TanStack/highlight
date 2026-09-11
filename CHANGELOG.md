# @tanstack/highlight

## 0.1.0

### Minor Changes

- 6f0dd9c: Add isolated C++ and CMake language definitions with contextual strings and comments, C++ aliases and numeric literals, and CMake variables and generator expressions. Core and unrelated selective bundles are unchanged.
- Add an isolated Go language definition with the `golang` alias and isolated Gruvbox Dark and Light themes. Existing selective language bundles and the core are unchanged.
- 9ffa69e: Add an isolated PHP language definition with PHP tags, attributes, strings, heredoc/nowdoc, and optional HTML delegation. Core and unrelated selective bundles are unchanged.

## 0.0.11

### Patch Changes

- a1a39c2: Speed up highlighting and numbered blocks, avoid unused HTML rendering in Markdown adapters, and let root helper imports remove unused language code. Reduce the theme helper's size and fix embedded language scanning, captured token offsets, template regex literals, Windows diff annotations, and fence metadata. Preserve existing attributes and plugin data in Rehype output.
