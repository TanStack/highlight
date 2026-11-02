import type { HighlightTokenClass } from '../core.js'
import { simpleLanguage, wordCategories } from './simple-language.js'
import type { SimpleLanguageOptions } from './simple-language.js'

export { simpleLanguage as simpleWordLanguage, simpleLanguage as nativeCompiledWordLanguage } from './simple-language.js'

export function canCombineWords(options: SimpleLanguageOptions) {
  const categories = wordCategories(options).filter(
    (entry): entry is typeof entry & readonly [HighlightTokenClass, string] => Boolean(entry[1]),
  )
  const terms = categories.flatMap(([, words]) => words.split(/\s+/))
  const characters = options.wordCharacters || '\\w$'
  const wholeWord = new RegExp(`^[${characters}]+$`, options.insensitive ? 'i' : '')
  return categories.length > 1 && terms.every(word =>
    word.length && wholeWord.test(word) && (!options.insensitive || /^[\x00-\x7f]+$/.test(word)))
}



export function compiledWordLanguage<const Name extends string>(options: SimpleLanguageOptions<Name>) {
  return simpleLanguage(options, options.insensitive ? undefined : mapWordPatterns, true)
}

function mapWordPatterns(options: SimpleLanguageOptions, flags: string, wordCharacters: string) {
  // These definitions satisfy canCombineWords, each match is a complete word.
  const known = new Set<string>()
  const classes = new Map<string, HighlightTokenClass>()
  for (const [className, words] of wordCategories(options)) {
    if (words) for (const word of words.split(/\s+/)) {
      if (known.has(word)) continue
      known.add(word)
      if (className !== 'keyword') classes.set(word, className)
    }
  }
  // The regex admits only known terms, missing class entries are keywords.
  const regex = new RegExp(`(?<![${wordCharacters}])(?:${[...known].map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![${wordCharacters}])`, flags)
  return [[regex, (match: RegExpExecArray) => classes.get(match[0]) || 'keyword']] as const
}
