---
'@tanstack/highlight': patch
---

Ignore non-integer character-range offsets (NaN, infinities, and fractions), plus empty or reversed ranges, so rendering preserves source text and valid annotations. Preserve arbitrary line-decoration data keys.
