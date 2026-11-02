import { describe, expect, it } from 'vitest'
import { collectPatternRanges, type Pattern } from '../src/internal/patterns'

describe('pattern regex state', () => {
  it('resumes the outer regex after a classifier reenters the same patterns', () => {
    const regex = /[a-z]+/g
    regex.lastIndex = 3
    let calls = 0
    const patterns: Array<Pattern> = [[regex, function (match) {
        if (++calls > 10)
            throw new Error('Regex cursor did not resume');
        if (match[0] === 'outer') {
            expect(collectPatternRanges('inner', patterns)).toEqual([
                { start: 0, end: 5, className: 'string' },
            ]);
        }
        return 'string';
    }]]
    expect(collectPatternRanges('outer tail', patterns)).toEqual([
      { start: 0, end: 5, className: 'string' },
      { start: 6, end: 10, className: 'string' },
    ])
    expect(regex.lastIndex).toBe(3)
  })

  it('preserves the caller regex cursor when a classifier throws', () => {
    const regex = /word/g
    regex.lastIndex = 2
    expect(() => collectPatternRanges('word', [[regex, function () { throw new Error('classifier failed'); }]])).toThrow('classifier failed')
    expect(regex.lastIndex).toBe(2)
  })

  it('matches every occurrence of a non-global pattern without changing its cursor', () => {
    const regex = /x/i
    regex.lastIndex = 5
    expect(collectPatternRanges('x X', [[regex, 'keyword']])).toEqual([
      { start: 0, end: 1, className: 'keyword' },
      { start: 2, end: 3, className: 'keyword' },
    ])
    expect(regex.lastIndex).toBe(5)
  })

  it('finishes empty matches and restores the original cursor', () => {
    const regex = /(?:)/g
    regex.lastIndex = 8
    expect(collectPatternRanges('abc', [[regex, 'string']])).toEqual([])
    expect(regex.lastIndex).toBe(8)
  })

  it('keeps collector and regex rules in their original priority order', () => {
    expect(collectPatternRanges('foo bar', [
      [/foo/g, 'keyword'],
      () => [
        { start: 0, end: 3, className: 'string' },
        { start: 4, end: 7, className: 'comment' },
      ],
    ])).toEqual([
      { start: 0, end: 3, className: 'keyword' },
      { start: 4, end: 7, className: 'comment' },
    ])
  })

  it('uses captured suffix offsets without emitting a consumed prefix', () => {
    expect(collectPatternRanges('one two', [[/(^|[^A-Za-z])([A-Za-z]+)/g, 'type', 2]])).toEqual([
      { start: 0, end: 3, className: 'type' },
      { start: 4, end: 7, className: 'type' },
    ])
  })

  it.each([undefined, 0, NaN])('treats a falsy group index %j as the full match', (group) => {
    expect(collectPatternRanges('x', [[/x/g, 'string', group]])).toEqual([
      { start: 0, end: 1, className: 'string' },
    ])
  })

  it('skips an empty capture while still advancing the full regex match', () => {
    const regex = /(x)()/g
    regex.lastIndex = 4
    expect(collectPatternRanges('xxx', [[regex, 'string', 2]])).toEqual([])
    expect(regex.lastIndex).toBe(4)
  })

})
