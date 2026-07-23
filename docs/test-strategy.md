---
title: Test Strategy
---

# Test Strategy

The suite protects the package's actual product boundary: valid code commonly published in blogs and documentation, with a small browser payload and synchronous client performance.

## Contracts

- Every supported language has committed code from real TanStack Markdown or MDX files.
- The corpus contains up to twenty samples per language and currently totals 333 blocks.
- Every token stream reconstructs its source byte for byte.
- Focused regressions cover context-sensitive failures such as TSX generics, nested template interpolation, regular expressions, Python triple strings, shell heredocs, YAML fragments and block scalars, and markup embeddings.
- HTML uses one escaped `<pre><code>` tree with no inline style attributes.
- Unknown languages fall back to plaintext.
- Remark and rehype produce structured nodes and do not require raw HTML.
- Every public ESM subpath imports directly from the packed package shape.

## Size Profiles

`pnpm run size` builds five browser profiles independently. Each has minified, gzip, and Brotli budgets:

| Profile | Languages | Gzip budget |
| --- | --- | ---: |
| Core | None | 2.0 KB |
| TSX | TSX | 4.1 KB |
| Octane | TypeScript plus Octane MDX adapter | 5.2 KB |
| Docs | CSS, HTML, JS, JSON, JSX, Markdown, Shell, TS, TSX | 6.1 KB |
| All | All 25 definitions | 8.3 KB |

The selective profiles are the primary product metric. The all-language profile protects the convenience entry from unbounded growth.

## Throughput

`pnpm run bench` processes at least 10,000 blocks from the committed real-doc corpus. The 1.2 second CI budget is based on the shared-runner baseline and still catches structural regressions.

`pnpm run compare:sugar-high` compares the overlapping JS/TS/JSX/TSX use case. `pnpm run compare:shiki` compares all supported fixtures. These are directional measurements, not claims of equivalent grammar depth.

## Deliberate Omissions

The package does not maintain compiler conformance suites, malformed-input fuzzing, ReDoS corpora, editor state tests, or exact parity snapshots against another highlighter. Those would optimize for a broader parser product than this library intends to become.
