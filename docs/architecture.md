# Architecture

## Registry

The core knows nothing about shipped languages. `createHighlighter()` builds a name and alias registry from explicit `LanguageDefinition` objects. The root entry constructs the same registry with every shipped definition.

A language returns ordered, non-overlapping character ranges with semantic token classes. Untokenized characters are preserved as plain text.

## Context Instead Of A Grammar Runtime

Most languages use priority-ordered regular expressions. Three cases use small stateful scanners because regex-only matching loses necessary context:

- JavaScript and TypeScript strings, comments, regular expressions, JSX tags, and recursive template interpolation
- Markup tags, attributes, and embedded script/style regions
- Shell heredocs and parameter expansions

This is the package's complexity boundary. It deliberately does not implement TextMate repositories, captures, scopes, backreferences, or a general recursive grammar DSL.

## Embedded Languages

Embedding means one language delegates a character range to another registered language:

- HTML/Vue/Svelte `<script>` bodies delegate to JavaScript or TypeScript.
- HTML/Vue/Svelte `<style>` bodies delegate to CSS.
- Markdown fences delegate using their info string.
- EJS expression regions delegate to JavaScript.

Dependencies remain optional. Importing HTML alone highlights markup. Registering HTML and JavaScript additionally highlights script bodies. This keeps the module graph explicit and tree-shakeable.

## Recursive Tokenization

JavaScript template interpolation is recursive rather than merely embedded. A template string owns its string chunks, then `${...}` delegates back to the script tokenizer. Nested templates repeat the same process.

The recursion depth has a small guard for pathological input. Normal nesting does not allocate a parser or grammar object.

## Rendering

Tokenization and rendering are separate:

1. A language emits token ranges.
2. The core fills gaps to create a source-preserving token stream.
3. Optional line/range decorations split rendering boundaries without mutating tokens.
4. HTML or HAST renderers escape text and attributes.

Themes are CSS variables over stable semantic classes. Theme selection never changes tokenization or duplicates markup.

## Quality Boundary

The target is valid code commonly published in documentation, not every legal program. A supported behavior needs:

- A focused regression test for context-sensitive cases
- Source reconstruction from emitted tokens
- At least one real docs fixture for the language
- No violation of the bundle and throughput budgets

New language support should be isolated, useful on real docs, and cheap enough to remain optional. A request that requires a general grammar engine belongs in Shiki, highlight.js, or Prism instead.
