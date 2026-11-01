---
'@tanstack/highlight': patch
---

Reduce intermediate token-range and regular-expression allocations while preserving highlighting output.

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
