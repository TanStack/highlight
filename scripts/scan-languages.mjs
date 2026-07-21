import fs from 'node:fs'
import path from 'node:path'
import { collectScanRoots, walkMarkdownFiles } from './language-utils.mjs'

const root = process.argv[2] || path.resolve(process.cwd(), '..')
const scanRoots = collectScanRoots(root)

const seenFiles = new Set()
const byLang = new Map()
const byRepo = new Map()
const examples = new Map()

for (const base of scanRoots) {
  for (const file of walkMarkdownFiles(base)) {
    if (seenFiles.has(file)) continue
    seenFiles.add(file)

    const repo = path.relative(root, file).split(path.sep)[0]
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
    let inFence = false
    let fence = ''

    for (let index = 0; index < lines.length; index++) {
      const match = lines[index].match(/^(```+|~~~+)\s*([^\s`{]*)?/)
      if (!match) continue

      const marker = match[1]
      if (!inFence) {
        fence = marker.slice(0, 3)
        const raw = (match[2] || '').trim()
        add(repo, raw || 'plaintext', file, index + 1)
        inFence = true
      } else if (marker.startsWith(fence)) {
        inFence = false
        fence = ''
      }
    }
  }
}

console.log(`Files: ${seenFiles.size}`)
console.log('\nRaw fence tags:')
for (const [lang, count] of sortedEntries(byLang)) {
  console.log(`${String(count).padStart(5)} ${lang.padEnd(16)} ${examples.get(lang)}`)
}

console.log('\nRepos:')
for (const [repo, counts] of [...byRepo.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
  const langs = sortedEntries(counts)
    .map(([lang, count]) => `${lang}:${count}`)
    .join(', ')
  console.log(`${repo} (${total}) ${langs}`)
}

function add(repo, lang, file, line) {
  byLang.set(lang, (byLang.get(lang) || 0) + 1)

  const repoCounts = byRepo.get(repo) || new Map()
  repoCounts.set(lang, (repoCounts.get(lang) || 0) + 1)
  byRepo.set(repo, repoCounts)

  if (!examples.has(lang)) {
    examples.set(lang, `${path.relative(root, file)}:${line}`)
  }
}

function sortedEntries(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}
