---
title: Embedded Languages
---

# Embedded Languages

An embedded language is a range owned by one language but tokenized by another registered definition.

## Markup

HTML, Vue, and Svelte recognize script and style regions:

```html
<script>
  const ready = true
</script>

<style>
  .button { color: red }
</style>
```

Register each tokenizer you want used:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { ts } from '@tanstack/highlight/languages/ts'
import { vue } from '@tanstack/highlight/languages/vue'

const highlighter = createHighlighter({
  languages: [css, html, js, ts, vue],
})
```

Default `<script>` bodies use JavaScript. `<script lang="ts">` uses TypeScript. `<style>` uses CSS.

If the target definition is absent, the body remains plain text while the outer markup still highlights.

## Compare embedded languages

Switch the outer language to see registered JavaScript, TypeScript, and CSS tokenizers handle each embedded region.

```ts group=highlight-embedded-languages file=/src/main.ts entry env=client
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { markdown } from '@tanstack/highlight/languages/markdown'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { vue } from '@tanstack/highlight/languages/vue'
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

const samples = {
  html: [
    '<script>',
    '  const ready = true',
    '</script>',
    '',
    '<style>',
    '  .button { color: tomato }',
    '</style>',
  ].join('\n'),
  vue: [
    '<script lang="ts">',
    '  const user: { name: string } = { name: "Ada" }',
    '</script>',
    '',
    '<template><p>{{ user.name }}</p></template>',
  ].join('\n'),
  markdown: [
    '# Typed button',
    '',
    '```tsx',
    'const button = <button>Save</button>',
    '```',
  ].join('\n'),
}

const highlighter = createHighlighter({
  languages: [css, html, js, markdown, ts, tsx, vue],
})
const themeCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '.dark',
})

export default function render(output: HTMLElement) {
  const style = document.createElement('style')
  style.textContent = `${themeCss}
body { margin: 0; padding: 24px; font-family: ui-sans-serif, system-ui; }
.demo { overflow: hidden; border: 1px solid color-mix(in srgb, currentColor 16%, transparent); border-radius: 12px; }
.tabs { display: flex; gap: 4px; padding: 8px; border-bottom: 1px solid color-mix(in srgb, currentColor 16%, transparent); }
.tabs button { padding: 6px 10px; border: 0; border-radius: 7px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.tabs button[aria-pressed="true"] { background: color-mix(in srgb, currentColor 12%, transparent); font-weight: 600; }
pre.th-code { margin: 0; min-height: 180px; }
code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 14px; line-height: 1.6; }`

  document.head.append(style)
  output.innerHTML = `<section class="demo">
  <div class="tabs">
    <button type="button" data-lang="html" aria-pressed="true">HTML</button>
    <button type="button" data-lang="vue" aria-pressed="false">Vue</button>
    <button type="button" data-lang="markdown" aria-pressed="false">Markdown</button>
  </div>
  <div class="output"></div>
</section>`

  const codeOutput = output.querySelector('.output')
  const buttons = output.querySelectorAll<HTMLButtonElement>('[data-lang]')

  function renderLanguage(lang: keyof typeof samples) {
    if (!(codeOutput instanceof HTMLElement)) return
    codeOutput.innerHTML = highlighter.highlight(samples[lang], { lang }).html
    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang))
    })
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang
      if (lang === 'html' || lang === 'vue' || lang === 'markdown') {
        renderLanguage(lang)
      }
    })
  })

  renderLanguage('html')
}
```

## Vue expressions

Vue moustache expressions delegate to JavaScript when it is registered:

```vue
<p>{{ user.name }}</p>
```

## Svelte expressions

Svelte brace expressions delegate to JavaScript. Svelte control tags remain markup control syntax rather than ordinary JavaScript expressions.

## EJS

EJS regions delegate to JavaScript when available:

```ejs
<% if (user) { %>
  <h1><%= user.name %></h1>
<% } %>
```

## PHP

Register `php` to highlight PHP code, including tagless excerpts. Inputs containing `<?php` or `<?=` are treated as documents, with text outside the PHP tags delegated to `html` only when it is registered. Legacy `<?` short tags aren't recognized.

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'
import { php } from '@tanstack/highlight/languages/php'

const highlighter = createHighlighter({ languages: [php, html] })
const result = highlighter.highlight('<p><?= $name ?></p>', { lang: 'php' })
```

PHP does not import HTML. Register `js`, `ts`, and `css` too when the surrounding HTML contains script or style blocks. Quoted strings, including interpolation, and heredoc/nowdoc bodies stay string tokens; Highlight doesn't parse the expressions inside them.

## Markdown fences

The Markdown definition reads the fence info string and delegates the body:

````md
```tsx
const node = <Button />
```
````

Both `markdown` and `tsx` must be registered. Unknown fence languages receive the `code-inline` class without another tokenizer.

## Recursive template interpolation

JavaScript and TypeScript templates are recursive rather than cross-language embeddings:

```ts
const label = `Hello ${user.name.toUpperCase()} ${`#${count}`}`
```

String chunks remain strings. `${` and `}` are operators, and expression bodies return to the script tokenizer, including nested templates.

## Why dependencies are optional

Making HTML import JavaScript and CSS would be convenient but would defeat selective modules. Optional delegation keeps import cost explicit and lets a site register one shared JavaScript definition for HTML, Vue, Svelte, EJS, and Markdown.

This is a focused delegation system, not a general recursive grammar DSL. See [Architecture](../architecture) for the boundary.
