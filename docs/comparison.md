---
title: Comparison
---

# Comparison

Syntax highlighters solve different problems. The smallest correct choice is the one whose architecture matches your output requirements.

## Decision table

| Choose | Best fit | Main tradeoff |
| --- | --- | --- |
| **TanStack Highlight** | Blogs and docs that know their languages, need SSR/client parity, and value small HTML and selective imports | Focused heuristics instead of editor-grade grammars |
| **Sugar High** | The smallest practical JavaScript/TypeScript/JSX experience | Narrower language set and much more generated markup in our fixture comparison |
| **Shiki** | VS Code-like accuracy, TextMate grammars, and broad language/theme compatibility | Much larger runtime and asynchronous setup |
| **highlight.js** | Broad language coverage and optional automatic detection | Larger modular core and detection/parser work not needed by known-language docs |
| **Prism** | Mature grammar ecosystem and plugin integrations | Grammar composition and plugin architecture add more surface than this use case needs |
| **speed-highlight** | Small, modular, class-based highlighting across browser and terminal use cases | Different grammar/output model and fewer docs-specific adapters |
| **Starry Night** | GitHub-like TextMate scopes and very broad grammar coverage | Large grammar/WASM footprint |

## Capability matrix

| Capability | TanStack Highlight | Sugar High | Shiki | highlight.js | Prism |
| --- | :---: | :---: | :---: | :---: | :---: |
| Synchronous highlighting | Yes | Yes | After initialization | Yes | Yes |
| Explicit per-language imports | Yes | Partial | Yes | Yes | Yes |
| Known-language docs focus | Yes | JS/TS focus | No | No | No |
| Class-based token colors | Yes | CSS variables and inline token data | Inline colors by default | Yes | Yes |
| One markup tree for light/dark | Yes | Theme through CSS variables | Dual-theme output supported | Theme CSS | Theme CSS |
| Built-in line decorations | Yes | Line class callback | Transformers | No | Plugins |
| Built-in character-range decorations | Yes | No | Transformers | No | Plugins |
| HTML script/style delegation | Registered languages | No general embedding | Grammar-driven | Grammar-driven | Grammar-driven |
| Markdown fence delegation | Registered languages | No | Grammar-driven | Grammar-driven | Grammar-driven |
| Remark, rehype, and Octane MDX adapters | Yes | No | Ecosystem | Ecosystem | Ecosystem |
| Automatic language detection | No | No | No | Yes | No |
| TextMate/VS Code compatibility | No | No | Yes | No | No |
| Hundreds of languages | No | No | Yes | Yes | Yes |

"Partial" means the package offers separate presets or registrations, but not the same one-definition-per-language import model.

## Measured overlap with Sugar High

The repository compares its installed Sugar High version against the overlapping JavaScript, TypeScript, JSX, and TSX fixture set. Timings are the median of three samples after two warmup passes. Bundle KB uses 1,000 bytes; HTML sizes count UTF-8 bytes.

| | Bundle gzip | 5,040-block runtime | Generated HTML |
| --- | ---: | ---: | ---: |
| TanStack Highlight | 4.11 KB | 78 ms | 6.7 MiB |
| Sugar High 1.2.1 | 3.28 KB | 377 ms | 44.8 MiB |

Sugar High wins raw JavaScript bundle size. TanStack Highlight spends about 830 additional gzip bytes on its registry, class-based output, decorations, and broader context handling, then produces substantially less HTML in this corpus.

## Measured overlap with Shiki

Across 334 committed documentation fixtures:

| | Initialization | Language loading | Warmed highlighting | Generated HTML |
| --- | ---: | ---: | ---: | ---: |
| TanStack Highlight | None | None | 4.6 ms | 365 KiB |
| Shiki 4.3.1 | 22 ms | 47 ms | 182 ms | 1,257 KiB |

The script reports language loading separately and falls back to plaintext for EJS, ENV, and TSRX in Shiki. Timings vary by machine. This is not equivalent work: Shiki provides much deeper grammar accuracy and compatibility. The benchmark describes the cost difference when both are used to render this package's targeted docs corpus.

## When not to use TanStack Highlight

Choose another tool when you need:

- Exact editor or compiler tokenization
- VS Code theme imports
- TextMate grammar compatibility
- Language auto-detection
- Hundreds of languages
- Incremental editor state
- Semantic tokens from a language service

Run `pnpm run compare:sugar-high` and `pnpm run compare:shiki` to reproduce the repository's comparisons.
