import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { c } from '../src/languages/c'
import { cpp } from '../src/languages/cpp'

const highlighter = createHighlighter({ languages: [c] })

function classes(code: string, text: string, lang = 'c') {
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

describe('C documentation syntax', () => {
  it('isolates comments, prefixed strings, and character literals', () => {
    const code = 'const char *url = "https://example.com /* text */";\nwchar_t ch = L\'\\n\'; // "comment"\nchar8_t *s = u8"utf";'
    expect(classes(code, '"https://example.com /* text */"')).toEqual(['string'])
    expect(classes(code, "L'\\n'")).toEqual(['string'])
    expect(classes(code, '// "comment"')).toEqual(['comment'])
    expect(classes(code, 'u8"utf"')).toEqual(['string'])
  })

  it('keeps C++-only words plain because C allows them as identifiers', () => {
    const code = 'int new = 1;\nstruct node *class = this_node(template, namespace);\nint this = new + 1;'
    for (const word of ['new', 'namespace', 'template']) {
      expect(classes(code, word), word).toEqual([undefined])
    }
    expect(classes('int this = 0;', 'this')).toEqual([undefined])
    expect(classes('int x = 0; void *p = class;', 'class')).toEqual([undefined])
  })

  it('recognizes C11 and C23 keywords, types, and literals', () => {
    const code = '_Static_assert(sizeof(int) == 4, "int");\nstatic_assert(true);\nvoid copy(char *restrict dst, const char *restrict src);\n_Atomic _Bool ready = false;\nauto p = nullptr;\ntypeof(p) q = _Generic(p, default: 0);\nconstexpr _BitInt(7) small = 3wb;'
    for (const keyword of ['_Static_assert', 'sizeof', 'static_assert', 'restrict', '_Atomic', 'auto', 'typeof', '_Generic', 'constexpr']) {
      expect(classes(code, keyword), keyword).toEqual(['keyword'])
    }
    for (const type of ['_Bool', '_BitInt']) {
      expect(classes(code, type), type).toEqual(['type'])
    }
    expect(classes(code, 'nullptr')).toEqual(['literal'])
    expect(classes(code, 'false')).toEqual(['literal'])
    expect(classes(code, '3wb')).toEqual(['number'])
  })

  it('recognizes numbers with suffixes and digit separators', () => {
    for (const number of ["1'000", '42ULL', '0b1010u', "0xAB'CD", '0x1.fp+2', '.5f', '1.e2', '10uwb']) {
      const code = `long value = ${number};`
      expect(classes(code, number), number).toEqual(['number'])
    }
  })

  it('recognizes include paths, directives, tagged types, and calls', () => {
    const code = '#include <stdio.h>\n#define MAX 10\n// continued \\\n"still a comment"\nstruct point { int x; };\nint main(void) { printf("%d", MAX); return 0; }'
    expect(classes(code, '#include')).toEqual(['meta'])
    expect(classes(code, '<stdio.h>')).toEqual(['string'])
    expect(classes(code, '#define')).toEqual(['meta'])
    expect(classes(code, '"still a comment"')).toEqual(['comment'])
    expect(classes(code, 'point')).toEqual(['type'])
    expect(classes(code, 'printf')).toEqual(['function'])
    expect(classes('node->next = ptr;', '->')).toEqual(['operator'])
  })

  it('registers only the requested aliases', () => {
    for (const name of ['c', 'h', 'C', 'H']) {
      expect(highlighter.normalizeLanguage(name)).toBe('c')
    }
    expect(createHighlighter({ languages: [cpp] }).normalizeLanguage('c')).toBe('plaintext')
    expect(highlighter.normalizeLanguage('cpp')).toBe('plaintext')
  })
})
