import { describe, expect, it } from 'vitest'
import { createHighlighter } from '../src/core'
import { elm } from '../src/languages/elm'
import { vbnet } from '../src/languages/vbnet'
import { compiledWordLanguage, simpleWordLanguage as simpleLanguage } from '../src/internal/word-language'

const noMatch = /\b\B/
function words(options: Partial<Parameters<typeof simpleLanguage>[0]>) {
  return createHighlighter({ languages: [simpleLanguage({
    name: 'words', comments: noMatch, strings: noMatch, numbers: false, ...options,
  })] })
}

describe('word categories', () => {
  it('keeps keyword priority over duplicate literal and type terms', () => {
    const highlighter = words({ keywords: 'foo', literals: 'foo true', types: 'foo Type' })
    expect(highlighter.tokenize('foo true Type', { lang: 'words' }).tokens).toEqual([
      { className: 'keyword', value: 'foo' }, { value: ' ' },
      { className: 'literal', value: 'true' }, { value: ' ' },
      { className: 'type', value: 'Type' },
    ])
  })

  it.each([
    ['keywords', 'literals', 'keyword', 'literal'],
    ['keywords', 'types', 'keyword', 'type'],
    ['literals', 'types', 'literal', 'type'],
  ] as const)('classifies captures with only %s and %s present', (first, second, firstClass, secondClass) => {
    const highlighter = words({ [first]: 'left', [second]: 'right' })
    expect(highlighter.tokenize('left right', { lang: 'words' }).tokens).toEqual([
      { className: firstClass, value: 'left' }, { value: ' ' },
      { className: secondClass, value: 'right' },
    ])
  })

  it('uses ASCII case folding without changing category priority', () => {
    const highlighter = words({ keywords: 'foo', literals: 'FOO true', types: 'Type', insensitive: true })
    expect(highlighter.tokenize('FOO TRUE type', { lang: 'words' }).tokens.filter(t => t.className)).toEqual([
      { className: 'keyword', value: 'FOO' },
      { className: 'literal', value: 'TRUE' },
      { className: 'type', value: 'type' },
    ])
  })

  it('preserves dollar boundaries in the declared word alphabet', () => {
    const highlighter = words({ keywords: 'foo', literals: 'true', types: 'Type' })
    expect(highlighter.tokenize('$foo foo$ foo$Type true', { lang: 'words' }).tokens).toEqual([
      { value: '$foo foo$ foo$Type ' }, { className: 'literal', value: 'true' },
    ])
  })

  it('still finds a later category when an overlapping complex term is rejected', () => {
    const highlighter = words({
      keywords: 'a-b', types: 'b', beforeWords: [[/a/g, 'comment']],
    })
    expect(highlighter.tokenize('a-b', { lang: 'words' }).tokens).toEqual([
      { className: 'comment', value: 'a' }, { value: '-' }, { className: 'type', value: 'b' },
    ])
  })

  it('keeps distinct non-Unicode regex case folds for Unicode terms', () => {
    const highlighter = words({
      keywords: 'k', literals: 'K', types: 'ß ẞ', insensitive: true,
      wordCharacters: '\\wKßẞ',
    })
    expect(highlighter.tokenize('k K K ß ẞ', { lang: 'words' }).tokens.filter(t => t.className)).toEqual([
      { className: 'keyword', value: 'k' }, { className: 'keyword', value: 'K' },
      { className: 'literal', value: 'K' }, { className: 'type', value: 'ß' },
      { className: 'type', value: 'ẞ' },
    ])
  })
})

it('builds lexical regexes once on first use with a frozen definition', () => {
  const comments = /\b\B/
  const source = comments.source
  let reads = 0
  Object.defineProperty(comments, 'source', { get() { reads++; return source } })
  const language = Object.freeze(simpleLanguage({ name: 'deferred', comments, strings: noMatch, keywords: 'foo', literals: 'true' }))
  const tokenizer = language.tokenize
  const highlighter = createHighlighter({ languages: [language] })
  expect(reads).toBe(0)
  for (let i = 0; i < 2; i++) expect(highlighter.tokenize('foo true', { lang: 'deferred' }).tokens).toEqual([
    { className: 'keyword', value: 'foo' }, { value: ' ' }, { className: 'literal', value: 'true' },
  ])
  expect(reads).toBe(1)
  expect(language.tokenize).toBe(tokenizer)
})

it('can retry construction after a first-use failure', () => {
  const comments = /\b\B/
  const source = comments.source
  let reads = 0
  Object.defineProperty(comments, 'source', { get() { if (++reads === 1) throw new Error('initialization failed'); return source } })
  const language = simpleLanguage({ name: 'retry', comments, strings: noMatch, keywords: 'foo', literals: 'true' })
  const highlighter = createHighlighter({ languages: [language] })
  expect(() => highlighter.tokenize('foo', { lang: 'retry' })).toThrow('initialization failed')
  expect(highlighter.tokenize('foo', { lang: 'retry' }).tokens).toEqual([{ className: 'keyword', value: 'foo' }])
  expect(reads).toBe(2)
})


it('keeps complete prefix keywords and case-sensitive Elm literals', () => {
  const h = createHighlighter({ languages: [elm] })
  expect(h.tokenize('in infix infixl infixr inx infixlX True TRUE False FALSE', { lang: 'elm' }).tokens.filter(t => t.className).map(t => [t.value, t.className])).toEqual([
    ['in', 'keyword'], ['infix', 'keyword'], ['infixl', 'keyword'], ['infixr', 'keyword'], ['True', 'literal'], ['False', 'literal'],
  ])
})

it('keeps case-insensitive complete VB keywords and their source spelling', () => {
  const h = createHighlighter({ languages: [vbnet] })
  expect(h.tokenize('ELSE ELSEIF elseIfX BY BYREF ByVal BYREFx', { lang: 'vb' }).tokens.filter(t => t.className).map(t => [t.value, t.className])).toEqual([
    ['ELSE', 'keyword'], ['ELSEIF', 'keyword'], ['BY', 'keyword'], ['BYREF', 'keyword'], ['ByVal', 'keyword'],
  ])
})


it('keeps nested lexical spans ahead of words and numbers', () => {
  const h = words({
    comments: /\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/,
    strings: /"[^"\r\n]*"/,
    nestedComments: [['/*', '*/']], keywords: 'if', numbers: /\b\d+\b/g,
  })
  expect(h.tokenize('/* if 1 /* if 2 */ if 3 */ "if 4" if 5', { lang: 'words' }).tokens).toEqual([
    { className: 'comment', value: '/* if 1 /* if 2 */ if 3 */' }, { value: ' ' },
    { className: 'string', value: '"if 4"' }, { value: ' ' },
    { className: 'keyword', value: 'if' }, { value: ' ' }, { className: 'number', value: '5' },
  ])
})

it('leaves frozen custom collector output untouched while shielding overlaps', () => {
  const ranges = Object.freeze([
    Object.freeze({ start: 0, end: 2, className: 'type' as const }),
    Object.freeze({ start: 5, end: 7, className: 'function' as const }),
  ])
  const h = words({ strings: /"[^"\r\n]*"/, keywords: 'if', beforeWords: [() => ranges] })
  for (let i = 0; i < 2; i++) expect(h.tokenize('"if" if', { lang: 'words' }).tokens).toEqual([
    { className: 'string', value: '"if"' }, { value: ' ' }, { className: 'function', value: 'if' },
  ])
  expect(ranges.map(r => [r.start, r.end, r.className])).toEqual([[0, 2, 'type'], [5, 7, 'function']])
})


it('keeps complete word priority and leaves unknown candidates for later rules', () => {
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'candidates', comments: /\/\*[\s\S]*?\*\//, strings: /"[^"\r\n]*"/,
    keywords: 'foo', literals: 'foo true', types: 'foo Foo',
    rules: [[/(unknown)(?=\()/g, 'function', 1]],
  })] })
  expect(h.tokenize('/* foo */ "foo" foo Foo true FOO foo$ $foo unknown(17)', { lang: 'candidates' }).tokens.filter(t => t.className)).toEqual([
    { className: 'comment', value: '/* foo */' }, { className: 'string', value: '"foo"' },
    { className: 'keyword', value: 'foo' }, { className: 'type', value: 'Foo' },
    { className: 'literal', value: 'true' }, { className: 'function', value: 'unknown' },
    { className: 'number', value: '17' },
  ])
})

it('keeps native non-Unicode case folds for insensitive compiled definitions', () => {
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'folded', comments: noMatch, strings: noMatch, numbers: false,
    keywords: 'k', literals: 'K', types: 'ß ẞ', insensitive: true, wordCharacters: '\\wKßẞ',
  })] })
  expect(h.tokenize('k K K ß ẞ', { lang: 'folded' }).tokens.filter(t => t.className)).toEqual([
    { className: 'keyword', value: 'k' }, { className: 'keyword', value: 'K' },
    { className: 'literal', value: 'K' }, { className: 'type', value: 'ß' }, { className: 'type', value: 'ẞ' },
  ])
})


it('classifies prototype-like and numeric vocabulary without inherited keys', () => {
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'keys', comments: noMatch, strings: noMatch, numbers: false,
    keywords: '__proto__ constructor toString 1 10', literals: 'false', types: 'valueOf',
  })] })
  expect(h.tokenize('__proto__ constructor toString valueOf false 1 10 hasOwnProperty', { lang: 'keys' }).tokens.filter(t => t.className)).toEqual([
    { className: 'keyword', value: '__proto__' }, { className: 'keyword', value: 'constructor' },
    { className: 'keyword', value: 'toString' }, { className: 'type', value: 'valueOf' },
    { className: 'literal', value: 'false' }, { className: 'keyword', value: '1' }, { className: 'keyword', value: '10' },
  ])
})


it('preserves literal priority without a keyword category', () => {
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'categories', comments: noMatch, strings: noMatch, numbers: false,
    literals: 'yes shared', types: 'shared Type',
  })] })
  expect(h.tokenize('yes shared Type unknown', { lang: 'categories' }).tokens.filter(t => t.className)).toEqual([
    { className: 'literal', value: 'yes' }, { className: 'literal', value: 'shared' },
    { className: 'type', value: 'Type' },
  ])
})

it('classifies keyword-only definitions without claiming unknown identifiers', () => {
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'keywords', comments: noMatch, strings: noMatch, numbers: false, keywords: 'foo bar',
  })] })
  expect(h.tokenize('foo unknown foo$ $bar bar', { lang: 'keywords' }).tokens.filter(t => t.className)).toEqual([
    { className: 'keyword', value: 'foo' }, { className: 'keyword', value: 'bar' },
  ])
})


it('keeps generic nested delimiter getters live after compilation', () => {
  let pairs: Array<readonly [string, string]> = []
  let reads = 0
  const h = createHighlighter({ languages: [simpleLanguage({
    name: 'live', comments: /\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/, strings: noMatch,
    keywords: 'tail', numbers: false, get nestedComments() { reads++; return pairs },
  })] })
  const code = '/* outer /* inner */ tail */'
  expect(reads).toBe(0)
  expect(h.tokenize(code, { lang: 'live' }).tokens.filter(t => t.className).map(t => t.value)).toEqual(['/* outer /* inner */', 'tail'])
  pairs = [['/*', '*/']]
  expect(h.tokenize(code, { lang: 'live' }).tokens.filter(t => t.className).map(t => t.value)).toEqual([code])
  expect(reads).toBe(2)
})

it('keeps owned nested delimiter arrays live after releasing construction state', () => {
  const pairs: Array<readonly [string, string]> = []
  const h = createHighlighter({ languages: [compiledWordLanguage({
    name: 'owned', comments: /\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/, strings: noMatch,
    keywords: 'tail', literals: 'false', numbers: false, nestedComments: pairs,
  })] })
  const code = '/* outer /* inner */ tail */'
  expect(h.tokenize(code, { lang: 'owned' }).tokens.filter(t => t.className).map(t => t.value)).toEqual(['/* outer /* inner */', 'tail'])
  pairs.push(['/*', '*/'])
  expect(h.tokenize(code, { lang: 'owned' }).tokens.filter(t => t.className).map(t => t.value)).toEqual([code])
  pairs.length = 0
  expect(h.tokenize(code, { lang: 'owned' }).tokens.filter(t => t.className).map(t => t.value)).toEqual(['/* outer /* inner */', 'tail'])
})

it('retries owned construction and caches only after success', () => {
  const comments = /\b\B/
  const source = comments.source
  let reads = 0
  Object.defineProperty(comments, 'source', { get() { if (++reads === 1) throw new Error('owned initialization failed'); return source } })
  const definition = Object.freeze(compiledWordLanguage({ name: 'retry-owned', comments, strings: noMatch, keywords: 'foo', types: 'Type' }))
  const h = createHighlighter({ languages: [definition] })
  expect(() => h.tokenize('foo', { lang: 'retry-owned' })).toThrow('owned initialization failed')
  for (let i = 0; i < 2; i++) expect(h.tokenize('foo', { lang: 'retry-owned' }).tokens).toEqual([{ className: 'keyword', value: 'foo' }])
  expect(reads).toBe(2)
})
