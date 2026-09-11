import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { cpp } from '../src/languages/cpp'
import { cmake } from '../src/languages/cmake'

const highlighter = createHighlighter({ languages: [cpp, cmake] })

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

describe('C++ documentation syntax', () => {
  it('isolates comments, prefixed strings, raw strings, and character literals', () => {
    const raw = 'u8R"tag(quote " // text )wrong" /* text */ )tag"'
    const code = `auto text = ${raw};\nconst char* url = "https://example.com";\nauto ch = L'\\n'; // "comment"`
    expect(classes(code, raw, 'cpp')).toEqual(['string'])
    expect(classes(code, '"https://example.com"', 'cpp')).toEqual(['string'])
    expect(classes(code, "L'\\n'", 'cpp')).toEqual(['string'])
    expect(classes(code, '// "comment"', 'cpp')).toEqual(['comment'])
  })

  it('keeps digit separators out of character literals', () => {
    for (const number of ["1'000", "1'000.5'000'001", '42ULL', '0b1010u', "0xAB'CD", '0x1.fp+2', '.5f', '1.e2', '23_km']) {
      const code = `auto value = ${number};`
      expect(classes(code, number, 'cpp'), number).toEqual(['number'])
    }
  })

  it('recognizes include paths, templates, and multiline macro comments', () => {
    const code = '#include <vector>\ntemplate<class T> struct Box { T value; };\n// continued \\\n"still a comment"\nauto ready = true;'
    expect(classes(code, '#include', 'cpp')).toEqual(['meta'])
    expect(classes(code, '<vector>', 'cpp')).toEqual(['string'])
    expect(classes(code, 'Box', 'cpp')).toEqual(['type'])
    expect(classes(code, '"still a comment"', 'cpp')).toEqual(['comment'])
    expect(classes(code, 'true', 'cpp')).toEqual(['literal'])
  })

  it('registers only the requested aliases', () => {
    for (const name of ['cpp', 'c++', 'cc', 'cxx', 'hpp', 'hxx']) {
      expect(highlighter.normalizeLanguage(name)).toBe('cpp')
    }
    expect(createHighlighter({ languages: [cmake] }).normalizeLanguage('cpp')).toBe('plaintext')
  })
})

describe('CMake documentation syntax', () => {
  it('matches bracket delimiters exactly and protects their contents', () => {
    const comment = '#[==[ message("hidden") ]=] still a comment ]==]'
    const string = '[=[${literal} # not a comment ]==] still a string ]=]'
    const code = `${comment}\nset(TEXT ${string})\nmessage("done")`
    expect(classes(code, comment, 'cmake')).toEqual(['comment'])
    expect(classes(code, string, 'cmake')).toEqual(['string'])
    expect(classes('MESSAGE("done")', 'MESSAGE', 'cmake')).toEqual(['command'])
  })

  it('preserves quoted escapes, escaped hashes, and environment variables', () => {
    const code = 'set(TEXT "quote \\" # string")\nmessage(escaped\\#hash $ENV{HOME} $CACHE{VALUE} ${SOURCE_DIR}) # comment'
    expect(classes(code, '"quote \\" # string"', 'cmake')).toEqual(['string'])
    expect(classes(code, '#hash', 'cmake')).not.toContain('comment')
    for (const variable of ['$ENV{HOME}', '$CACHE{VALUE}', '${SOURCE_DIR}']) {
      expect(classes(code, variable, 'cmake')).toEqual(['variable'])
    }
    expect(classes(code, '# comment', 'cmake')).toEqual(['comment'])
  })

  it('keeps nested variables and generator expressions together', () => {
    for (const variable of ['${outer_${inner}}', '$<IF:$<CONFIG:Debug>,debug,release>']) {
      expect(classes(`message(${variable})`, variable, 'cmake')).toEqual(['variable'])
    }
  })

  it('handles multiline strings and case-insensitive flow commands', () => {
    const code = 'IF(ON)\nmessage("first\n# second")\nENDIF()'
    expect(classes(code, 'IF', 'cmake')).toEqual(['keyword'])
    expect(classes(code, 'ENDIF', 'cmake')).toEqual(['keyword'])
    expect(classes(code, '"first\n# second"', 'cmake')).toEqual(['string'])
  })
})
