import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createHighlighter, bundledLanguages } from 'shiki'
import { highlight } from '../dist/index.js'

// npm run build
// node scripts/compare-pierre.mjs /path/to/node_modules/@pierre/highlights /path/to/pierre
const [packageRoot, sourceRoot] = process.argv.slice(2)
if (!packageRoot || !sourceRoot) throw new Error('Pass the installed Pierre package directory and its source checkout directory')
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))
const pierre = await import(pathToFileURL(path.resolve(packageRoot, 'dist/default.js')))
const { githubDark, githubLight } = await import(pathToFileURL(path.resolve(packageRoot, 'dist/themes.js')))
const decoder = new TextDecoder()
const aliases = { js: 'javascript', ts: 'typescript', shell: 'bash', env: 'dotenv', plaintext: 'text' }
const docs = readJson(new URL('../test/generated/tanstack-doc-fixtures.json', import.meta.url)).fixtures
const excluded = []
const shared = docs.filter((f) => {
  const lang = aliases[f.lang] || f.lang
  const supported = pierre.isSupportedLanguage(lang) && (lang === 'text' || lang in bundledLanguages)
  if (!supported) excluded.push({ lang: f.lang, file: f.file, line: f.line })
  return supported
}).map((f) => ({ ...f, sourceLang: aliases[f.lang] || f.lang }))
const cases = [{ name: 'tanstack-docs-shared', fixtures: shared }]
for (const size of ['tiny', 'small', 'large']) {
  for (const lang of ['css', 'html', 'jsonc', 'ts']) {
    const filename = `${size}.${lang}.txt`
    const code = fs.readFileSync(path.join(sourceRoot, 'packages/highlights/benchmark/fixtures', filename), 'utf8')
    if (code.startsWith('version https://git-lfs')) throw new Error(`Missing LFS fixture: ${filename}`)
    cases.push({ name: `pierre-${filename}`, fixtures: [{ code, lang, sourceLang: aliases[lang] || lang }] })
  }
}
const shiki = await createHighlighter({ themes: ['github-dark', 'github-light'], langs: [...new Set(cases.flatMap((c) => c.fixtures.map((f) => f.sourceLang)).filter((l) => l !== 'text'))] })
let sink = 0
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const results = []
for (const mode of ['single', 'dual']) {
  const runs = {
    tanstack: (f) => highlight(f.code, { lang: f.lang }).html,
    pierre: (f) => decoder.decode(pierre.codeToHtml(f.code, { lang: f.sourceLang, ...(mode === 'single' ? { theme: githubDark } : { themes: { light: githubLight, dark: githubDark } }) })),
    shiki: (f) => shiki.codeToHtml(f.code, { lang: f.sourceLang, ...(mode === 'single' ? { theme: 'github-dark' } : { themes: { light: 'github-light', dark: 'github-dark' } }), tokenizeMaxLineLength: 0, tokenizeTimeLimit: 0 }),
  }
  for (const c of cases) {
    const stats = {}
    const batch = (fn) => { for (const f of c.fixtures) sink += fn(f).length }
    for (const [name, fn] of Object.entries(runs)) {
      const start = performance.now()
      do { batch(fn) } while (performance.now() - start < 200)
      stats[name] = { samplesMs: [], htmlBytes: c.fixtures.reduce((n, f) => n + Buffer.byteLength(fn(f)), 0) }
    }
    for (let round = 0; round < 9; round++) {
      const names = Object.keys(runs)
      for (let i = 0; i < names.length; i++) {
        const name = names[(round + i) % names.length]
        let count = 0
        const start = performance.now()
        do { batch(runs[name]); count++ } while (performance.now() - start < 20)
        stats[name].samplesMs.push((performance.now() - start) / count)
      }
    }
    for (const stat of Object.values(stats)) stat.medianMs = median(stat.samplesMs)
    const result = { name: c.name, mode, fixtures: c.fixtures.length, inputBytes: c.fixtures.reduce((n, f) => n + Buffer.byteLength(f.code), 0), sha256: createHash('sha256').update(JSON.stringify(c.fixtures.map((f) => [f.sourceLang, f.code]))).digest('hex'), stats, pierreSpeedup: stats.tanstack.medianMs / stats.pierre.medianMs }
    results.push(result)
    console.error(`${mode} ${c.name}: Pierre ${result.pierreSpeedup.toFixed(2)}x TanStack`)
  }
}
shiki.dispose()
console.log(JSON.stringify({
  date: new Date().toISOString(), runtime: process.versions, cpu: os.cpus()[0].model, platform: `${os.platform()} ${os.release()} ${os.arch()}`,
  versions: { pierre: readJson(path.join(packageRoot, 'package.json')).version, tanstack: readJson(new URL('../package.json', import.meta.url)).version, shiki: readJson(new URL('../node_modules/shiki/package.json', import.meta.url)).version },
  revisions: { tanstack: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), pierre: execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() },
  methodology: 'String input to HTML string; initialization excluded; 200ms warmup per contender/case, nine rotating samples with >=20ms batches; times per corpus pass; TanStack emits theme-independent classes, others use GitHub themes; no fallback languages; Shiki time/line limits disabled.',
  excluded, sink, results,
}, null, 2))
