# Tokenizer Contracts and Patterns

## Public Types

```ts
type TokenRange = {
  className: HighlightTokenClass
  end: number
  start: number
}

type TokenizerContext = {
  hasLanguage: (lang: string) => boolean
  tokenize: (code: string, lang: string) => Array<TokenRange>
}

type LanguageDefinition<Name extends string = string> = {
  aliases?: ReadonlyArray<string>
  name: Name
  tokenize: (
    code: string,
    context: TokenizerContext,
  ) => ReadonlyArray<TokenRange>
}
```

`defineLanguage()` is an identity helper that preserves the literal `name` type.

## Range Normalization

The core:

1. Clamps each start and end into the source bounds.
2. Sorts candidates by `start`.
3. Drops empty ranges.
4. Drops a range when its start is before the previously accepted end.
5. Preserves gaps as unclassified source tokens.

Return non-overlapping ranges. Input order only remains relevant for equal starts under the runtime's stable sort; it does not make a later-start specific range override an earlier broad range.

## Shipped-Language Helpers

Repository-owned language definitions can use `src/internal/patterns.ts`:

- `patternTokenizer(patterns)` creates a tokenizer from collectors and regex patterns.
- `collectPatternRanges(code, patterns, initial)` applies patterns in priority order using an occupied-byte map.
- `addRange(ranges, occupied, range)` rejects invalid or overlapping ranges.
- `offsetRanges(ranges, offset)` maps delegated ranges into outer source coordinates.

These helpers are internal and are not package exports. Application-defined languages should implement their own small non-overlapping scanner.

## Delegation

- Call `context.hasLanguage(name)` before delegation.
- Call `context.tokenize(substring, name)` only for a registered target.
- Offset every delegated range into outer coordinates.
- Do not import target language definitions from an outer definition.
- Recursion stops after 24 nested tokenizer calls.

## Semantic Token Classes

Definitions can emit:

`attr`, `code-inline`, `command`, `comment`, `deleted`, `function`, `heading`, `inserted`, `keyword`, `link`, `literal`, `meta`, `number`, `operator`, `property`, `selector`, `string`, `tag`, `type`, and `variable`.

## Repository Quality Gates

For a shipped definition:

1. Add an isolated `src/languages/<name>.ts` module.
2. Add its explicit package export through the existing wildcard.
3. Add common valid-code fixtures.
4. Assert token concatenation reconstructs source exactly.
5. Add focused regressions for context-aware scanning.
6. Include it in the all-language registry only when intended.
7. Run `pnpm run test`, `pnpm run size`, and `pnpm run bench`.

The target is useful highlighting for valid documentation code, not compiler or IDE grammar conformance.
