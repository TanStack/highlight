---
title: Bundle Size and Performance
---

# Bundle Size and Performance

Small and fast are product constraints, not README adjectives. The repository measures multiple selective bundles and real documentation fixtures in CI.

## Bundle profiles

`pnpm run size` builds five browser profiles with esbuild and measures minified, gzip, and Brotli bytes independently.

| Profile | Registered languages | Current gzip | CI budget |
| --- | --- | ---: | ---: |
| Core | None | 1.74 KB | 2.0 KB |
| TSX | TSX | 3.86 KB | 4.1 KB |
| Octane | TypeScript plus Octane MDX adapter | 4.93 KB | 5.2 KB |
| Docs | CSS, HTML, JS, JSON, JSX, Markdown, Shell, TS, TSX | 5.83 KB | 6.1 KB |
| All | All 25 definitions | 7.96 KB | 8.3 KB |

Selective profiles are the primary metric. The all-language profile exists to prevent convenience-entry growth from becoming invisible.

## Runtime corpus

The committed corpus contains 333 real code fences sampled from TanStack documentation, with up to twenty samples per normalized language.

`pnpm run bench` highlights at least 10,000 blocks. CI allows 1.2 seconds on the shared runner; a typical local run is substantially faster.

## Comparison scripts

```sh
pnpm run compare:sugar-high
pnpm run compare:shiki
```

The Sugar High comparison uses only the overlapping JS/TS/JSX/TSX fixtures and measures both bundle and output size. The Shiki comparison uses the full corpus and includes initialization.

## Keep your application small

1. Import `createHighlighter` from `@tanstack/highlight/core`.
2. Import each definition from its direct language subpath.
3. Register only languages found in your content inventory.
4. Import themes from direct theme subpaths.
5. Share one highlighter between server and client modules.
6. Do not import `@tanstack/highlight/languages` unless you want all definitions.

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
