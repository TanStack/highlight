import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { pathToFileURL } from 'node:url'

const [beforeFile, afterFile] = process.argv.slice(2)
if (!beforeFile || !afterFile) throw new Error('Usage: node scripts/compare-builds.mjs before.mjs after.mjs')
const before = await import(pathToFileURL(path.resolve(beforeFile)))
const after = await import(pathToFileURL(path.resolve(afterFile)))
const docs = JSON.parse(fs.readFileSync('test/generated/tanstack-doc-fixtures.json', 'utf8')).fixtures
const corpora = {
  docs,
  longTypeScript: [{ rawLang: 'ts', code: Array.from({ length: 1000 }, (_, i) => `const value${i} = "value ${i}";`).join('\n') }],
}
const results = []
let sink = 0
for (const [name, fixtures] of Object.entries(corpora)) {
  for (const fixture of fixtures) {
    assert.deepEqual(after.highlight(fixture.code, { lang: fixture.rawLang }), before.highlight(fixture.code, { lang: fixture.rawLang }))
  }
  const runs = Object.entries({ before, after }).map(([name, module]) => ({ name, run() {
    for (const fixture of fixtures) sink += module.highlight(fixture.code, { lang: fixture.rawLang }).html.length
  } }))
  for (const { run } of runs) {
    const start = performance.now()
    do { run() } while (performance.now() - start < 200)
  }
  const samples = { before: [], after: [] }
  for (let round = 0; round < 15; round++) {
    for (let i = 0; i < runs.length; i++) {
      const { name, run } = runs[(round + i) % runs.length]
      const start = performance.now()
      let passes = 0
      do { run(); passes++ } while (performance.now() - start < 30)
      samples[name].push((performance.now() - start) / passes)
    }
  }
  const medians = Object.fromEntries(Object.entries(samples).map(([key, values]) => [key, [...values].sort((a, b) => a - b)[7]]))
  results.push({ name, fixtures: fixtures.length, samplesMs: samples, medianMs: medians, speedup: medians.before / medians.after, timeReductionPercent: 100 * (1 - medians.after / medians.before) })
}
console.log(JSON.stringify({ runtime: process.versions, cpu: os.cpus()[0].model, methodology: 'Same minified browser bundle settings; 200ms warmup; 15 alternating samples with >=30ms batches; source tokens and HTML must match exactly before timing.', results, sink }, null, 2))
