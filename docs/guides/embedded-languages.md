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
