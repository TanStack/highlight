import { describe, expect, it } from 'vitest'
import { highlight, listLanguages, normalizeLanguage } from '../src/index'
import fixtureData from './generated/tanstack-doc-fixtures.json'

type DocFixture = {
  file: string
  line: number
  rawLang: string
  lang: string
  code: string
}

const fixtures = fixtureData.fixtures as Array<DocFixture>

describe('real TanStack docs fixtures', () => {
  it('covers every normalized language target with sampled docs code', () => {
    const fixtureLanguages = new Set(fixtures.map((fixture) => fixture.lang))

    for (const language of listLanguages()) {
      expect(fixtureLanguages, `missing real docs fixture for ${language}`).toContain(language)
    }
  })

  it('normalizes sampled raw fence tags to their generated target', () => {
    for (const fixture of fixtures) {
      expect(normalizeLanguage(fixture.rawLang), `${fixture.file}:${fixture.line}`).toBe(fixture.lang)
    }
  })

  it('renders sampled docs code as one themeable, escaped html tree', () => {
    const highlightedLanguages = new Set<string>()

    for (const fixture of fixtures) {
      const result = highlight(fixture.code, { lang: fixture.rawLang })
      const context = `${fixture.file}:${fixture.line} (${fixture.rawLang} -> ${fixture.lang})`

      expect(result.lang, context).toBe(fixture.lang)
      expect(result.html, context).toContain(`data-language="${fixture.lang}"`)
      expect(result.html.match(/<pre/g), context).toHaveLength(1)
      expect(result.html.match(/<code/g), context).toHaveLength(1)
      expect(result.html, context).not.toContain('style=')
      expect(result.html, context).not.toContain('class="language-')
      expect(
        result.tokens.map((token) => token.value).join(''),
        `${context} must preserve every source character`,
      ).toBe(fixture.code)
      expect(result.html, context).not.toMatch(/<(?:IfModule|VirtualHost|button|div|h1|script|section|template)\b/i)

      if (fixture.lang === 'plaintext') {
        expect(result.html, context).not.toContain('<span')
      } else if (result.html.includes('class="th-token')) {
        highlightedLanguages.add(fixture.lang)
      }
    }

    for (const language of listLanguages()) {
      if (language === 'plaintext') continue
      expect(highlightedLanguages, `${language} should highlight at least one real docs fixture`).toContain(language)
    }
  })
})
