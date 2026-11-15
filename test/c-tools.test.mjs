import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'
import { highlight } from '../src/index'

it.each(['c', 'h'])('extracts %s fences using the registered C language', (rawLang) => {
  const root = mkdtempSync(join(tmpdir(), 'highlight-c-'))
  try {
    const docs = join(root, 'example', 'docs')
    const output = join(root, 'fixtures.json')
    const code = '#include <stdio.h>\nint value = 1;'
    mkdirSync(docs, { recursive: true })
    writeFileSync(join(docs, 'example.md'), `\`\`\`${rawLang}\n${code}\n\`\`\`\n`)
    execFileSync(process.execPath, [
      fileURLToPath(new URL('../scripts/extract-doc-fixtures.mjs', import.meta.url)),
      root,
      output,
    ])
    const { fixtures } = JSON.parse(readFileSync(output, 'utf8'))
    expect(fixtures).toHaveLength(1)
    expect(fixtures[0]).toMatchObject({ rawLang, lang: 'c', code })
    expect(highlight(code, { lang: fixtures[0].rawLang }).tokens).toEqual(
      highlight(code, { lang: fixtures[0].lang }).tokens,
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
