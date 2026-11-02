import { expect, it } from 'vitest'
import { highlight } from '../src/index.js'
import { blockCommentEnd } from '../src/internal/nested-comment.js'

function reference(code: string, cursor: number) {
  let depth = 1
  while (depth && cursor < code.length) {
    if (code.startsWith('/*', cursor)) {
      depth++
      cursor += 2
    } else if (code.startsWith('*/', cursor)) {
      depth--
      cursor += 2
    } else cursor++
  }
  return cursor
}

it('matches the character control for every short delimiter arrangement', () => {
  const alphabet = ['/', '*', 'x']
  for (let length = 0; length <= 9; length++) {
    for (let bits = 0; bits < 3 ** length; bits++) {
      let value = bits
      let suffix = ''
      for (let position = 0; position < length; position++) {
        suffix += alphabet[value % 3]
        value = Math.floor(value / 3)
      }
      const code = '/*' + suffix
      const actual = blockCommentEnd(code, 2)
      const expected = reference(code, 2)
      if (actual !== expected) throw new Error(JSON.stringify({ code, actual, expected }))
    }
  }
})

it('handles deep nesting, long text, adjacent comments and unfinished UTF16 text', () => {
  for (const suffix of ['/*'.repeat(2000) + '*/'.repeat(2001), 'x'.repeat(200_000) + '*/', '/*'.repeat(2000), 'x'.repeat(200_000), '*/ /*', '\r\n<&😀\ud800\udfff*/']) {
    const code = '/*' + suffix
    expect(blockCommentEnd(code, 2)).toBe(reference(code, 2))
  }
})

it('keeps following language tokens and quoted markers outside nested comments', () => {
  const comment = '/* outer /* nested */ still comment */'
  for (const [lang, keyword] of [['rust', 'let'], ['kotlin', 'val'], ['swift', 'let'], ['dart', 'var']]) {
    const result = highlight(`${comment} ${keyword} x = "/* text */"`, { lang })
    expect(result.tokens).toContainEqual({ value: comment, className: 'comment' })
    expect(result.tokens).toContainEqual({ value: keyword, className: 'keyword' })
    expect(result.tokens).toContainEqual({ value: '"/* text */"', className: 'string' })
    expect(highlight('/* unfinished /* nested */', { lang }).tokens).toEqual([{ value: '/* unfinished /* nested */', className: 'comment' }])
  }
})
