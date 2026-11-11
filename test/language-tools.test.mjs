import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { highlight } from '../src/index'

it('extracts JSONL fences using the registered JSON language', () => {
  const root = mkdtempSync(join(tmpdir(), 'highlight-jsonl-'))
  try {
    const docs = join(root, 'example', 'docs')
    const output = join(root, 'fixtures.json')
    const code = '{"active":true}\n{"active":false}'
    mkdirSync(docs, { recursive: true })
    writeFileSync(join(docs, 'example.md'), `\`\`\`jsonl\n${code}\n\`\`\`\n`)
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../scripts/extract-doc-fixtures.mjs', import.meta.url)),
      root,
      output,
    ])
    const { fixtures } = JSON.parse(readFileSync(output, 'utf8'))
    expect(fixtures).toHaveLength(1)
    expect(fixtures[0]).toMatchObject({ rawLang: 'jsonl', lang: 'json', code })
    expect(highlight(code, { lang: fixtures[0].rawLang }).tokens).toEqual(
      highlight(code, { lang: fixtures[0].lang }).tokens,
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

it.each(['constructor', '__proto__'])('retains unknown %s fences as plaintext fixtures', (rawLang) => {
  const root = mkdtempSync(join(tmpdir(), 'highlight-unknown-'))
  try {
    const docs = join(root, 'example', 'docs')
    const output = join(root, 'fixtures.json')
    mkdirSync(docs, { recursive: true })
    writeFileSync(join(docs, 'example.md'), `\`\`\`${rawLang}\nx < y\n\`\`\`\n`)
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../scripts/extract-doc-fixtures.mjs', import.meta.url)), root, output,
    ])
    const { fixtures } = JSON.parse(readFileSync(output, 'utf8'))
    expect(fixtures).toHaveLength(1)
    expect(fixtures[0]).toMatchObject({ rawLang, lang: 'plaintext', code: 'x < y' })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
