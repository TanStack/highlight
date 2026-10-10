import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { normalizeLanguage } from '../src/index'
import { powershell } from '../src/languages/powershell'
import { markdown } from '../src/languages/markdown'
import { tokenClasses } from './token-classes'

const highlighter = createHighlighter({ languages: [powershell, markdown] })
const classes = (code: string, text: string, lang = 'pwsh') => tokenClasses(highlighter, code, text, lang)

describe('PowerShell documentation syntax', () => {
  it('scans unterminated braced variables without backtracking', () => {
    for (const [code, expected] of [
      ['${'.repeat(50_000), ['variable']],
      ['"' + '${'.repeat(50_000), ['string']],
      ['"${'.repeat(20_000), ['string', 'variable']],
    ] as const) {
      expect(classes(code, code)).toEqual(expected)
    }
  }, 1000)
  it('preserves braced names while leaving escaped dollar signs literal', () => {
    for (const text of ['${my var}', '${env:ProgramFiles(x86)}', '${a`}b}']) {
      expect(classes(`${text} = 1`, text)).toEqual(['variable'])
    }
    expect(classes('`${x}', '${x}')).not.toContain('variable')
  })
  it('protects escaped unbraced variables and literals', () => {
    for (const [text, className] of [
      ['$HOME', 'variable'], ['$env:HOME', 'variable'], ['$?', 'variable'],
      ['$$', 'variable'], ['$true', 'literal'], ['$false', 'literal'], ['$null', 'literal'],
    ]) {
      expect(classes('Write-Output escaped`' + text, text)).not.toContain(className)
      expect(classes('Write-Output ' + text, text)).toEqual([className])
      expect(classes('Write-Output ``' + text, text)).toEqual([className])
    }
    expect(classes('Write-Output "escaped`$HOME"', '"escaped`$HOME"')).toEqual(['string'])
    expect(classes('Write-Output `', '`')).toEqual(['string'])
  })
  it('keeps member names out of keywords while preserving statements', () => {
    for (const text of ['End', 'Process', 'Begin', 'Data']) {
      expect(classes(`$job.${text}`, text)).toEqual(['property'])
      expect(classes(`${text} {}`, text)).toEqual(['keyword'])
    }
  })
  it('protects quoted escapes, doubled quotes and comment boundaries', () => {
    for (const text of ["'Today''s # forecast'", '"quote `" # text"', '"C:\\cache\\"']) expect(classes(`$x = ${text}`, text, 'ps1')).toEqual(['string'])
    expect(classes('Write-Output hello#there # comment', '#there', 'pwsh')).not.toContain('comment')
    expect(classes('Write-Output hello#there # comment', '# comment', 'pwsh')).toEqual(['comment'])
    expect(classes('Write-Output escaped`#hash', '#hash', 'pwsh')).not.toContain('comment')
    expect(classes('<# "text" $true #> $false', '<# "text" $true #>', 'pwsh')).toEqual(['comment'])
  })
  it('protects nested expandable-string expressions and braced variable names', () => {
    const text = '\"Result: $(Get-Item -Path \"coast\").Name\"'
    expect(classes(`$x = ${text}`, text, 'pwsh')).toEqual(['string'])
    const commented = '"Value: $(1 <# ) " #> + 2)"'
    expect(classes(`$x = ${commented}`, commented, 'pwsh')).toEqual(['string'])
    const variable = '${name"#with`}"characters}'
    expect(classes(`${variable} = 1`, variable, 'pwsh')).toEqual(['variable'])
  })
  it('matches here-string terminators only at the start of a line', () => {
    for (const quote of ['"', "'"]) {
      const text = `@${quote}  \t\r\n# literal $x\r\n  ${quote}@ still text\r\n${quote}@`
      expect(classes(`$x = ${text}\r\nGet-Item`, text, 'powershell')).toEqual(['string'])
      expect(classes(`$x = ${text}\r\nGet-Item`, 'Get-Item', 'powershell')).toEqual(['command'])
    }
  })
  it('recognizes case-insensitive keywords, variables, parameters and operators', () => {
    const code = 'FUNCTION Get-Report { PARAM([string[]] $Name) $script:Count = $ENV:HOME; ${a-b} = @params; IF ($TRUE -AND $? -cnotmatch "x") { Get-Item -LiteralPath $Name } }'
    for (const word of ['FUNCTION', 'PARAM', 'IF']) expect(classes(code, word, 'pwsh')).toEqual(['keyword'])
    for (const word of ['$script:Count', '$ENV:HOME', '${a-b}', '@params', '$?']) expect(classes(code, word, 'pwsh')).toEqual(['variable'])
    for (const command of ['ForEach-Object', 'Test-Match', 'Compare-In']) expect(classes(command, command, 'pwsh')).toEqual(['command'])
    for (const word of ['-AND', '-cnotmatch']) expect(classes(code, word, 'pwsh')).toEqual(['operator'])
    expect(classes(code, '$TRUE', 'pwsh')).toEqual(['literal'])
    expect(classes(code, '-LiteralPath', 'pwsh')).toEqual(['property'])
    expect(classes(code, '[string[]]', 'pwsh')).toEqual(['type'])
    expect(classes(code, 'Get-Report', 'pwsh')).toEqual(['function'])
    expect(classes('1..4', '4', 'pwsh')).toEqual(['number'])
    for (const number of ['64MB', '0xFF', '0b1010', '1.2e3', '42UL']) expect(classes(`$x = ${number}`, number, 'pwsh')).toEqual(['number'])
  })
})

it('registers aliases, isolates imports and delegates Markdown fences', () => {
  for (const name of ['powershell', 'pwsh', 'ps1']) expect(normalizeLanguage(name)).toBe('powershell')
  expect(createHighlighter({ languages: [markdown] }).normalizeLanguage('pwsh')).toBe('plaintext')
  for (const lang of ['powershell', 'pwsh', 'ps1']) {
    expect(classes(`\`\`\`${lang}\nGet-Item $HOME\n\`\`\``, 'Get-Item', 'markdown')).toEqual(['command'])
  }
})

it('keeps the PowerShell guide identical to its canonical showcase', () => {
  const guide = readFileSync(new URL('../docs/guides/powershell.md', import.meta.url), 'utf8')
  const showcase = readFileSync(new URL('./showcases/Get-StationReport.ps1', import.meta.url), 'utf8')
  expect(guide.match(/```powershell\n([\s\S]*?)\n```/)?.[1]).toBe(showcase.trimEnd())
})
