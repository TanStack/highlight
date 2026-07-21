# TanStack Highlight

Tiny, synchronous syntax highlighting for blogs and documentation.

- Import only the languages you use.
- Run the same code during SSR and in the browser.
- Emit one small, class-based HTML tree for every theme.
- Highlight embedded `<script>`, `<style>`, and Markdown fence regions when their languages are registered.
- Decorate lines and character ranges without a transformer framework.

This is not an editor parser or a TextMate engine. It is a deliberately small docs highlighter.

## Documentation

- [Overview](docs/overview.md)
- [Installation](docs/installation.md)
- [Quick Start](docs/quick-start.md)
- [Comparison](docs/comparison.md)
- [Language Support](docs/language-support.md)
- [Guides](docs/guides/language-registration.md)
- [API Reference](docs/reference/index.md)

## Install

```sh
pnpm add @tanstack/highlight
```

## Selective Languages

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, ts, tsx],
})

const result = highlighter.highlight(`const node = <Button />`, {
  lang: 'tsx',
})
```

`html` does not import script or style languages. Registering `js`, `ts`, or `css` enables delegation for matching embedded regions without increasing the standalone HTML module.

For convenience, the root entry contains every shipped language:

```ts
import { highlight } from '@tanstack/highlight'

const result = highlight(`const value = 'docs'`, { lang: 'ts' })
```

Unknown languages fall back to escaped plaintext.

## SSR And Client

Create one highlighter in an isomorphic module and import that module from both rendering paths:

```ts
// highlight.ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, js, ts, tsx],
})
```

The API is synchronous and deterministic. Server output and hydrated client output are identical when they use the same registrations and options.

## Markdown Pipelines

Adapters take an explicit highlighter, so importing one never pulls in the all-language build.

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

const plugin = remarkHighlightCodeBlocks({ highlighter })
```

```ts
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { highlighter } from './highlight'

const plugin = rehypeHighlightCodeBlocks({ highlighter })
```

The remark adapter emits standard HAST data rather than raw HTML. The rehype adapter replaces `<pre><code class="language-*">` nodes and is idempotent.

Fence metadata supports titles, line numbers, and common line annotations:

````md
```tsx title="App.tsx" {2,4-6} ins={8} del={9} error={11} lineNumbers
```
````

Supported annotation names are `highlight`, `ins`, `del`, `focus`, `error`, and `warning`.

## Decorations

Programmatic decorations can target one or more lines or an exact character range:

```ts
const code = `const first = 1\nconst second = 2`
const start = code.indexOf('second')

highlighter.highlight(code, {
  lang: 'ts',
  lineNumbers: true,
  decorations: [
    { lines: 2, className: 'is-focused', data: { kind: 'focus' } },
    { range: [start, start + 6], className: 'is-error' },
  ],
})
```

Overlapping range decorations are split into valid nested spans in declaration order. Decoration data is escaped and emitted as `data-*` attributes.

## Themes

Themes are isolated imports. The root and language entries contain no theme code.

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { draculaTheme } from '@tanstack/highlight/themes/dracula'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const css = createThemeCss({
  light: githubLightTheme,
  dark: draculaTheme,
  darkSelector: '.dark',
})
```

Available themes: Aurora X, Dracula, GitHub Dark, GitHub Light, Monokai, Nord, One Dark Pro, Solarized Dark, and Solarized Light.

## Languages

`apache`, `css`, `diff`, `dockerfile`, `ejs`, `env`, `html`, `http`, `js`, `json`, `jsx`, `markdown`, `mermaid`, `nginx`, `plaintext`, `python`, `scheme`, `shell`, `sql`, `svelte`, `toml`, `ts`, `tsx`, `vue`, and `yaml`.

Each language is available from `@tanstack/highlight/languages/<name>`. `@tanstack/highlight/languages` intentionally aggregates all definitions.

## Output Contract

- One `<pre><code>` tree per block.
- No inline styles or colors.
- Stable `th-*` semantic token classes.
- Source text is preserved exactly by tokenization.
- HTML and decoration attributes are escaped.
- Light/dark switching is CSS-only and does not duplicate markup.

## Size And Speed

Local browser bundles, minified with esbuild and compressed independently:

| Registration | Minified | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| Core, no languages | 3.7 KB | 1.7 KB | 1.6 KB |
| Core + TSX | 9.3 KB | 3.9 KB | 3.5 KB |
| Nine-language docs set | 15.3 KB | 5.8 KB | 5.3 KB |
| All 25 languages | 22.2 KB | 8.0 KB | 7.2 KB |

On 80 real JavaScript/TypeScript/JSX/TSX TanStack docs fixtures repeated across 5,040 blocks:

| | Bundle gzip | Highlight time | Generated HTML |
| --- | ---: | ---: | ---: |
| TanStack Highlight | 3.93 KB | 162 ms | 6.7 MiB |
| Sugar High 1.2.1 | 3.28 KB | 395 ms | 44.7 MiB |

On all 333 committed docs fixtures, TanStack Highlight took 19 ms. Shiki 4.3.1 took 23 ms to initialize and 1,253 ms to highlight, while producing 3.4x more HTML. These are local directional measurements, not claims of equivalent grammar depth.

Reproduce them with:

```sh
pnpm run size
pnpm run bench
pnpm run compare:sugar-high
pnpm run compare:shiki
```

## Non-Goals

- Automatic language detection
- Editor or incremental parsing
- Semantic language-service tokens
- TextMate or VS Code theme compatibility
- Hundreds of languages
- Exact parity with language compilers or IDEs

The quality bar is common, valid code found in blogs and documentation. Every parser fix should add a focused regression fixture without turning the package into a general grammar runtime.

## Development

```sh
pnpm install
pnpm run verify
```

`verify` checks types, package exports, publint, 333 real docs fixtures, focused parser regressions, bundle budgets, and a roughly 10,000-block throughput budget.
