import { expect, it } from 'vitest'
import { yaml } from '../src/languages/yaml'

const context = { hasLanguage: () => false, tokenize: () => [] }

it.each(['\n', '\r\n'])('keeps blank and trailing whitespace inside a scalar with %j endings', (ending) => {
  const code = ['message: |', '  first   ', ' \t\u00a0\ufeff', '  second  ', 'next: 1', ''].join(ending)
  const ranges = yaml.tokenize(code, context)
  expect(ranges[0]).toEqual({
    start: code.indexOf(ending) + ending.length,
    end: code.indexOf('next: 1'),
    className: 'string',
  })
})

it('counts Unicode indentation independently of trailing whitespace', () => {
  const code = '\u2003message: >\n\u2003\u2003body \t\n\u2003next: 1\n'
  expect(yaml.tokenize(code, context)[0]).toEqual({
    start: code.indexOf('\n') + 1,
    end: code.indexOf('\u2003next: 1'),
    className: 'string',
  })
})

it('retains overlapping nested scalar ranges in their original order', () => {
  const code = 'outer: |\n  inner: >\n    text  \nnext: 1\n'
  expect(yaml.tokenize(code, context).slice(0, 2)).toEqual([
    { start: code.indexOf('\n') + 1, end: code.indexOf('next: 1'), className: 'string' },
    { start: code.indexOf('    text'), end: code.indexOf('next: 1'), className: 'string' },
  ])
})

it('uses LF boundaries while retaining other line separators in scalar text', () => {
  const code = 'message: |\n  alpha\u2028beta\u2029gamma\rdelta  \nnext: 1\n'
  expect(yaml.tokenize(code, context)[0]).toEqual({
    start: code.indexOf('\n') + 1,
    end: code.indexOf('next: 1'),
    className: 'string',
  })
})
