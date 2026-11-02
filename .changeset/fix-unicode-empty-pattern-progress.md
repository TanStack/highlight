---
"@tanstack/highlight": patch
---

Advance Unicode tokenizer cursors by a full code point when skipping an empty match, so Node does not repeat matches inside a surrogate pair.
