import { brotliCompressSync, gzipSync } from 'node:zlib'
import { build } from 'esbuild'
import { readFileSync } from 'node:fs'

const profiles = {
  core: {
    source: `
      import { createHighlighter } from './src/core.ts'
      globalThis.highlighter = createHighlighter({ languages: [] })
    `,
    limits: { minified: 4_200, gzip: 2_100, brotli: 1_900 },
  },
  rootCore: {
    source: `
      import { createHighlighter } from './src/index.ts'
      globalThis.highlighter = createHighlighter({ languages: [] })
    `,
    limits: { minified: 4_200, gzip: 2_100, brotli: 1_900 },
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
    limits: { minified: 10_400, gzip: 4_450, brotli: 4_100 },
  },
  tsxBarrel: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { tsx } from './src/languages/index.ts'
      globalThis.highlighter = createHighlighter({ languages: [tsx] })
    `,
    languages: ['tsx'],
    limits: { minified: 10_400, gzip: 4_450, brotli: 4_100 },
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
    limits: { minified: 14_200, gzip: 5_800, brotli: 5_350 },
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
    limits: { minified: 16_300, gzip: 6_400, brotli: 5_800 },
  },
  php: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { php } from './src/languages/php.ts'
      globalThis.highlighter = createHighlighter({ languages: [php] })
    `,
    languages: ['php'],
    limits: { minified: 8_200, gzip: 3_800, brotli: 3_500 },
  },
  cpp: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { cpp } from './src/languages/cpp.ts'
      globalThis.highlighter = createHighlighter({ languages: [cpp] })
    `,
    languages: ['cpp'],
    limits: { minified: 6_700, gzip: 3_200, brotli: 3_000 },
  },
  cmake: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { cmake } from './src/languages/cmake.ts'
      globalThis.highlighter = createHighlighter({ languages: [cmake] })
    `,
    languages: ['cmake'],
    limits: { minified: 6_200, gzip: 2_900, brotli: 2_700 },
  },
  csharp: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { csharp } from './src/languages/csharp.ts'
      globalThis.highlighter = createHighlighter({ languages: [csharp] })
    `,
    languages: ['csharp'],
    limits: { minified: 8_150, gzip: 3_850, brotli: 3_550 },
  },
  dart: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { dart } from './src/languages/dart.ts'
      globalThis.highlighter = createHighlighter({ languages: [dart] })
    `,
    languages: ['dart'],
    limits: { minified: 7_200, gzip: 3_350, brotli: 3_100 },
  },
  java: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { java } from './src/languages/java.ts'
      globalThis.highlighter = createHighlighter({ languages: [java] })
    `,
    languages: ['java'],
    limits: { minified: 6_750, gzip: 3_200, brotli: 2_950 },
  },
  kotlin: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { kotlin } from './src/languages/kotlin.ts'
      globalThis.highlighter = createHighlighter({ languages: [kotlin] })
    `,
    languages: ['kotlin'],
    limits: { minified: 7_650, gzip: 3_600, brotli: 3_350 },
  },
  lua: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { lua } from './src/languages/lua.ts'
      globalThis.highlighter = createHighlighter({ languages: [lua] })
    `,
    languages: ['lua'],
    limits: { minified: 5_850, gzip: 2_850, brotli: 2_650 },
  },
  perl: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { perl } from './src/languages/perl.ts'
      globalThis.highlighter = createHighlighter({ languages: [perl] })
    `,
    languages: ['perl'],
    limits: { minified: 8_050, gzip: 3_850, brotli: 3_600 },
  },
  ruby: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { ruby } from './src/languages/ruby.ts'
      globalThis.highlighter = createHighlighter({ languages: [ruby] })
    `,
    languages: ['ruby'],
    limits: { minified: 7_900, gzip: 3_750, brotli: 3_450 },
  },
  rust: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { rust } from './src/languages/rust.ts'
      globalThis.highlighter = createHighlighter({ languages: [rust] })
    `,
    languages: ['rust'],
    limits: { minified: 7_000, gzip: 3_300, brotli: 3_050 },
  },
  swift: {
    source: `
      import { createHighlighter } from './src/core.ts'
      import { swift } from './src/languages/swift.ts'
      globalThis.highlighter = createHighlighter({ languages: [swift] })
    `,
    languages: ['swift'],
    limits: { minified: 7_650, gzip: 3_650, brotli: 3_350 },
  },
  all: {
    source: `
      import { defaultHighlighter } from './src/index.ts'
      globalThis.highlighter = defaultHighlighter
    `,
    languages: 'all',
    limits: { minified: 83_000, gzip: 28_000, brotli: 25_000 },
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

// Each added language has its own budget and must not retain sibling modules.
const additional = JSON.parse(readFileSync('test/generated/additional-language-fixtures.json', 'utf8'))
for (const { name } of additional) {
  profiles[name] = {
    source: `import { createHighlighter } from './src/core.ts'; import { ${name} } from './src/languages/${name}.ts'; globalThis.highlighter = createHighlighter({ languages: [${name}] })`,
    languages: [name],
    limits: { minified: 8_500, gzip: 4_000, brotli: 3_700 },
  }
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
