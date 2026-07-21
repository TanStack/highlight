import fs from 'node:fs'
import path from 'node:path'
import { collectScanRoots, normalizeLanguage, supportedLanguages, walkMarkdownFiles } from './language-utils.mjs'

const root = process.argv[2] || path.resolve(process.cwd(), '..')
const outFile =
  process.argv[3] || path.join(process.cwd(), 'test/generated/tanstack-doc-fixtures.json')
const perLanguageLimit = Number(process.env.FIXTURE_LIMIT || 20)
const maxCodeLength = Number(process.env.FIXTURE_MAX_CHARS || 3000)

const fixturesByLang = new Map(supportedLanguages.map((lang) => [lang, []]))
const seenFiles = new Set()

for (const base of collectScanRoots(root)) {
  for (const file of walkMarkdownFiles(base)) {
    if (seenFiles.has(file)) continue
    seenFiles.add(file)

    const relPath = path.relative(root, file)
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    let inFence = false
    let fence = ''
    let rawLang = 'plaintext'
    let startLine = 0
    let codeLines = []

    for (let index = 0; index < lines.length; index++) {
      const match = lines[index].match(/^(```+|~~~+)\s*([^\s`{]*)?/)
      if (!match) {
        if (inFence) codeLines.push(lines[index])
        continue
      }

      const marker = match[1]
      if (!inFence) {
        fence = marker.slice(0, 3)
        rawLang = (match[2] || 'plaintext').trim() || 'plaintext'
        startLine = index + 1
        codeLines = []
        inFence = true
      } else if (marker.startsWith(fence)) {
        addFixture(relPath, startLine, rawLang, codeLines.join('\n'))
        inFence = false
        fence = ''
        codeLines = []
      } else {
        codeLines.push(lines[index])
      }
    }
  }
}

const fixtures = []
for (const lang of supportedLanguages) {
  fixtures.push(...(fixturesByLang.get(lang) || []))
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(
  outFile,
  `${JSON.stringify(
    {
      perLanguageLimit,
      maxCodeLength,
      count: fixtures.length,
      fixtures,
    },
    null,
    2,
  )}\n`,
)

console.log(`Wrote ${fixtures.length} fixtures to ${outFile}`)

function addFixture(file, line, rawLang, code) {
  const lang = normalizeLanguage(rawLang)
  const bucket = fixturesByLang.get(lang)
  if (!bucket || bucket.length >= perLanguageLimit) return

  const trimmed = code.trimEnd()
  if (!trimmed) return

  bucket.push({
    file,
    line,
    rawLang,
    lang,
    code: trimmed.length > maxCodeLength ? trimmed.slice(0, maxCodeLength) : trimmed,
  })
}
