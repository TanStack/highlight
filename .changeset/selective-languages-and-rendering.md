---
'@tanstack/highlight': minor
---

Add 40 independently importable language definitions, bringing the built-in registry to 79 including plaintext. Named language-barrel imports and direct language subpaths are checked for tree shaking. New definitions provide lightweight lexical coverage using shared scanning helpers and vendored Highlight.js vocabularies, without adding runtime dependencies. The full registry grows; existing selective language imports do not retain the new definitions.

Serialize ordinary HTML blocks directly and avoid replacement work for text that needs no HTML escaping. Keep token output and decorated rendering unchanged. Measured local docs highlighting takes 20% less time in Node and 27% less in Bun for 73 additional gzip bytes in core.

Preserve all existing language names and aliases, including `cmd` for `shell`. The new Windows Batch definition uses `batch`, `bat`, and `dos`.
