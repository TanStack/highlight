import { describe, expect, it } from 'vitest'
import { createHighlighter, renderNodesToHtml, renderTokens } from '../src/core'
import type { LanguageDefinition } from '../src/core'
import { defaultHighlighter, highlight } from '../src/index'
import * as definitions from '../src/languages'
import fixtures from './generated/additional-language-fixtures.json'
import docs from './generated/tanstack-doc-fixtures.json'
import legacyLanguages from './generated/legacy-language-aliases.json'

it('keeps GraphQL operation keywords case-sensitive', () => {
  const tokens = highlight('type Query { id: ID } query { id }', { lang: 'graphql' }).tokens
  expect(tokens).toContainEqual({ value: 'query', className: 'keyword' })
  expect(tokens.some((token) => token.value === 'Query' && token.className === 'keyword')).toBe(false)
})

it("highlights JSONL identically to lines highlighted by JSON", () => {
  const code = '{"active":true,"count":42,"label":"hello"}\n{"active":false}';
  const jsonlTokens = highlight(code, { lang: "json" }).tokens;
  const jsonsTokens = code
    .split("\n")
    .map((c) => highlight(c, { lang: "json" }).tokens);

  expect(jsonlTokens.slice(0, jsonsTokens[0].length - 1)).toEqual(
    jsonsTokens[0]?.slice(0, -1),
  );
  expect(jsonlTokens.slice(jsonsTokens[0].length)).toEqual(
    jsonsTokens[1].slice(1)
  );
  expect(jsonlTokens[jsonsTokens[0].length - 1]).toEqual({
    value: jsonsTokens[0].at(-1)?.value + "\n" + jsonsTokens[1][0]?.value,
  });
});

it('distinguishes stylesheet selectors from declaration values', () => {
  for (const lang of ['scss', 'less']) {
    const tokens = highlight('.card { a:hover { color: #fff; } }', { lang }).tokens
    expect(tokens).toContainEqual({ value: '.card', className: 'selector' })
    expect(tokens).toContainEqual({ value: 'color', className: 'property' })
    expect(tokens.some((token) => token.value === '#fff' && token.className === 'selector')).toBe(false)
    expect(tokens.some((token) => token.value === 'a' && token.className === 'property')).toBe(false)
  }
})

it('consumes numeric suffixes for languages that support them', () => {
  for (const [lang, value] of [
    ['c', '1.0f'], ['c', '10UL'], ['glsl', '5u'], ['objectivec', '10L'],
    ['scala', '10L'], ['groovy', '1.0G'], ['d', '10UL'], ['fsharp', '10UL'],
    ['r', '10L'], ['fortran', '1.0_dp'],
  ]) {
    expect(highlight(value, { lang }).tokens, `${lang}: ${value}`).toEqual([{ value, className: 'number' }])
  }
  expect(highlight('1.0f', { lang: 'graphql' }).tokens).toEqual([{ value: '1.0f', className: undefined }])
})

it('preserves every pre-expansion language name and alias', () => {
  for (const { name, aliases } of legacyLanguages) {
    const language = (definitions as Record<string, LanguageDefinition>)[name]
    const selective = createHighlighter({ languages: [language] })
    for (const alias of [name, ...aliases]) {
      expect(defaultHighlighter.normalizeLanguage(alias), alias).toBe(name)
      expect(selective.normalizeLanguage(alias), alias).toBe(name)
    }
  }
  const code = 'echo "$HOME"'
  expect(highlight(code, { lang: 'cmd' })).toEqual(highlight(code, { lang: 'shell' }))
})

describe.each(fixtures)('$name', (fixture) => {
  const language = (definitions as Record<string, LanguageDefinition>)[fixture.name]
  const highlighter = createHighlighter({ languages: [language] })

  it('highlights a valid example with an isolated registration', () => {
    const result = highlighter.highlight(fixture.code, { lang: fixture.name })
    expect(result.lang).toBe(fixture.name)
    expect(result.tokens.map((t) => t.value).join('')).toBe(fixture.code)
    for (const [value, className] of fixture.checks) {
      expect(result.tokens, `${fixture.name}: ${value}`).toContainEqual({ value, className })
    }
    expect(defaultHighlighter.normalizeLanguage(fixture.name)).toBe(fixture.name)
    for (const alias of fixture.aliases) {
      expect(highlighter.normalizeLanguage(alias)).toBe(fixture.name)
      expect(defaultHighlighter.normalizeLanguage(alias)).toBe(fixture.name)
    }
  })

  it('preserves unfinished and Unicode input and does not retain scan state', () => {
    const variants = [fixture.code, ...[1, 2, 3, 8, 17].map((n) => fixture.code.slice(0, -n)), '🌈 café\r\n<&"\'>\u0000', '', fixture.code]
    for (const code of variants) {
      const result = highlighter.highlight(code, { lang: fixture.name })
      expect(result.tokens.map((t) => t.value).join('')).toBe(code)
      expect(result.html).not.toContain('<&')
      const treeHtml = renderNodesToHtml(renderTokens(result.tokens))
      expect(result.html).toContain(`<code>${treeHtml}</code>`)
    }
  })
})

it('preserves lexical context at common boundaries', () => {
  const cases = [
    ['ocaml', "let identity (x : 'a) = x (* note *)", 'let', 'keyword'],
    ['matlab', "y = x' + 1; disp('hello');", "'hello'", 'string'],
    ['powershell', '@"\n# inside\n"@\n# outside', '@"\n# inside\n"@', 'string'],
    ['nix', "text = ''hello # inside''; # outside", "''hello # inside''", 'string'],
    ['c', 'const char *text = "// string"; /* "comment" */', '/* "comment" */', 'comment'],
    ['scala', '/* outer /* nested */ still comment */ val x = 1', '/* outer /* nested */ still comment */', 'comment'],
    ['graphql', '"""type Fake # not a comment"""\ntype Real { id: ID }', '"""type Fake # not a comment"""', 'string'],
    ['batch', '@REM "comment"\necho "REM text"', '@REM "comment"', 'comment'],
    ['properties', 'escaped\\ key=value\n# note', 'escaped\\ key', 'property'],
  ]
  for (const [lang, code, value, className] of cases) {
    expect(highlight(code, { lang }).tokens, lang).toContainEqual({ value, className })
  }
})

it('keeps keyword-like symbols and variables out of keyword classification', () => {
  for (const [lang, code, value, className] of [
    ['clojure', ':if', ':if', 'literal'],
    ['elixir', ':case', ':case', 'literal'],
    ['powershell', '$if', '$if', 'variable'],
    ['scss', '$if: red', '$if', 'variable'],
    ['wat', '(local $if i32)', '$if', 'variable'],
    ['powershell', 'Get-Process', 'Get-Process', 'command'],
  ]) {
    expect(highlight(code, { lang }).tokens).toContainEqual({ value, className })
  }
  for (const [lang, code] of [
    ['clojure', 'some-if'], ['lisp', 'some-if'], ['nix', 'some-if'],
    ['haskell', "if'"], ['ocaml', "let'"], ['fsharp', "let'"],
    ['elixir', 'if?'], ['r', 'if.foo'],
  ]) {
    expect(highlight(code, { lang }).tokens.some((token) => token.className === 'keyword'), `${lang}: ${code}`).toBe(false)
  }
})

it('unwinds deeply nested comments without losing the following code', () => {
  const comment = '(*'.repeat(2000) + 'text' + '*)'.repeat(2000)
  const result = highlight(`${comment} let x = 1`, { lang: 'ocaml' })
  expect(result.tokens).toContainEqual({ value: comment, className: 'comment' })
  expect(result.tokens).toContainEqual({ value: 'let', className: 'keyword' })
})

it('protects comments inside triple-apostrophe strings', () => {
  for (const lang of ['elixir', 'groovy', 'coffeescript']) {
    const value = "'''\n# text\n// text\n'''"
    expect(highlight(value, { lang }).tokens).toEqual([{ value, className: 'string' }])
  }
})

it('only ends multiline strings and comments at their delimiter or end of input', () => {
  for (const lang of ['c', 'glsl', 'objectivec', 'groovy', 'protobuf', 'scss', 'less', 'verilog', 'vhdl']) {
    const value = '/* first line\nreturn "inside"\nlast line */'
    expect(highlight(value, { lang }).tokens, lang).toEqual([{ value, className: 'comment' }])
    const unfinished = '/* first line\nreturn "inside"'
    expect(highlight(unfinished, { lang }).tokens, lang).toEqual([{ value: unfinished, className: 'comment' }])
  }
  for (const lang of ['elixir', 'elm', 'fsharp', 'graphql', 'groovy', 'julia', 'scala', 'coffeescript']) {
    const value = '"""\n# text\n// text\n"""'
    expect(highlight(value, { lang }).tokens, lang).toEqual([{ value, className: 'string' }])
  }
})

it('matches render-tree serialization for every real docs snippet', () => {
  for (const fixture of docs.fixtures) {
    const result = highlight(fixture.code, { lang: fixture.rawLang })
    expect(result.html).toContain(`<code>${renderNodesToHtml(renderTokens(result.tokens))}</code>`)
  }
})

it('escapes custom language names and runtime token classes in direct HTML output', () => {
  const name = '" onmouseover="unsafe'
  const highlighter = createHighlighter({ languages: [{
    name,
    tokenize: (code) => [{ start: 0, end: code.length, className: '" onclick="unsafe' as 'keyword' }],
  }] })
  const result = highlighter.highlight('<script>"&\'</script>', { lang: name })
  expect(result.html).toContain(`<code>${renderNodesToHtml(renderTokens(result.tokens))}</code>`)
  expect(result.html).not.toContain(' onclick="')
  expect(result.html).not.toContain(' onmouseover="')
  expect(result.html).not.toContain('<script>')
})
