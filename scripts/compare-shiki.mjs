import fs from 'node:fs'
import { performance } from 'node:perf_hooks'
import * as shiki from 'shiki'
import { highlight } from '../dist/index.js'

const fixtureFile = 'test/generated/tanstack-doc-fixtures.json'
const fixtures = JSON.parse(fs.readFileSync(fixtureFile, 'utf8')).fixtures

const ourStart = performance.now()
let ourHtmlBytes = 0
for (const fixture of fixtures) {
  ourHtmlBytes += highlight(fixture.code, { lang: fixture.rawLang }).html.length
}
const ourElapsedMs = performance.now() - ourStart

const shikiInitStart = performance.now()
const shikiHighlighter = await shiki.createHighlighter({
  themes: ['github-light', 'aurora-x'],
  langs: ['plaintext'],
})
const shikiInitMs = performance.now() - shikiInitStart

const failedLanguages = new Set()
const shikiStart = performance.now()
let shikiHtmlBytes = 0
for (const fixture of fixtures) {
  const lang = normalizeShikiLanguage(fixture.rawLang)
  const effectiveLang = await ensureShikiLanguage(shikiHighlighter, lang, failedLanguages)
  shikiHtmlBytes += shikiHighlighter.codeToHtml(fixture.code, {
    lang: effectiveLang,
    themes: {
      light: 'github-light',
      dark: 'aurora-x',
    },
  }).length
}
const shikiElapsedMs = performance.now() - shikiStart

console.log(
  JSON.stringify(
    {
      fixtures: fixtures.length,
      ours: {
        highlightMs: Number(ourElapsedMs.toFixed(2)),
        htmlKiB: Math.round(ourHtmlBytes / 1024),
      },
      shiki: {
        initMs: Number(shikiInitMs.toFixed(2)),
        highlightMs: Number(shikiElapsedMs.toFixed(2)),
        totalMs: Number((shikiInitMs + shikiElapsedMs).toFixed(2)),
        htmlKiB: Math.round(shikiHtmlBytes / 1024),
        failedLanguages: [...failedLanguages].sort(),
      },
      ratios: {
        highlightSpeedup: Number((shikiElapsedMs / Math.max(ourElapsedMs, 0.001)).toFixed(1)),
        totalSpeedup: Number(((shikiInitMs + shikiElapsedMs) / Math.max(ourElapsedMs, 0.001)).toFixed(1)),
        htmlSizeReduction: Number((shikiHtmlBytes / Math.max(ourHtmlBytes, 1)).toFixed(1)),
      },
    },
    null,
    2,
  ),
)

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
