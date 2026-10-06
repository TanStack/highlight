---
title: Bundle Size and Performance
---

# Bundle Size and Performance

CI measures selective browser bundles and highlighting performance on real documentation fixtures.

## Bundle profiles

`pnpm run size` builds nineteen browser profiles with esbuild and measures minified, gzip, and Brotli bytes independently. It also checks that helper, adapter, and selective language imports retain only the requested modules.

| Profile | Registered languages | Current gzip | CI budget |
| --- | --- | ---: | ---: |
| Core | None | 1.82 KB | 2.0 KB |
| TSX | TSX | 4.29 KB | 4.35 KB |
| Octane | TypeScript plus Octane MDX adapter | 5.62 KB | 5.7 KB |
| Docs | CSS, HTML, JS, JSON, JSX, Markdown, Shell, TS, TSX | 6.22 KB | 6.3 KB |
| Swift | Swift | 3.38 KB | 3.55 KB |
| PowerShell | PowerShell | 3.27 KB | 3.55 KB |
| All | All 32 definitions | 12.45 KB | 12.7 KB |

KB uses 1,000 bytes. Core helpers imported from the root tree-shake to the same engine size. The standalone theme helper is 691 gzip bytes.

Adding Swift and PowerShell raises the all-language gzip bundle from 10.77 KB to 12.45 KB. Their isolated bundles are 3.38 KB and 3.27 KB gzip including core; existing selective budgets are unchanged.

Selective profiles are the primary metric. The all-language profile exists to prevent convenience-entry growth from becoming invisible.

## Runtime corpus

The committed corpus contains 334 real code fences sampled from TanStack documentation, with up to twenty samples per normalized language.

`pnpm run bench` measures tokenization, HTML, Markdown, HAST, line numbers, long decorated blocks, and dedicated C++, CMake, PHP, Swift, and PowerShell samples. Each profile reports the median of three samples after two warmup passes, with a 1.2 second CI budget. The main highlighting profile processes at least 10,000 blocks.

A local before-and-after review used the same minified bundle settings, fixtures, and benchmark harness on macOS arm64 with Node 24.15.0:

| Workload | Blocks | Before | After |
| --- | ---: | ---: | ---: |
| Highlight | 10,020 | 229 ms | 118 ms |
| TanStack Markdown | 10,020 | 244 ms | 111 ms |
| HAST | 5,010 | 148 ms | 40 ms |
| 1,000-line numbered blocks | 50 | 358 ms | 68 ms |
| 1,000-line decorated blocks | 50 | 426 ms | 150 ms |

Generated HTML byte totals were unchanged. The core avoids rescanning earlier tokens for each line, and HAST adapters skip HTML serialization. Highlighter bundles grew by 41 to 173 gzip bytes across the five profiles, while root helper imports and theme CSS generation became smaller. The Octane gzip budget increased from 5.2 KB to 5.5 KB to accommodate correct fence metadata and attribute preservation.

## Comparison scripts

```sh
pnpm run compare:sugar-high
pnpm run compare:shiki
```

The Sugar High comparison uses only the overlapping JS/TS/JSX/TSX fixtures and measures both bundle and UTF-8 output size. The Shiki comparison uses the full corpus and reports initialization, language loading, and warmed highlighting separately.

## Keep your application small

1. Import `createHighlighter` from `@tanstack/highlight/core`.
2. Import each definition from its direct language subpath.
3. Register only languages found in your content inventory.
4. Import themes from direct theme subpaths.
5. Share one highlighter between server and client modules.
6. Named imports from `@tanstack/highlight/languages` can tree-shake too. Importing core helpers from the root entry also removes unused built-in languages in a compatible bundler.

## HTML size matters

The JavaScript bundle is only part of a documentation page's transfer and parse cost. Token wrappers and duplicated light/dark markup can outweigh a small library difference across dozens of code blocks.

TanStack Highlight omits line wrappers unless required, uses short semantic classes, and never emits one code tree per theme.

## Adding behavior

Context-aware fixes are welcome when they solve common docs code. A change should be evaluated against:

- Correctness fixture
- Core and affected-language bundle profile
- Full docs profile
- 10,000-block runtime
- Generated HTML size when output structure changes

The correct response to a crossed budget is to inspect the behavior and architecture. Budgets can move when a measured quality improvement justifies the bytes, but the tradeoff must be explicit.

The 1.0 property-context correction adds roughly 230 gzip bytes to the TSX profile without changing core. Current local Node 26.10.0 measurements are 6,220 gzip bytes for the docs profile and 12,449 bytes for all languages. Their CI budgets are 6,300 and 12,700 bytes respectively, retaining a small explicit margin. CI measurements may differ slightly with the compression runtime.
