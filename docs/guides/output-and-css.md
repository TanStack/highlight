---
title: Output and CSS
---

# Output and CSS

TanStack Highlight separates tokenization from presentation. Languages emit semantic classes; CSS decides colors and font styles.

## Highlight result

```ts
const result = highlighter.highlight(code, { lang: 'tsx' })
```

```ts
type HighlightResult = {
  code: string
  lang: string
  tokens: Array<HighlightToken>
  html: string
}
```

`code` is the original input. Concatenating every `token.value` reconstructs it exactly.

## HTML contract

Without line wrappers:

```html
<pre class="th-code th-code--tsx" data-language="tsx">
  <code>
    <span class="th-token th-keyword">const</span>
    ...
  </code>
</pre>
```

With line numbers or line decorations:

```html
<pre class="th-code th-code--tsx th-code--line-numbers" data-language="tsx">
  <code>
    <span class="th-line" data-line="1">...</span>
  </code>
</pre>
```

Line wrappers are omitted unless they are needed, reducing the normal output size.

## Semantic token classes

| Class | Typical use |
| --- | --- |
| `th-attr` | Markup attributes |
| `th-code-inline` | Inline Markdown or unparsed fenced code |
| `th-command` | Shell and Docker commands |
| `th-comment` | Comments |
| `th-deleted` | Deleted diff lines |
| `th-function` | Function declarations and calls |
| `th-heading` | Markdown headings and TOML tables |
| `th-inserted` | Inserted diff lines |
| `th-keyword` | Language keywords and directives |
| `th-link` | Markdown links |
| `th-literal` | Booleans, nulls, regex literals |
| `th-meta` | Diff/fence/protocol metadata |
| `th-number` | Numeric values |
| `th-operator` | Template boundaries and diagram arrows |
| `th-property` | Object properties, headers, config keys |
| `th-selector` | CSS selectors |
| `th-string` | Strings and protected scalar bodies |
| `th-tag` | Markup tags |
| `th-type` | Type names and annotations |
| `th-variable` | Shell, CSS, and config variables |

Every token span also receives `th-token`.

## Rendering without HTML

Use `tokenize()` for another renderer:

```ts
const { tokens } = highlighter.tokenize(code, { lang: 'ts' })
```

Use `renderTokens()` to convert tokens and decorations into render nodes:

```ts
import { renderTokens } from '@tanstack/highlight/core'

const nodes = renderTokens(tokens, {
  lineNumbers: true,
  decorations,
})
```

`renderNodesToHtml(nodes)` converts those nodes to escaped inline markup. `tokensToHast()` from the Markdown entry converts tokens to a complete HAST `<pre><code>` tree.

## Escaping and trust

- Code text is HTML-escaped.
- Language names and decoration values are attribute-escaped.
- Decoration data keys are normalized before becoming `data-*` names.
- Plaintext output contains no token spans.

This protects the generated code block. It does not sanitize unrelated raw HTML in a Markdown document.

## Custom CSS

You can skip `createThemeCss()` and target classes directly:

```css
.th-code {
  overflow-x: auto;
  background: #fff;
  color: #24292f;
}

.th-keyword { color: #cf222e; font-weight: 600; }
.th-string { color: #0a3069; }
.th-comment { color: #6e7781; font-style: italic; }
```

Theme objects cover colors only. Font style, contrast policy, spacing, line highlighting, and copy controls remain application CSS and UI concerns.
