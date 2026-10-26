# Language coverage and browser cost

Added 40 lexical language definitions, for 79 total including plaintext. Each definition is available from its own subpath and as a named export from the language barrel. Existing selective imports retain none of the new definitions or their shared scanner. The convenience root helpers still register all languages, so that bundle grows.

## Bundle cost

Minified browser ESM with esbuild, default gzip. Values are bytes, and include core:

| Import | Before gzip | After gzip | Change |
| --- | ---: | ---: | ---: |
| Core | 1820 | 1893 | 73 |
| TSX only | 4322 | 4389 | 67 |
| Nine-language docs set | 6240 | 6310 | 70 |
| All languages | 17726 | 27753 | 10027 |

The new language profiles range from 2791 to 3799 gzip bytes including core. Each has a 4,000-byte gzip ceiling. Every language is checked through direct and barrel imports, with the bundle graph required to exclude sibling languages. No runtime dependencies or Wasm were added.

The all-language profile gets a separate 28 KB gzip budget. Core-dependent profiles allow up to 200 additional minified bytes and 100 additional compressed bytes for the rendering improvements. Unchanged helper and adapter budgets remain in place.

## Speed for the bytes

Plain code blocks now serialize tokens directly, avoiding temporary render nodes. Text without HTML-sensitive characters bypasses replacement work. Tokenization results and generated HTML are unchanged. Line numbering and decorations retain the structured rendering path.

| Runtime | Input | Before ms | After ms | Time reduction |
| --- | --- | ---: | ---: | ---: |
| Node | docs | 3.840 | 3.067 | 20.1% |
| Node | longTypeScript | 0.851 | 0.605 | 28.9% |
| Bun | docs | 6.550 | 4.753 | 27.4% |
| Bun | longTypeScript | 1.685 | 1.138 | 32.4% |

Apple M5 Pro, Node 24.15.0 and Bun 1.3.14. Each docs pass processes all 334 committed snippets; the long TypeScript case contains 1,000 generated lines. Same minified bundle settings, 200 ms warmup per contender, fifteen alternating samples with at least 30 ms per batch, median per-pass times. The harness asserts identical full results before timing. These are local warm-runtime measurements, excluding startup and browser rendering.

Raw samples: [Node](node.json), [Bun](bun.json). Bundle measurements: [before](before-size.json), [after](size.json).

## Language scope

New definitions: ada, applescript, awk, batch, c, clojure, coffeescript, crystal, d, elixir, elm, erlang, fortran, fsharp, glsl, graphql, groovy, haskell, ini, julia, latex, less, lisp, makefile, matlab, nix, objectivec, ocaml, pascal, powershell, properties, protobuf, r, scala, scss, vbnet, verilog, vhdl, wat, x86asm.

Vocabulary lists were adapted from Highlight.js 11.11.1 under its BSD 3-Clause license. [NOTICE.md](../../NOTICE.md) ships in the package. The Highlight.js runtime and full grammar system are not imported.

These definitions highlight common comments, strings, declarations, keywords, and other language-specific lexical forms. Nested comments are handled where configured. Expressions inside strings are not parsed separately. Advanced sigils, most heredocs and regex contexts, macro bodies, and embedded languages need additional work before being advertised as supported. The [language matrix](../../docs/language-support.md) records the boundary. Existing deeper scanners remain intact.

The existing `cmd` alias remains mapped to `shell`. The new Windows Batch definition uses `batch`, `bat`, and `dos`.

## Verification and reproduction

The suite covers representative source and expected token kinds for all 40 additions, aliases, truncated and Unicode input, lexical edge cases, deep comment nesting, and HTML escaping. All docs snippets are compared against render-tree serialization. Package checks inspect both direct and barrel bundles for every language, and the packed package is tested against bounded hostile input.

Verified: 304 tests, type checking, build, documentation and skill validation, package lint, 166 public import bundle checks, packed-package runtime checks, all 66 size profiles, and all 20 benchmark profiles.

Run from the repository:

```sh
npm run typecheck
npm run build
npm test
npm run test:docs
npm run test:package
npm run test:packed
npm run size
npm run bench
```

To reproduce the timing comparison, build the pre-change source revision `0541f2fdc7f96fb6245c82c739f0d816afdb670a` and the current source using esbuild with `bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022'`. Export the root module plus `codeFenceToHast` and `createTanStackMarkdownHighlighter` from `src/markdown.ts` in each bundle. Then run:

```sh
node scripts/compare-builds.mjs /path/to/before.mjs /path/to/after.mjs
bun scripts/compare-builds.mjs /path/to/before.mjs /path/to/after.mjs
```

The core change deliberately stays small. A Wasm engine, general grammar interpreter, output cache, or duplicated tokenization path would add costs that these results do not justify.
