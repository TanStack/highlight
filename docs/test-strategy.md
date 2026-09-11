---
title: Test Strategy
---

# Test Strategy

The suite protects the package's actual product boundary: valid code commonly published in blogs and documentation, with a small browser payload and synchronous client performance.

## Contracts

- Every supported language has representative fixtures. Languages available in TanStack Markdown or MDX files also have committed samples from those docs.
- The corpus contains up to twenty samples per language and currently totals 334 blocks.
- Every token stream reconstructs its source byte for byte.
- Focused regressions cover context-sensitive failures such as TSX generics, nested template interpolation, regular expressions, Python triple strings, shell heredocs, YAML fragments and block scalars, and markup embeddings.
- HTML uses one escaped `<pre><code>` tree with no inline style attributes.
- Unknown languages fall back to plaintext.
- Remark and rehype produce structured nodes and do not require raw HTML.
- Every public ESM subpath imports directly from the packed package shape.

## Size Profiles

`pnpm run size` checks seventeen independent browser profiles, including root helpers, language barrel imports, adapters, and themes. Each has minified, gzip, and Brotli budgets. The main highlighter profiles are:

| Profile | Languages | Gzip budget |
| --- | --- | ---: |
| Core | None | 2.0 KB |
| TSX | TSX | 4.1 KB |
| Octane | TypeScript plus Octane MDX adapter | 5.5 KB |
| Docs | CSS, HTML, JS, JSON, JSX, Markdown, Shell, TS, TSX | 6.1 KB |
| All | All 30 definitions | 10.8 KB |

The selective profiles are the primary product metric. The all-language profile protects the convenience entry from unbounded growth. Bundle graphs reject unexpected language or theme code. Package tests repeat isolation checks through public exports after building.

## Throughput

`pnpm run bench` measures highlighting, tokenization, Markdown, HAST, line numbers, long numbered blocks, long decorated blocks, and dedicated C++, CMake, and PHP samples. Timings use the median of three samples after two warmup passes. Each profile has a 1.2 second CI budget; the main highlighting profile processes at least 10,000 blocks.

`pnpm run compare:sugar-high` compares the overlapping JS/TS/JSX/TSX use case. `pnpm run compare:shiki` compares all supported fixtures. These are directional measurements, not claims of equivalent grammar depth.

## Deliberate Omissions

The package does not maintain compiler conformance suites, malformed-input fuzzing, ReDoS corpora, editor state tests, or exact parity snapshots against another highlighter. Those would optimize for a broader parser product than this library intends to become.
