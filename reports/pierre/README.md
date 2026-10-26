# Pierre Highlights vs TanStack Highlight

Measured October 25, 2026, America/Denver, on an Apple M5 Pro. Pierre 0.2.0, TanStack 1.1.0, Shiki 4.3.1. Node 24.15.0 and Bun 1.3.14.

Pierre's speed advantage is real in these tests. On 289 shared TanStack documentation snippets, Pierre was **10.1× faster in Node** and **16.9× faster in Bun** with one theme. With light and dark themes, those advantages were **5.7×** and **10.3×**.

TanStack's advantages here are smaller browser code and less generated HTML. The accuracy probes did not establish an overall winner.

## Direct measurements

Times are milliseconds per complete corpus pass, lower is better. The docs row processes 289 snippets, totaling 103,833 input bytes. Each other row processes one file. “Single” uses GitHub Dark, “dual” uses GitHub Light and GitHub Dark. TanStack emits the same CSS classes in both modes.

### Node

| Input | Themes | TanStack ms | Pierre ms | Shiki ms | Pierre vs TanStack |
| --- | --- | ---: | ---: | ---: | ---: |
| tanstack-docs-shared | single | 4.873 | 0.482 | 97.465 | 10.1× |
| large.css | single | 15.930 | 1.507 | 346.578 | 10.6× |
| large.html | single | 9.245 | 1.069 | 175.546 | 8.7× |
| large.jsonc | single | 4.829 | 0.431 | 52.524 | 11.2× |
| large.ts | single | 16.059 | 1.822 | 540.589 | 8.8× |
| tanstack-docs-shared | dual | 4.165 | 0.734 | 172.318 | 5.7× |
| large.css | dual | 15.893 | 1.861 | 653.470 | 8.5× |
| large.html | dual | 8.613 | 1.458 | 322.925 | 5.9× |
| large.jsonc | dual | 4.792 | 0.617 | 96.014 | 7.8× |
| large.ts | dual | 16.774 | 2.256 | 1065.633 | 7.4× |

### Bun

| Input | Themes | TanStack ms | Pierre ms | Shiki ms | Pierre vs TanStack |
| --- | --- | ---: | ---: | ---: | ---: |
| tanstack-docs-shared | single | 7.062 | 0.417 | 89.289 | 16.9× |
| large.css | single | 14.374 | 1.250 | 285.366 | 11.5× |
| large.html | single | 10.904 | 0.684 | 157.241 | 15.9× |
| large.jsonc | single | 6.177 | 0.321 | 45.608 | 19.3× |
| large.ts | single | 32.359 | 1.573 | 448.280 | 20.6× |
| tanstack-docs-shared | dual | 6.399 | 0.624 | 154.531 | 10.3× |
| large.css | dual | 14.930 | 1.504 | 555.979 | 9.9× |
| large.html | dual | 11.215 | 0.945 | 301.485 | 11.9× |
| large.jsonc | dual | 6.638 | 0.397 | 89.010 | 16.7× |
| large.ts | dual | 33.239 | 1.903 | 907.940 | 17.5× |

The Node large-TypeScript case puts Pierre at about **297× Shiki**, close to its headline claim. Dividing two independently published Shiki ratios is still not a direct comparison, but the direct results support a substantial speed advantage.

## What the comparison includes

- Same JavaScript string inputs, complete HTML string outputs. Pierre's UTF-8 encoding and HTML decoding are inside the timer.
- Initialization and language loading excluded. No browser layout, painting, cold-start, streaming, incremental-edit, or memory benchmark.
- 200 ms warmup per implementation and case, followed by nine samples in rotating implementation order. Each sample batches complete passes for at least 20 ms. Reported times are medians of per-pass averages.
- Shiki's line-length and tokenization-time cutoffs disabled. No fallback languages in the timing corpus. 45 of the 334 docs snippets are excluded because at least one competitor lacks support: Apache, EJS, ENV, HTTP, Mermaid, Nginx, TSRX.
- All 12 Pierre tiny/small/large CSS, HTML, JSONC, and TypeScript fixtures tested. Full samples, input hashes, versions, and revisions are in [node.json](./node.json) and [bun.json](./bun.json).
- These are the normal public APIs. TanStack also creates and returns semantic token objects while generating HTML. Pierre can emit HTML directly. Matching the requested HTML result does not mean matching internal work, token detail, or exact styles.
- One local run per runtime, using an ordinary desktop session. Runtime differences and garbage collection affect the ratios. This is not a reproduction of Pierre's published Bun 1.4.0 / Shiki 4.4.1 setup.

## Implementation

Pierre uses handwritten WAT lexers, contextual state, SIMD scans that inspect 16 bytes at a time, and a direct HTML emitter. Adjacent output with the same style is merged. Its [architecture documentation](https://github.com/pierrecomputer/pierre/blob/2f47ca269a849b98aa479cc68515972e202f08a2/packages/highlights/ARCHITECTURE.md) explicitly says it emits output without a syntax tree.

TanStack's HTML path builds token ranges, normalizes them, creates token strings, builds render nodes, then serializes HTML. Those intermediate allocations are a plausible optimization target, but this review did not profile how much time each stage contributes. A dedicated direct HTML path is worth investigating before considering an engine rewrite. The existing API also promises tokens, so an HTML-only path would need to preserve that distinction.

## Size and language coverage

Measured browser ESM bundles with esbuild minification and default gzip, decimal KB:

| Bundle | Minified | Gzip |
| --- | ---: | ---: |
| TanStack, TSX only | 10.17 KB | 4.33 KB |
| TanStack, all languages | 52.78 KB | 17.74 KB |
| Pierre HTML API, embedded Wasm, GitHub Dark | 265.76 KB | 115.99 KB |

TanStack's external theme CSS is excluded. Pierre includes its theme, so these show actual selected JavaScript bundle costs, not identical feature sets.

For the shared docs corpus, TanStack emits **343 KiB** of HTML. Pierre emits **597 KiB** with one theme or **862 KiB** with two, about 1.7× and 2.5× as much. These are uncompressed bytes, not measured network transfer costs.

The installed Pierre package has **80 language IDs plus plaintext**. TanStack registers **38 languages plus plaintext**. Some dialects share implementations. Pierre supports more languages overall, but lacks TanStack's Apache, EJS, ENV, HTTP, Mermaid, and Nginx registrations.

## Accuracy checks

Both libraries pass 13 of 14 small diagnostic checks, covering property names, regex/division, templates, nested comments, raw strings, heredocs, embedded HTML, generics, and JSX. Both classify the expression inside Python's `f"Hello {user.name.upper()}"` as string content instead of highlighting the method call.

These deliberately selected probes are not a representative accuracy score. Matching a palette or matching Shiki would not itself prove correctness. A broader, independently labeled corpus is needed to assess the “higher accuracy” claim.

Both also preserve source text through HTML generation across 303 cases: 290 supported docs snippets, all 12 Pierre fixtures, and a Unicode/CRLF sample. This checks text preservation, not token correctness or rendered browser behavior. Details and bundle measurements are in [probes.json](./probes.json).

## Reproduce

From this repository, with dependencies installed:

```sh
npm run build
npm install --prefix /tmp/highlight-direct-bench --ignore-scripts --no-audit --no-fund @pierre/highlights@0.2.0
git clone https://github.com/pierrecomputer/pierre.git /tmp/highlight-pierre-review
git -C /tmp/highlight-pierre-review checkout 2f47ca269a849b98aa479cc68515972e202f08a2
node scripts/compare-pierre.mjs /tmp/highlight-direct-bench/node_modules/@pierre/highlights /tmp/highlight-pierre-review > reports/pierre/node.json
bun scripts/compare-pierre.mjs /tmp/highlight-direct-bench/node_modules/@pierre/highlights /tmp/highlight-pierre-review > reports/pierre/bun.json
node scripts/probe-pierre.mjs /tmp/highlight-direct-bench/node_modules/@pierre/highlights /tmp/highlight-pierre-review > reports/pierre/probes.json
```

The upstream checkout uses Git LFS for some assets, so install Git LFS if needed. The benchmark rejects fixture pointer files. TanStack source revision: `0541f2fdc7f96fb6245c82c739f0d816afdb670a`. Scripts and results were added locally without changing the library implementation or dependencies.

Pierre npm tarball integrity: `sha512-hTpcOU1EzDAP4bYtEhxmMu2jwMvtkUydRUBUpWMSHTs3dw0IaC3Ld5ansMy18L0GE3b6Vfl2OGkLK+pWWpnBmw==`.
