---
title: Bundle Size and Performance
---

# Bundle Size and Performance

CI measures selective browser bundles and highlighting performance on real documentation fixtures.

## Bundle profiles

`pnpm run size` builds 66 browser profiles with esbuild and measures minified, gzip, and Brotli bytes independently. It also checks that helper, adapter, and selective language imports retain only the requested modules.

The current CI limits for the main registration profiles are:

| Profile | Registered languages | Gzip limit |
| --- | --- | ---: |
| Core | None | 2.10 KB |
| TSX | TSX | 4.45 KB |
| Octane | TypeScript plus Octane MDX adapter | 5.80 KB |
| Docs | CSS, HTML, JS, JSON, JSX, Markdown, Shell, TS, TSX | 6.40 KB |
| All | All 79 definitions | 28.00 KB |

KB uses 1,000 bytes. Run `pnpm run size` for current measured sizes and every minified, gzip and Brotli limit.

Selective profiles are the primary metric. The all-language profile exists to prevent convenience-entry growth from becoming invisible.

## Runtime corpus

The committed corpus contains 334 real code fences sampled from TanStack documentation, with up to twenty samples per normalized language.

`pnpm run bench` measures tokenization, HTML, Markdown, HAST, line numbers, long decorated blocks, the 40 additional language fixtures, and dedicated language samples. Each profile reports the median of three samples after two warmup passes, with a 1.2 second CI budget. The main highlighting profile processes at least 10,000 blocks.

Each of the 40 added definitions has a 4 KB gzip budget including core. Every definition is tested through both its direct subpath and a named barrel import, and unrelated language code must be absent from the resulting bundle.

## Rendering tradeoff

HTML highlighting writes strings directly, including decorated and numbered blocks. `renderTokens()` returns structured nodes for custom renderers. Escaping first checks whether the string contains an HTML-sensitive character.

The following figures record the earlier plain-block rendering experiment, before the later scanner and decorated-rendering changes. On an Apple M5 Pro, fifteen alternating samples after warmup measured:

| Workload | Node 24.15.0 time reduction | Bun 1.3.14 time reduction |
| --- | ---: | ---: |
| All 334 docs snippets | 20% | 27% |
| 1,000-line TypeScript block | 29% | 32% |

That comparison used identical tokens and HTML, a 200 ms warmup, and fifteen alternating samples in batches of at least 30 ms. It excluded module initialization and browser layout.

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
