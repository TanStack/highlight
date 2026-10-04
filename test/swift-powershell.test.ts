import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { normalizeLanguage } from '../src/index'
import { swift } from '../src/languages/swift'
import { powershell } from '../src/languages/powershell'
import { markdown } from '../src/languages/markdown'

const highlighter = createHighlighter({ languages: [swift, powershell, markdown] })
function classes(code: string, text: string, lang: string) {
  const result = highlighter.tokenize(code, { lang })
  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  const start = code.indexOf(text)
  expect(start).toBeGreaterThanOrEqual(0)
  let offset = 0
  return result.tokens.flatMap((token) => {
    const from = offset
    offset += token.value.length
    return from < start + text.length && offset > start ? [token.className] : []
  })
}

describe('Swift documentation syntax', () => {
  it('protects nested comments, raw identifiers and exact raw delimiters', () => {
    const comment = '/* outer /* inner */ "still" */'
    const raw = '##"quote "# // not a comment \\n"##'
    const code = `${comment}\nlet value = ${raw}\nlet \`class\` = nil`
    expect(classes(code, comment, 'swift')).toEqual(['comment'])
    expect(classes(code, raw, 'swift')).toEqual(['string'])
    expect(classes(code, '`class`', 'swift')).toEqual(['variable'])
    expect(classes(code, 'nil', 'swift')).toEqual(['literal'])
  })
  it('keeps multiline strings and nested interpolation expressions intact', () => {
    for (const text of ['"""\n// text\n"quote"\n"""', '"Hello \\(names.joined(separator: ", "))!"', '#"Hello \\#(format("x"))"#', '#/a["/]b\\d+/#']) {
      expect(classes(`let text = ${text}\nlet ready = true`, text, 'swift')).toEqual(['string'])
    }
  })
  it('uses ordinary escapes inside extended regex delimiters', () => {
    for (const text of [String.raw`#/foo\/#bar/#`, String.raw`#/foo\#/#`]) {
      const code = `let pattern = ${text}\nlet ready = true`
      expect(classes(code, text, 'swift')).toEqual(['string'])
      expect(classes(code, 'true', 'swift')).toEqual(['literal'])
    }
  })
  it('recognizes concurrency, attributes, types, numeric bases and ranges', () => {
    const code = '@MainActor\nactor Cache { func read() async throws -> Int { try await load() } }\n#if DEBUG\n#endif'
    for (const word of ['actor', 'async', 'throws', 'try', 'await']) expect(classes(code, word, 'swift')).toEqual(['keyword'])
    expect(classes(code, '@MainActor', 'swift')).toEqual(['attr'])
    expect(classes(code, 'Cache', 'swift')).toEqual(['type'])
    expect(classes(code, '#if', 'swift')).toEqual(['meta'])
    for (const number of ['0b1010_0011', '0o755', '0xFF', '0x1.fp+2', '1_000.5e-2', '42']) expect(classes(`let x = ${number}`, number, 'swift')).toEqual(['number'])
    expect(classes('1..<4', '..<', 'swift')).toEqual(['operator'])
    expect(classes('1...4', '...', 'swift')).toEqual(['operator'])
    expect(classes('1...4', '4', 'swift')).toEqual(['number'])
    expect(classes('let ratio = total / count', '/', 'swift')).toEqual(['operator'])
  })
})

describe('PowerShell documentation syntax', () => {
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

it('registers default aliases, isolates imports and delegates Markdown fences', () => {
  for (const name of ['powershell', 'pwsh', 'ps1']) expect(normalizeLanguage(name)).toBe('powershell')
  expect(normalizeLanguage('swift')).toBe('swift')
  expect(createHighlighter({ languages: [swift] }).normalizeLanguage('pwsh')).toBe('plaintext')
  for (const [lang, source, text] of [['swift', 'actor Cache {}', 'actor'], ['pwsh', 'Get-Item $HOME', 'Get-Item']]) {
    expect(classes(`\`\`\`${lang}\n${source}\n\`\`\``, text, 'markdown')).toEqual([lang === 'swift' ? 'keyword' : 'command'])
  }
})
