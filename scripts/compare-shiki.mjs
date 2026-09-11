import fs from 'node:fs'
import { performance } from 'node:perf_hooks'
import * as shiki from 'shiki'
import { highlight } from '../dist/index.js'
import { measureRuntime } from './benchmark-utils.mjs'

const fixtureFile = 'test/generated/tanstack-doc-fixtures.json'
const fixtures = JSON.parse(fs.readFileSync(fixtureFile, 'utf8')).fixtures

const shikiInitStart = performance.now()
const shikiHighlighter = await shiki.createHighlighter({
  themes: ['github-light', 'aurora-x'],
  langs: ['plaintext'],
})
const shikiInitMs = performance.now() - shikiInitStart

const failedLanguages = new Set()
const languages = new Map()
const languageLoadStart = performance.now()
for (const fixture of fixtures) {
  const lang = normalizeShikiLanguage(fixture.rawLang)
  if (!languages.has(lang)) {
    languages.set(lang, await ensureShikiLanguage(shikiHighlighter, lang, failedLanguages))
  }
}
const languageLoadMs = performance.now() - languageLoadStart

try {
  const ours = measureRuntime({
    fixtures,
    run: (fixture) => highlight(fixture.code, { lang: fixture.rawLang }).html,
    targetBlocks: fixtures.length,
    outputBytes: (html) => Buffer.byteLength(html),
  })
  const theirs = measureRuntime({
    fixtures,
    run: (fixture) => shikiHighlighter.codeToHtml(fixture.code, {
      lang: languages.get(normalizeShikiLanguage(fixture.rawLang)),
      themes: { light: 'github-light', dark: 'aurora-x' },
    }),
    targetBlocks: fixtures.length,
    outputBytes: (html) => Buffer.byteLength(html),
  })

  console.log(
    JSON.stringify(
      {
        fixtures: fixtures.length,
        timing: 'Median of three samples after two warmup passes; language loading measured separately',
        ours: {
          highlightMs: ours.elapsedMs,
          samplesMs: ours.samplesMs,
          htmlKiB: ours.htmlKiB,
        },
        shiki: {
          initMs: Number(shikiInitMs.toFixed(2)),
          languageLoadMs: Number(languageLoadMs.toFixed(2)),
          highlightMs: theirs.elapsedMs,
          samplesMs: theirs.samplesMs,
          htmlKiB: theirs.htmlKiB,
          failedLanguages: [...failedLanguages].sort(),
        },
        ratios: {
          highlightSpeedup: Number((theirs.elapsedMs / Math.max(ours.elapsedMs, 0.001)).toFixed(1)),
          htmlSizeReduction: Number((theirs.htmlBytes / Math.max(ours.htmlBytes, 1)).toFixed(1)),
        },
      },
      null,
      2,
    ),
  )
} finally {
  shikiHighlighter.dispose()
}

async function ensureShikiLanguage(highlighter, lang, failedLanguages) {
  if (failedLanguages.has(lang)) return 'plaintext'

  try {
    if (!highlighter.getLoadedLanguages().includes(lang)) {
      await highlighter.loadLanguage(lang)
    }

    return lang
  } catch {
    failedLanguages.add(lang)
    return 'plaintext'
  }
}

function normalizeShikiLanguage(lang) {
  const value = (lang || 'plaintext').toLowerCase()
  const aliases = {
    '-->': 'plaintext',
    'angular-html': 'html',
    'angular-ts': 'ts',
    dotenv: 'env',
    js: 'javascript',
    'js-vue': 'javascript',
    jsonc: 'json',
    md: 'markdown',
    sh: 'bash',
    shell: 'bash',
    text: 'plaintext',
    txt: 'plaintext',
    typescript: 'ts',
    xml: 'html',
  }

  return aliases[value] || value
}
