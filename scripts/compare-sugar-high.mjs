import fs from 'node:fs'
import { performance } from 'node:perf_hooks'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { build } from 'esbuild'
import { highlight as sugarHighlight } from 'sugar-high'
import { createHighlighter } from '../dist/core.js'
import { js } from '../dist/languages/js.js'
import { jsx } from '../dist/languages/jsx.js'
import { ts } from '../dist/languages/ts.js'
import { tsx } from '../dist/languages/tsx.js'

const allFixtures = JSON.parse(
  fs.readFileSync('test/generated/tanstack-doc-fixtures.json', 'utf8'),
).fixtures
const fixtures = allFixtures.filter((fixture) =>
  ['js', 'jsx', 'ts', 'tsx'].includes(fixture.lang),
)
const highlighter = createHighlighter({ languages: [js, jsx, ts, tsx] })
const iterations = Math.ceil(5_000 / fixtures.length)

const ours = measure((fixture) =>
  highlighter.highlight(fixture.code, { lang: fixture.lang }).html,
)
const sugar = measure((fixture) => sugarHighlight(fixture.code))

const oursBundle = await measureBundle(`
  import { createHighlighter } from './src/core.ts'
  import { js } from './src/languages/js.ts'
  import { jsx } from './src/languages/jsx.ts'
  import { ts } from './src/languages/ts.ts'
  import { tsx } from './src/languages/tsx.ts'
  globalThis.highlighter = createHighlighter({ languages: [js, jsx, ts, tsx] })
`)
const sugarBundle = await measureBundle(`
  import { highlight } from 'sugar-high'
  globalThis.highlight = highlight
`)

console.log(
  JSON.stringify(
    {
      fixtures: fixtures.length,
      iterations,
      blocks: fixtures.length * iterations,
      runtime: { ours, sugarHigh: sugar },
      bundle: { ours: oursBundle, sugarHigh: sugarBundle },
    },
    null,
    2,
  ),
)

function measure(highlight) {
  let htmlBytes = 0
  const start = performance.now()
  for (let iteration = 0; iteration < iterations; iteration++) {
    for (const fixture of fixtures) htmlBytes += highlight(fixture).length
  }
  return {
    elapsedMs: Number((performance.now() - start).toFixed(2)),
    htmlKiB: Math.round(htmlBytes / 1024),
  }
}

async function measureBundle(contents) {
  const result = await build({
    stdin: { contents, loader: 'ts', resolveDir: process.cwd() },
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].contents
  return {
    minified: code.length,
    gzip: gzipSync(code).length,
    brotli: brotliCompressSync(code).length,
  }
}
