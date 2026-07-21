---
title: Quick Start
---

# Quick Start

This setup creates a small isomorphic highlighter for common TypeScript documentation.

## 1. Create the highlighter

```ts
// src/highlight.ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, js, ts, tsx],
})
```

Registering `js` and `css` also lets `html` delegate `<script>` and `<style>` bodies to those tokenizers.

## 2. Highlight code

```ts
import { highlighter } from './highlight'

const result = highlighter.highlight(
  `export function Greeting() {
  return <h1>Hello</h1>
}`,
  { lang: 'tsx' },
)

document.querySelector('#example')!.innerHTML = result.html
```

Only insert `result.html` when it came directly from TanStack Highlight. The source code itself is escaped by the renderer.

## 3. Add a theme

Generate theme CSS during your build or application setup:

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const highlightCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '.dark',
})
```

Add the returned CSS once. Theme changes do not require another highlighting pass.

## 4. Use the same module during SSR and hydration

```ts
// Server render
const serverHtml = highlighter.highlight(code, { lang }).html

// Client render for newly loaded content
const clientHtml = highlighter.highlight(code, { lang }).html
```

There is no initialization promise. Keep one highlighter instance at module scope and reuse it.

## 5. Add Markdown integration

For a unified pipeline, pass the same highlighter explicitly:

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

const plugin = remarkHighlightCodeBlocks({ highlighter })
```

Next, read [Language Registration](guides/language-registration), [Themes](guides/themes), or [Markdown Pipelines](guides/markdown-pipelines).
