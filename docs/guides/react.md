---
title: React Integration
---

# React Integration

TanStack Highlight has no React runtime dependency. The React entry only prepares a generic data shape for an application-owned code block component.

## Create component props

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

const props = createHighlightedCodeBlockProps({
  highlighter,
  code: `const answer = 42`,
  lang: 'ts',
  title: 'answer.ts',
  className: 'docs-code',
})
```

The result contains `copyText`, `htmlMarkup`, `lang`, `title`, `tokens`, and the optional `className`.

## Application component

```tsx
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
}: HighlightedCodeBlockProps) {
  return (
    <figure className={className}>
      {title ? <figcaption>{title}</figcaption> : null}
      <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
      <button type="button" onClick={() => navigator.clipboard.writeText(copyText)}>
        Copy
      </button>
    </figure>
  )
}
```

`htmlMarkup` is escaped output produced by the library. Do not pass arbitrary user HTML through the same prop.

## Run the component

This complete example keeps the application component separate from highlighting and updates it as the source changes.

```tsx group=highlight-react file=/src/CodeBlock.tsx
import { useState } from 'react'
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
}: HighlightedCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
    void navigator.clipboard?.writeText(copyText).catch(() => undefined)
  }

  return (
    <figure className={className}>
      <figcaption>
        <span>{title}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
    </figure>
  )
}
```

```tsx group=highlight-react file=/src/main.tsx entry env=react
import { useState } from 'react'
import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'
import { CodeBlock } from './CodeBlock'
import './styles.css'

const highlighter = createHighlighter({ languages: [ts] })
const initialSource = [
  'type User = { name: string }',
  '',
  'export function greet(user: User) {',
  '  return `Hello, ${user.name}`',
  '}',
].join('\n')

const themeCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  darkSelector: '.dark',
})

export default function App() {
  const [source, setSource] = useState(initialSource)
  const props = createHighlightedCodeBlockProps({
    highlighter,
    code: source,
    lang: 'ts',
    title: 'greeting.ts',
    className: 'code-block',
  })

  return (
    <>
      <style>{themeCss}</style>
      <main>
        <label htmlFor="source">TypeScript source</label>
        <textarea
          id="source"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
        />
        <CodeBlock {...props} />
      </main>
    </>
  )
}
```

```css group=highlight-react file=/src/styles.css
:root {
  font-family: ui-sans-serif, system-ui;
}

body {
  margin: 0;
  padding: 24px;
}

main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px 16px;
}

label {
  grid-column: 1;
  font-size: 13px;
  font-weight: 600;
}

textarea {
  grid-column: 1;
  min-height: 190px;
  box-sizing: border-box;
  padding: 14px;
  resize: vertical;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 12px;
  background: var(--notebook-background);
  color: var(--notebook-foreground);
  font: 14px/1.6 ui-monospace, SFMono-Regular, Consolas, monospace;
}

.code-block {
  grid-column: 2;
  grid-row: 1 / span 2;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 12px;
}

figcaption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
}

button {
  padding: 5px 9px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 7px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

pre.th-code {
  min-height: 158px;
  margin: 0;
}

code {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  main {
    grid-template-columns: 1fr;
  }

  label,
  textarea,
  .code-block {
    grid-column: 1;
    grid-row: auto;
  }
}
```

## SSR

Call `createHighlightedCodeBlockProps()` during server rendering. The returned markup is deterministic, so React can hydrate the surrounding component without rerunning highlighting.

## Why this is not a component package

Code blocks differ substantially across documentation systems: copy controls, filenames, tabs, collapsible sections, line callouts, and responsive behavior all belong to the application. The helper keeps highlighting generic instead of imposing TanStack-specific UI props.

You can skip the React helper and call `highlighter.renderCodeBlockData()` directly; they return the same core data plus `className` handling.
