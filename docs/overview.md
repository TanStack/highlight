---
title: Overview
---

# TanStack Highlight

TanStack Highlight is a tiny, synchronous syntax highlighter designed specifically for blogs and documentation.

It occupies the space between minimal JavaScript-only scanners and full grammar engines:

- Import only the languages your site uses.
- Run the same highlighter during SSR and after hydration.
- Emit one escaped, class-based HTML tree for every theme.
- Highlight common embedded regions without bundling a grammar runtime.
- Decorate lines and character ranges with ordinary classes and `data-*` attributes.

## Why another highlighter?

A documentation site may need TypeScript, markup, shell commands, and configuration files in the same page. TanStack Highlight lets you register that mix of languages, render code during SSR, and highlight new samples in the browser with the same synchronous API.

Its tokenizers target common, valid documentation samples. They do not provide automatic language detection, editor state, semantic language-service tokens, or TextMate compatibility. See [Comparison](comparison) if you need those capabilities.

## Core principles

### Selective imports

The `@tanstack/highlight/core` entry contains no shipped languages. Every language is an isolated `LanguageDefinition` under `@tanstack/highlight/languages/*`.

### Isomorphic

There is no WebAssembly, worker, filesystem dependency, or asynchronous initialization. A highlighter created from the same registrations and options returns the same result in Node.js and the browser.

### One semantic HTML tree

Highlighting emits stable `th-*` classes instead of token colors. Light and dark themes are CSS variable sets applied to the same markup.

### Context where it matters

Most languages use small priority patterns. JavaScript templates, JSX, markup embeddings, shell heredocs, and similar cases use focused stateful scanners. The library does not contain a general grammar interpreter.

## Output

```ts
import { highlight } from '@tanstack/highlight'

const result = highlight(`const answer = 42`, { lang: 'ts' })

result.code
result.lang
result.tokens
result.html
```

The HTML contract is one escaped `<pre><code>` tree:

```html
<pre class="th-code th-code--ts" data-language="ts">
  <code>...</code>
</pre>
```

## Choose your starting point

- Continue to [Installation](installation) for package and runtime requirements.
- Use [Quick Start](quick-start) to build a selective highlighter and theme.
- Read [Comparison](comparison) to decide whether this tradeoff fits your project.
- Review [Language Support](language-support) before adopting it for an existing docs corpus.
