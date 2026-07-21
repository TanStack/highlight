import { describe, expect, it } from 'vitest'
import {
  highlight,
  highlightToHtml,
  listLanguages,
  normalizeLanguage,
  renderCodeBlockData,
} from '../src/index'
import { languageFixtures } from './fixtures'

describe('language inventory', () => {
  it('normalizes every language used across TanStack docs', () => {
    for (const fixture of languageFixtures) {
      expect(normalizeLanguage(fixture.lang)).toBe(fixture.normalized)
    }

    expect(normalizeLanguage('sh')).toBe('shell')
    expect(normalizeLanguage('shell')).toBe('shell')
    expect(normalizeLanguage('txt')).toBe('plaintext')
    expect(normalizeLanguage('text')).toBe('plaintext')
    expect(normalizeLanguage('-->')).toBe('plaintext')
    expect(normalizeLanguage('md')).toBe('markdown')
    expect(normalizeLanguage('angular-html')).toBe('html')
    expect(normalizeLanguage('xml')).toBe('html')
    expect(normalizeLanguage('js-vue')).toBe('js')
    expect(normalizeLanguage('unknown-language')).toBe('plaintext')
  })

  it('lists the normalized support targets once', () => {
    const languages = listLanguages()
    expect(new Set(languages).size).toBe(languages.length)

    for (const fixture of languageFixtures) {
      expect(languages).toContain(fixture.normalized)
    }
  })
})

describe('output contract', () => {
  it('returns one css-themeable html tree with no inline color/style', () => {
    const result = highlight(`const value = '<unsafe>'`, { lang: 'ts' })

    expect(result.lang).toBe('ts')
    expect(result.html).toContain('<pre')
    expect(result.html).toContain('<code')
    expect(result.html).toContain('class="th-code')
    expect(result.html).toContain('data-language="ts"')
    expect(result.html).not.toContain('style=')
    expect(result.html).not.toContain('<unsafe>')
    expect(result.html).toContain('&lt;unsafe&gt;')
  })

  it('does not duplicate markup for dual themes', () => {
    const html = highlightToHtml(`const value = 'dual'`, { lang: 'ts' })

    expect(html.match(/<pre/g)).toHaveLength(1)
    expect(html.match(/<code/g)).toHaveLength(1)
    expect(html.match(/dual/g)).toHaveLength(1)
  })

  it('emits deterministic semantic token classes for docs languages', () => {
    for (const fixture of languageFixtures) {
      const result = highlight(fixture.code, { lang: fixture.lang })

      expect(result.lang).toBe(fixture.normalized)
      expect(result.html).toContain(`data-language="${fixture.normalized}"`)

      for (const className of fixture.expectedClasses) {
        expect(result.html, `${fixture.lang} should emit ${className}`).toContain(className)
      }
    }
  })

  it('keeps plaintext escaped and span-free', () => {
    const result = highlight(`No <b>HTML</b> here`, { lang: 'txt' })

    expect(result.lang).toBe('plaintext')
    expect(result.html).toContain('No &lt;b&gt;HTML&lt;/b&gt; here')
    expect(result.html).not.toContain('<span')
  })

  it('keeps comment markers inside strings and quotes inside comments', () => {
    const cases = [
      ['ts', `const url = "https://example.com" // "comment"`],
      ['python', `value = "# not a comment" # "comment"`],
      ['shell', `echo "# not a comment" # "comment"`],
      ['yaml', `url: "https://example.com/#hash" # "comment"`],
    ] as const

    for (const [lang, code] of cases) {
      const result = highlight(code, { lang })

      expect(result.html, lang).toContain('th-string')
      expect(result.html, lang).toContain('th-comment')
      expect(result.html, lang).toContain('&quot;comment&quot;</span>')
    }
  })

  it('only treats attributes and tags as markup syntax', () => {
    const assignment = highlight(`const value = other < button`, { lang: 'tsx' })
    const element = highlight(`<button type="button" />`, { lang: 'tsx' })

    expect(assignment.html).not.toContain('th-attr')
    expect(assignment.html).not.toContain('th-tag')
    expect(assignment.html).not.toContain('th-number')
    expect(element.html).toContain('th-tag')
    expect(element.html).toContain('th-attr')
  })

  it('returns a tanstack.com-compatible code block data shape', () => {
    const data = renderCodeBlockData({
      code: `const value = 'copy'\n\n`,
      lang: 'typescript',
      title: 'example.ts',
    })

    expect(data.copyText).toBe(`const value = 'copy'`)
    expect(data.lang).toBe('ts')
    expect(data.title).toBe('example.ts')
    expect(data.htmlMarkup).toContain('data-language="ts"')
    expect(data.htmlMarkup.match(/<pre/g)).toHaveLength(1)
    expect(data.htmlMarkup).not.toContain('style=')
  })
})
