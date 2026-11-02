import { expect, it } from 'vitest'
import { highlight } from '../src/index.js'

function variants(word: string) {
  let values = ['']
  for (const character of word) {
    values = /[A-Za-z]/.test(character)
      ? values.flatMap(value => [value + character.toLowerCase(), value + character.toUpperCase()])
      : values.map(value => value + character)
  }
  return values
}

it('preserves every ASCII case spelling of the canonicalized Ada and Fortran words', () => {
  for (const [lang, word, className] of [
    ['ada', 'False', 'literal'], ['ada', 'True', 'literal'],
    ['fortran', '.False.', 'literal'], ['fortran', '.True.', 'literal'],
    ['fortran', 'C_intptr_t', 'keyword'],
  ]) {
    for (const value of variants(word)) {
      expect(highlight(value, { lang }).tokens).toEqual([{ value, className }])
    }
  }
})

it('keeps native non-Unicode case folding and word boundaries unchanged', () => {
  for (const [lang, words] of [
    ['ada', ['falſe', 'truK', 'xFalse', 'Truex']],
    ['fortran', ['.falſe.', 'Kind', 'İnteger', 'xC_intptr_t', 'C_intptr_tx']],
  ] as const) {
    for (const code of words) {
      const tokens = highlight(code, { lang }).tokens
      expect(tokens.some(token => token.className === 'literal' || token.className === 'keyword'), `${lang}: ${code}`).toBe(false)
    }
  }
})
