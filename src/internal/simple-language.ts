import { defineLanguage } from '../core.js'
import type { TokenRange } from '../core.js'
import { collectPatternRanges } from './patterns.js'
import type { Pattern } from './patterns.js'

// Shared by the optional lexical definitions. No grammar registry or language
// data lives here, so a selective import only retains its own vocabulary.
export const cComments = /\/\/[^\r\n]*|\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/
export const quotedStrings = /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))|'(?:\\[^\r\n]|[^'\\\r\n])*(?:'|(?![\s\S]))/
export const doubleStrings = /"(?:\\[\s\S]|[^"\\])*(?:"|(?![\s\S]))/

export type SimpleLanguageOptions<Name extends string = string> = {
  name: Name
  aliases?: ReadonlyArray<string>
  comments: RegExp
  strings: RegExp
  keywords?: string
  literals?: string
  types?: string
  insensitive?: boolean
  wordCharacters?: string
  nestedComments?: ReadonlyArray<readonly [string, string]>
  beforeWords?: ReadonlyArray<Pattern>
  rules?: ReadonlyArray<Pattern>
  numberSuffix?: string
  numbers?: RegExp | false
}

export function simpleLanguage<const Name extends string>(options: SimpleLanguageOptions<Name>, wordPatterns: WordPatterns = regexWordPatterns, owned = false) {
  let pending: SimpleLanguageOptions | undefined = options
  let tokenize: ((code: string) => Array<TokenRange>) | undefined
  return defineLanguage({
    name: options.name,
    aliases: options.aliases,
    tokenize(code: string): Array<TokenRange> {
      if (!tokenize) {
        tokenize = createSimpleTokenizer(pending!, wordPatterns, owned)
        pending = undefined
      }
      return tokenize(code)
    },
  })
}

export function createSimpleTokenizer(options: SimpleLanguageOptions, wordPatterns: WordPatterns = regexWordPatterns, owned = false) {
  const flags = options.insensitive ? 'gmi' : 'gm'
  // Shield comments and strings in source order. These expressions must use
  // noncapturing groups so the first capture always identifies a comment.
  // Multiline rules use (?![\s\S]) for end of input: with the m flag, $ also
  // matches line endings and would truncate lazy strings and block comments.
  const lexical = new RegExp(`(${options.comments.source})|(?:${options.strings.source})`, flags)
  const runtime = owned ? { nestedComments: options.nestedComments } : options
  const collectLexicalRanges = function (code: string) {
    const ranges: Array<TokenRange> = [];
    lexical.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = lexical.exec(code))) {
        if (!match[0].length) {
            lexical.lastIndex++;
            continue;
        }
        let end = lexical.lastIndex;
        if (match[1] !== undefined) {
            for (const [open, close] of runtime.nestedComments || []) {
                if (!code.startsWith(open, match.index))
                    continue;
                let cursor = match.index + open.length;
                let depth = 1;
                // Walk once rather than repeatedly searching the remaining suffix
                // for an opener while unwinding many nested closing delimiters.
                while (depth && cursor < code.length) {
                    if (code.startsWith(open, cursor)) {
                        depth++;
                        cursor += open.length;
                    }
                    else if (code.startsWith(close, cursor)) {
                        depth--;
                        cursor += close.length;
                    }
                    else {
                        cursor++;
                    }
                }
                end = cursor;
                lexical.lastIndex = end;
                break;
            }
        }
        ranges.push({ start: match.index, end, className: match[1] !== undefined ? 'comment' : 'string' });
    }
    return ranges;
}
  const patterns: Array<Pattern> = []
  patterns.push(...options.beforeWords || [])
  const wordCharacters = options.wordCharacters || '\\w$'
  patterns.push(...wordPatterns(options, flags, wordCharacters))
  patterns.push(...options.rules || [])
  if (options.numbers !== false) patterns.push([options.numbers || new RegExp(String.raw `(?<![\w.])(?:0[xX][\da-fA-F]+|0[bB][01]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?)${options.numberSuffix || ''}(?![\w.])`, 'g'), 'number'])
  return (code: string) => {
    // Lexical matches are fresh and non-overlapping, reuse their owned array.
    const ranges = collectLexicalRanges(code)
    return collectPatternRanges(code, patterns, ranges, undefined, ranges)
  }
}

export function wordCategories(options: SimpleLanguageOptions) {
  return [['keyword', options.keywords], ['literal', options.literals], ['type', options.types]] as const
}

type WordPatterns = (options: SimpleLanguageOptions, flags: string, wordCharacters: string) => ReadonlyArray<Pattern>

function regexWordPatterns(options: SimpleLanguageOptions, flags: string, wordCharacters: string) {
  const patterns: Array<Pattern> = []
  for (const [className, words] of [
    ['keyword', options.keywords], ['literal', options.literals], ['type', options.types],
  ] as const) {
    if (words) patterns.push([new RegExp(`(?<![${wordCharacters}])(?:${words.split(/\s+/).map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![${wordCharacters}])`, flags), className])
  }
  return patterns
}
