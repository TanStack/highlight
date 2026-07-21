import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const maxElapsedMs = 1_200
const targetBlocks = 10_000
const fixtureFile = 'test/generated/tanstack-doc-fixtures.json'
const bundleFile = path.join(os.tmpdir(), `tanstack-highlight-bench-${process.pid}.mjs`)

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  outfile: bundleFile,
  logLevel: 'silent',
})

const { highlight } = await import(`${pathToFileURL(bundleFile).href}?v=${Date.now()}`)
const fixtureData = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'))
const fixtures = fixtureData.fixtures
const iterations = Math.ceil(targetBlocks / fixtures.length)

let htmlBytes = 0
const start = performance.now()

for (let index = 0; index < iterations; index++) {
  for (const fixture of fixtures) {
    htmlBytes += highlight(fixture.code, { lang: fixture.rawLang }).html.length
  }
}

const elapsedMs = performance.now() - start
const result = {
  fixtures: fixtures.length,
  iterations,
  blocks: fixtures.length * iterations,
  elapsedMs: Number(elapsedMs.toFixed(2)),
  blocksPerMs: Number(((fixtures.length * iterations) / elapsedMs).toFixed(2)),
  htmlKiB: Math.round(htmlBytes / 1024),
  maxElapsedMs,
  targetBlocks,
}

console.log(JSON.stringify(result, null, 2))
fs.rmSync(bundleFile, { force: true })

if (elapsedMs > maxElapsedMs) {
  process.exitCode = 1
}
