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
  rootCore: {
    source: `
      import { createHighlighter } from './src/index.ts'
      globalThis.highlighter = createHighlighter({ languages: [] })
    `,
    limits: { minified: 4_000, gzip: 2_000, brotli: 1_800 },
  },
  rootEscape: {
    source: `
      export { escapeHtml } from './src/index.ts'
    `,
    limits: { minified: 300, gzip: 220, brotli: 180 },
  },
  tsx: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { tsx } from './src/languages/tsx.ts'
      globalThis.highlighter = createHighlighter({ languages: [tsx] })
    `,
    languages: ['tsx'],
    limits: { minified: 9_800, gzip: 4_100, brotli: 3_750 },
  },
  tsxBarrel: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { tsx } from './src/languages/index.ts'
      globalThis.highlighter = createHighlighter({ languages: [tsx] })
    `,
    languages: ['tsx'],
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
    languages: ['ts'],
    limits: { minified: 13_500, gzip: 5_500, brotli: 5_000 },
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
    languages: ['css', 'html', 'js', 'json', 'jsx', 'markdown', 'shell', 'ts', 'tsx'],
    limits: { minified: 16_000, gzip: 6_100, brotli: 5_550 },
  },
  cpp: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { cpp } from './src/languages/cpp.ts'
      globalThis.highlighter = createHighlighter({ languages: [cpp] })
    `,
    languages: ['cpp'],
    limits: { minified: 6_500, gzip: 3_100, brotli: 2_900 },
  },
  cmake: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { cmake } from './src/languages/cmake.ts'
      globalThis.highlighter = createHighlighter({ languages: [cmake] })
    `,
    languages: ['cmake'],
    limits: { minified: 6_000, gzip: 2_800, brotli: 2_600 },
  },
  all: {
    source: `
      import { defaultHighlighter } from './src/index.ts'
      globalThis.highlighter = defaultHighlighter
    `,
    languages: 'all',
    limits: { minified: 27_000, gzip: 9_800, brotli: 8_900 },
  },
  reactAdapter: {
    source: `export * from './src/react.ts'`,
    limits: { minified: 300, gzip: 200, brotli: 160 },
  },
  markdownAdapter: {
    source: `export * from './src/markdown.ts'`,
    limits: { minified: 5_800, gzip: 2_500, brotli: 2_300 },
  },
  remarkAdapter: {
    source: `export * from './src/remark.ts'`,
    limits: { minified: 5_600, gzip: 2_400, brotli: 2_200 },
  },
  rehypeAdapter: {
    source: `export * from './src/rehype.ts'`,
    limits: { minified: 5_700, gzip: 2_450, brotli: 2_250 },
  },
  octaneAdapter: {
    source: `export * from './src/octane.ts'`,
    limits: { minified: 6_000, gzip: 2_550, brotli: 2_350 },
  },
  theme: {
    source: `export * from './src/theme.ts'`,
    limits: { minified: 1_500, gzip: 750, brotli: 650 },
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
    metafile: true,
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

  for (const [format, limit] of Object.entries(profile.limits)) {
    if (measured[format] > limit) {
      console.error(`${name}: ${format} is ${measured[format]} bytes, over the ${limit}-byte budget`)
      failed = true
    }
  }

  // Inspect retained code, since a barrel can resolve modules that are later removed.
  for (const output of Object.values(result.metafile.outputs)) {
    for (const [input, { bytesInOutput }] of Object.entries(output.inputs)) {
      if (!bytesInOutput) continue
      const language = /^src\/languages\/([^/]+)\.ts$/.exec(input)?.[1]
      if (language && profile.languages !== 'all' && !(profile.languages || []).includes(language)) {
        console.error(`${name}: unexpected language retained in bundle: ${language}`)
        failed = true
      }
      if (input.startsWith('src/themes/') || (name !== 'theme' && input === 'src/theme.ts')) {
        console.error(`${name}: unexpected theme code retained in bundle: ${input}`)
        failed = true
      }
    }
  }
}

console.log(JSON.stringify(sizes, null, 2))
if (failed) process.exitCode = 1
