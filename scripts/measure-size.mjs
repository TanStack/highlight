import { brotliCompressSync, gzipSync } from 'node:zlib'
import { build } from 'esbuild'

const profiles = {
  core: {
    source: `
      import { createHighlighter } from './src/core.ts'
      globalThis.highlighter = createHighlighter({ languages: [] })
    `,
    limits: { minified: 4_000, gzip: 2_000, brotli: 1_800 },
  },
  tsx: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { tsx } from './src/languages/tsx.ts'
      globalThis.highlighter = createHighlighter({ languages: [tsx] })
    `,
    limits: { minified: 9_800, gzip: 4_100, brotli: 3_750 },
  },
  octane: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { ts } from './src/languages/ts.ts'
      import { createOctaneMdxHighlight } from './src/octane.ts'
      const highlighter = createHighlighter({ languages: [ts] })
      globalThis.highlighter = highlighter
      globalThis.octaneHighlight = createOctaneMdxHighlight({ highlighter })
    `,
    limits: { minified: 13_000, gzip: 5_200, brotli: 4_750 },
  },
  docs: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { css } from './src/languages/css.ts'
      import { html } from './src/languages/html.ts'
      import { js } from './src/languages/js.ts'
      import { json } from './src/languages/json.ts'
      import { jsx } from './src/languages/jsx.ts'
      import { markdown } from './src/languages/markdown.ts'
      import { shell } from './src/languages/shell.ts'
      import { ts } from './src/languages/ts.ts'
      import { tsx } from './src/languages/tsx.ts'
      globalThis.highlighter = createHighlighter({
        languages: [css, html, js, json, jsx, markdown, shell, ts, tsx],
      })
    `,
    limits: { minified: 16_000, gzip: 6_100, brotli: 5_550 },
  },
  all: {
    source: `
      import { defaultHighlighter } from './src/index.ts'
      globalThis.highlighter = defaultHighlighter
    `,
    limits: { minified: 23_000, gzip: 8_300, brotli: 7_500 },
  },
}

const sizes = {}
let failed = false

for (const [name, profile] of Object.entries(profiles)) {
  const result = await build({
    stdin: {
      contents: profile.source,
      loader: 'ts',
      resolveDir: process.cwd(),
    },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].contents
  const measured = {
    minified: code.length,
    gzip: gzipSync(code).length,
    brotli: brotliCompressSync(code).length,
    limits: profile.limits,
  }
  sizes[name] = measured

  if (
    measured.minified > profile.limits.minified ||
    measured.gzip > profile.limits.gzip ||
    measured.brotli > profile.limits.brotli
  ) {
    failed = true
  }
}

console.log(JSON.stringify(sizes, null, 2))
if (failed) process.exitCode = 1
